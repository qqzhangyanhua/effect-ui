"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type UIEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Fable, Skiff, and Whop (via Mobbin), original implementation.
 * https://mobbin.com/screens/d3d6150a-1ae3-486f-b3a1-5bd21bc0cf7b
 * https://mobbin.com/screens/db295f78-96ac-4311-a740-56a60de1997b
 * https://mobbin.com/screens/ec7496bf-3b80-451f-9298-a9e68554eee4
 */

export interface MarginBookmarkNotchProps {
  pace?: number
  intensity?: number
  snapNotches?: number
  side?: "start" | "end"
  className?: string
  onValueChange?: (state: { progress: number; passage: number }) => void
}

export type MarginSide = "start" | "end"

export const NOTCH_COLUMN = 240

export const BOOKMARK_PARAS = [
  { id: "b1", title: "First passage", body: "A short paragraph at the start of the page." },
  { id: "b2", title: "Second passage", body: "The notch can rest beside this passage." },
  { id: "b3", title: "Third passage", body: "Drag the notch or press the arrow keys to move it." },
  { id: "b4", title: "Fourth passage", body: "The mark stays small and clear of the words." },
] as const

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function roundProgress(value: number) {
  return Math.round(clamp(value, 0, 1) * 1000) / 1000
}

export function bookmarkSideOf(side: string | undefined): MarginSide {
  return side === "start" ? "start" : "end"
}

export function snapCountOf(snap: number) {
  if (!Number.isFinite(snap) || snap <= 0) return 0
  return clamp(Math.round(snap), 1, 5)
}

export function notchStops(count: number) {
  if (count <= 0) return []
  if (count === 1) return [0]
  return Array.from({ length: count }, (_, index) => roundProgress(index / (count - 1)))
}

export function nearestStop(progress: number, count: number) {
  const stops = notchStops(count)
  if (stops.length === 0) return roundProgress(progress)
  let best = stops[0] ?? 0
  for (const stop of stops) {
    if (Math.abs(stop - progress) < Math.abs(best - progress) - 1e-9) best = stop
  }
  return best
}

export function stepStop(progress: number, count: number, direction: 1 | -1) {
  const stops = notchStops(count)
  if (stops.length === 0) return roundProgress(progress + direction * 0.06)
  const current = nearestStop(progress, count)
  const index = stops.findIndex((stop) => Math.abs(stop - current) < 0.001)
  const next = clamp((index < 0 ? 0 : index) + direction, 0, stops.length - 1)
  return stops[next] ?? current
}

export function notchSize(intensity: number) {
  return Math.round(12 + clamp(intensity, 0, 1) * 12)
}

export function passageAt(progress: number, count = BOOKMARK_PARAS.length) {
  const value = clamp(progress, 0, 1)
  if (value >= 1) return count - 1
  return clamp(Math.floor(value * count), 0, count - 1)
}

export function approachNotch(current: number, target: number, pace: number) {
  const delta = target - current
  if (Math.abs(delta) < 0.004) return roundProgress(target)
  const step = delta * clamp(0.3 * rateOf(pace), 0.16, 0.7)
  return roundProgress(current + step)
}

export function notchFromPointer(clientY: number, rect: { top: number; height: number }) {
  const height = rect.height > 1 ? rect.height : NOTCH_COLUMN
  const top = rect.height > 1 ? rect.top : 0
  return roundProgress((clientY - top) / height)
}

