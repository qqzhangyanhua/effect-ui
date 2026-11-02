"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type UIEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Codecademy, GetYourGuide, Turo, and Amazon (via Mobbin), original implementation.
 * https://mobbin.com/screens/41ef4d64-14cc-4361-b939-3b4c7c960153
 * https://mobbin.com/screens/1e654ccf-6ad7-4821-8ea6-20b86cd353b8
 * https://mobbin.com/screens/c1cc661e-ec5c-4d15-a781-d388cb329940
 * https://mobbin.com/screens/374186a9-1431-4480-8386-7c40754f5959
 */

export interface MarginInkProgressProps {
  pace?: number
  intensity?: number
  ticks?: number
  side?: "start" | "end"
  className?: string
  onValueChange?: (state: { progress: number; chapter: number }) => void
}

export type MarginSide = "start" | "end"

export const INK_TITLES = ["Dawn note", "Field note", "Margin note", "Close note", "Index note", "After note"] as const

const INK_BODIES = [
  "The ink fills only as far as the passage you have reached.",
  "Tick marks sit on the rail so a chapter can be opened directly.",
  "The column stays clear. The rail is a margin, not a mask.",
  "A later note keeps the same quiet measure of progress.",
  "Another short section for a denser set of ticks.",
  "The last note rests at the end of the rail.",
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

export function marginSideOf(side: string | undefined): MarginSide {
  return side === "end" ? "end" : "start"
}

export function tickCountOf(ticks: number) {
  return clamp(Math.round(Number.isFinite(ticks) ? ticks : 4), 3, 6)
}

export function chapterAt(progress: number, ticks: number) {
  const count = tickCountOf(ticks)
  const value = clamp(progress, 0, 1)
  if (value >= 1) return count - 1
  return clamp(Math.floor(value * count), 0, count - 1)
}

export function chapterMark(index: number, ticks: number) {
  const count = tickCountOf(ticks)
  if (count <= 1) return 0
  const safe = clamp(Math.round(index), 0, count - 1)
  return roundProgress(safe / (count - 1))
}

export function inkThickness(intensity: number) {
  return Math.round(2 + clamp(intensity, 0, 1) * 5)
}

export function approachInk(current: number, target: number, pace: number) {
  const delta = target - current
  if (Math.abs(delta) < 0.004) return roundProgress(target)
  const step = delta * clamp(0.32 * rateOf(pace), 0.16, 0.72)
  return roundProgress(current + step)
}

export function inkFromPointer(clientY: number, rect: { top: number; height: number }) {
  const height = rect.height > 1 ? rect.height : 240
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

export function MarginInkProgress({
  pace = 1,
  intensity = 0.35,
  ticks = 4,
  side = "start",
  className,
  onValueChange,
}: MarginInkProgressProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const progressRef = useRef(0)
  const shownRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const lockRef = useRef<number | null>(null)
  const dragRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const count = tickCountOf(ticks)
  const place = marginSideOf(side)
  const paceRate = rateOf(pace)
  const [progress, setProgress] = useState(0)
  const [shown, setShown] = useState(0)
  const [playing, setPlaying] = useState(false)
  const chapter = chapterAt(progress, count)
  const thickness = inkThickness(gain)

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

  function publish(next: number) {
    const value = roundProgress(next)
    progressRef.current = value
    setProgress(value)
    syncScroll(value)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        shownRef.current = progressRef.current
        setShown(progressRef.current)
        frameRef.current = 0
        setPlaying(false)
        return
      }
      const next = approachInk(shownRef.current, progressRef.current, paceRef.current)
      if (Math.abs(next - progressRef.current) < 0.004) {
        shownRef.current = progressRef.current
        setShown(progressRef.current)
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
    if (!live || reduced) {
      stop()
      shownRef.current = progressRef.current
      setShown(progressRef.current)
      setPlaying(false)
      return
    }
    if (Math.abs(shownRef.current - progressRef.current) >= 0.004) kick()
    return () => stop()
  }, [live, reduced, progress, paceRate])

  useEffect(() => {
    onValueChange?.({ progress, chapter })
  }, [progress, chapter, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onScroll(event: UIEvent<HTMLDivElement>) {
    if (lockRef.current !== null && Math.abs(event.currentTarget.scrollTop - lockRef.current) < 1.5) {
      lockRef.current = null
      return
    }
    lockRef.current = null
    if (!liveRef.current) return
    const max = event.currentTarget.scrollHeight - event.currentTarget.clientHeight
    if (max <= 1) return
    publish(event.currentTarget.scrollTop / max)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      publish(progressRef.current + 0.04)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      publish(progressRef.current - 0.04)
      return
    }
    if (event.key === "]" || event.key === "ArrowRight") {
      event.preventDefault()
      publish(chapterMark(chapterAt(progressRef.current, count) + 1, count))
      return
    }
    if (event.key === "[" || event.key === "ArrowLeft") {
      event.preventDefault()
      publish(chapterMark(chapterAt(progressRef.current, count) - 1, count))
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      publish(0)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      publish(1)
      return
    }
    if (/^[1-6]$/.test(event.key)) {
      const index = Number(event.key) - 1
      if (index >= count) return
      event.preventDefault()
      publish(chapterMark(index, count))
    }
  }

  function onRailPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    if (event.target instanceof Element && event.target.closest("button")) return
    dragRef.current = true
    capture(event)
    const rect = railRef.current?.getBoundingClientRect() ?? { top: 0, height: 0 }
    publish(inkFromPointer(event.clientY, rect))
  }

  function onRailPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const rect = railRef.current?.getBoundingClientRect() ?? { top: 0, height: 0 }
    publish(inkFromPointer(event.clientY, rect))
  }

  function onRailPointerUp() {
    dragRef.current = false
  }

  const ink = reduced || !live ? progress : shown

  return (
    <div
      ref={ref}
      data-slot="margin-ink-progress"
      data-ritual="margin-ink"
      data-progress={progress.toFixed(3)}
      data-ink={ink.toFixed(3)}
      data-chapter={chapter}
      data-ticks={count}
      data-side={place}
      data-playing={playing && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">The margin ink follows the passage. Ticks open a section.</p>
      <div className={cn("flex h-72 gap-3", place === "end" && "flex-row-reverse")}>
        <div
          ref={railRef}
          className="relative w-10 shrink-0 touch-none"
          onPointerDown={onRailPointerDown}
          onPointerMove={onRailPointerMove}
          onPointerUp={onRailPointerUp}
          onPointerCancel={onRailPointerUp}
        >
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Reading progress"
            className="absolute inset-y-1 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-muted"
          >
            <motion.div
              aria-hidden="true"
              style={{ height: `${ink * 100}%`, width: thickness }}
              className="absolute inset-x-0 top-0 mx-auto rounded-full bg-foreground/70 motion-reduce:transition-none"
            />
          </div>
          {INK_TITLES.slice(0, count).map((title, index) => {
            const current = index === chapter
            return (
              <button
                key={title}
                type="button"
                aria-label={title}
                aria-current={current ? "true" : undefined}
                data-tick={index}
                onClick={() => publish(chapterMark(index, count))}
                style={{ top: `${chapterMark(index, count) * 100}%` }}
                className={cn(
                  "absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border",
                  current ? "bg-foreground" : "bg-background",
                  ring,
                )}
              />
            )
          })}
        </div>
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-label="Reading passage"
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          className={cn("h-full flex-1 overflow-y-auto rounded-2xl border border-border bg-background px-4 py-3", ring)}
        >
          <div className="grid gap-6">
            {INK_TITLES.slice(0, count).map((title, index) => (
              <article key={title} data-chapter-block={index} className="min-h-36">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{INK_BODIES[index]}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