function capture(event: ReactPointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function MarginBookmarkNotch({
  pace = 1,
  intensity = 0.32,
  snapNotches = 4,
  side = "end",
  className,
  onValueChange,
}: MarginBookmarkNotchProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const passageRefs = useRef<Array<HTMLElement | null>>([])
  const frameRef = useRef(0)
  const targetRef = useRef(0)
  const shownRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const snapRef = useRef(snapCountOf(snapNotches))
  const dragRef = useRef(false)
  const lockRef = useRef<number | null>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const snaps = snapCountOf(snapNotches)
  const place = bookmarkSideOf(side)
  const paceRate = rateOf(pace)
  const size = notchSize(gain)
  const [target, setTarget] = useState(0)
  const [shown, setShown] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [playing, setPlaying] = useState(false)
  const passage = passageAt(target)
  const visible = !live || reduced ? (snaps > 0 && !live ? nearestStop(target, snaps) : target) : shown
  const dragVisible = dragging && live && !reduced

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function syncScroll(value: number) {
    const node = scrollerRef.current
    if (!node) return
    const max = node.scrollHeight - node.clientHeight
    if (max <= 1) return
    const top = value * max
    lockRef.current = top
    node.scrollTop = top
  }

  function assign(next: number, immediate: boolean) {
    const value = roundProgress(next)
    targetRef.current = value
    setTarget(value)
    syncScroll(value)
    if (immediate || reducedRef.current || !liveRef.current) {
      stop()
      shownRef.current = value
      setShown(value)
      setPlaying(false)
      return
    }
    kick()
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        const count = snapRef.current
        const settled = count > 0 ? nearestStop(targetRef.current, count) : targetRef.current
        targetRef.current = settled
        shownRef.current = settled
        setTarget(settled)
        setShown(settled)
        frameRef.current = 0
        setPlaying(false)
        setDragging(false)
        dragRef.current = false
        return
      }
      const next = approachNotch(shownRef.current, targetRef.current, paceRef.current)
      if (Math.abs(next - targetRef.current) < 0.004) {
        shownRef.current = targetRef.current
        setShown(targetRef.current)
        frameRef.current = 0
        setPlaying(false)
        return
      }
      shownRef.current = next
      setShown(next)
      frameRef.current = window.requestAnimationFrame(tick)
    }
    setPlaying(true)
    frameRef.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    snapRef.current = snaps
    if (!live || reduced) {
      stop()
      dragRef.current = false
      return
    }
    if (Math.abs(shownRef.current - targetRef.current) >= 0.004) kick()
  }, [live, reduced, snaps, paceRate])

  useEffect(() => {
    onValueChange?.({ progress: target, passage })
  }, [target, passage, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onScroll(event: UIEvent<HTMLDivElement>) {
    if (lockRef.current !== null && Math.abs(event.currentTarget.scrollTop - lockRef.current) < 1.5) {
      lockRef.current = null
      return
    }
    lockRef.current = null
    if (dragRef.current || !liveRef.current) return
    const max = event.currentTarget.scrollHeight - event.currentTarget.clientHeight
    if (max <= 1) return
    assign(event.currentTarget.scrollTop / max, reducedRef.current)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    const count = snapRef.current
    if (event.key === "ArrowDown") {
      event.preventDefault()
      assign(stepStop(targetRef.current, count, 1), reducedRef.current || !liveRef.current)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      assign(stepStop(targetRef.current, count, -1), reducedRef.current || !liveRef.current)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      assign(count > 0 ? (notchStops(count)[0] ?? 0) : 0, reducedRef.current || !liveRef.current)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      const stops = notchStops(count)
      assign(count > 0 ? (stops[stops.length - 1] ?? 1) : 1, reducedRef.current || !liveRef.current)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      passageRefs.current[passageAt(targetRef.current)]?.focus()
    }
  }

  function pointerProgress(clientY: number) {
    const rect = railRef.current?.getBoundingClientRect() ?? { top: 0, height: 0 }
    return notchFromPointer(clientY, rect)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDragging(true)
    capture(event)
    assign(pointerProgress(event.clientY), true)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragRef.current) return
    assign(pointerProgress(event.clientY), true)
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = false
    setDragging(false)
    const count = snapRef.current
    const next = count > 0 ? nearestStop(targetRef.current, count) : targetRef.current
    assign(next, reducedRef.current || !liveRef.current)
  }

  const placeTop = `${visible * 100}%`

  return (
    <div
      ref={ref}
      data-slot="margin-bookmark-notch"
      data-ritual="bookmark-notch"
      data-progress={target.toFixed(3)}
      data-shown={visible.toFixed(3)}
      data-notch={snaps > 0 ? String(notchStops(snaps).findIndex((stop) => Math.abs(stop - target) < 0.001)) : "free"}
      data-snap={snaps}
      data-side={place}
      data-passage={BOOKMARK_PARAS[passage]?.id ?? "b1"}
      data-dragging={dragVisible ? "on" : "off"}
      data-playing={playing && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-size={size}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">A small margin notch marks how far the page has been read.</p>
      <div className={cn("flex h-72 gap-3", place === "start" && "flex-row-reverse")}>
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-label="Reading page"
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          className={cn("h-full flex-1 overflow-y-auto rounded-2xl border border-border bg-background px-4 py-3", ring)}
        >
          <div className="grid gap-6">
            {BOOKMARK_PARAS.map((item, index) => (
              <article
                key={item.id}
                ref={(node) => {
                  passageRefs.current[index] = node
                }}
                tabIndex={-1}
                data-passage={item.id}
                data-current={index === passage ? "true" : "false"}
                className={cn("min-h-32 rounded-xl px-1", ring)}
              >
                <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
        <div ref={railRef} className="relative h-full w-10 shrink-0" style={{ height: NOTCH_COLUMN }}>
          <div aria-hidden="true" className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
          <motion.button
            type="button"
            role="slider"
            aria-label="Reading bookmark"
            aria-orientation="vertical"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(target * 100)}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ top: placeTop, width: size, height: size + 8 }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 touch-none text-foreground motion-reduce:transition-none",
              ring,
            )}
          >
            <svg viewBox="0 0 24 32" aria-hidden="true" className="h-full w-full fill-current">
              <path d="M4 2h16a2 2 0 0 1 2 2v26l-10-7-10 7V4a2 2 0 0 1 2-2z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
