"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BorderFocusStripProps {
  pace?: number
  intensity?: number
  count?: number
  snap?: boolean
  className?: string
  onIndexChange?: (index: number) => void
}

interface Poster {
  id: string
  title: string
  tone: string
}

type Phase = "idle" | "scrolling" | "settle"

const POSTER_FALLBACK: Poster = { id: "s01", title: "Series 01", tone: "bg-chart-1" }

const POSTERS: readonly Poster[] = [
  { id: "s01", title: "Series 01", tone: "bg-chart-1" },
  { id: "s02", title: "Series 02", tone: "bg-chart-2" },
  { id: "s03", title: "Series 03", tone: "bg-chart-3" },
  { id: "s04", title: "Series 04", tone: "bg-chart-4" },
  { id: "s05", title: "Series 05", tone: "bg-chart-5" },
  { id: "s06", title: "Series 06", tone: "bg-chart-1" },
  { id: "s07", title: "Series 07", tone: "bg-chart-2" },
  { id: "s08", title: "Series 08", tone: "bg-chart-3" },
  { id: "s09", title: "Series 09", tone: "bg-chart-4" },
  { id: "s10", title: "Series 10", tone: "bg-chart-5" },
]

const STRIDE = 140

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 6, 10)
}

function opacityFor(active: boolean, gain: number) {
  if (active) return 1
  return Math.round(clamp(0.75 - gain * 0.2, 0.55, 0.75) * 100) / 100
}

export function BorderFocusStrip({
  pace = 1,
  intensity = 0.7,
  count = 8,
  snap = true,
  className,
  onIndexChange,
}: BorderFocusStripProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const indexRef = useRef(0)
  const dragRef = useRef(false)
  const originRef = useRef({ x: 0, index: 0 })
  const skipClick = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const baseId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const reducedRef = useRef(reduced)
  const liveRef = useRef(live)
  const snapRef = useRef(snap)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const items = POSTERS.slice(0, total)
  const last = items.length - 1
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const safe = clamp(index, 0, last)
  const current = items[safe] ?? items[0] ?? POSTER_FALLBACK
  const ease = reduced || !snap ? 0 : Math.round(260 / rate)

  if (index !== safe) setIndex(safe)

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    snapRef.current = snap
    rateRef.current = rate
    onIndexRef.current = onIndexChange
    indexRef.current = safe
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase("idle")
    })
  }, [reduced, live, snap, rate, onIndexChange, safe])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function runSettle() {
    stopFrame()
    if (reducedRef.current || !liveRef.current || !snapRef.current) {
      setPhase("idle")
      return
    }
    setPhase("settle")
    let left = Math.max(3, Math.round(5 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      left -= 1
      if (left <= 0) {
        setPhase("idle")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function commit(next: number, dragging: boolean) {
    const clamped = clamp(Math.round(next), 0, last)
    const changed = clamped !== indexRef.current
    indexRef.current = clamped
    setIndex(clamped)
    if (changed) onIndexRef.current?.(clamped)
    if (dragging) {
      stopFrame()
      setPhase(reducedRef.current || !liveRef.current ? "idle" : "scrolling")
      return
    }
    runSettle()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      commit(indexRef.current + 1, false)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      commit(indexRef.current - 1, false)
    }
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.cancelable) event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (delta > 0) commit(indexRef.current + 1, false)
    else if (delta < 0) commit(indexRef.current - 1, false)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originRef.current = { x: event.clientX, index: indexRef.current }
    stopFrame()
    if (!reducedRef.current && liveRef.current) setPhase("scrolling")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(originRef.current.index - (event.clientX - originRef.current.x) / STRIDE, true)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const dx = event.clientX - originRef.current.x
    if (Math.abs(dx) > 4) skipClick.current = true
    commit(originRef.current.index - dx / STRIDE, false)
  }

  return (
    <div
      ref={ref}
      data-slot="border-focus-strip"
      data-ritual="border-focus"
      data-layout="poster-strip"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-snap={snap ? "on" : "off"}
      data-index={safe}
      data-title={current.title}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-3xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        data-part="strip"
        role="listbox"
        aria-label="海报条"
        aria-activedescendant={`${baseId}-${current.id}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="touch-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <motion.div
          className="flex gap-3 px-1 py-3"
          initial={false}
          animate={{ x: -safe * STRIDE }}
          transition={phase === "scrolling" || reduced || !snap ? { duration: 0 } : { duration: 0.28 / rate, ease: "easeOut" }}
        >
          {items.map((item, itemIndex) => {
            const active = itemIndex === safe
            const border = active ? Math.round(2 + gain * 6) : 0
            const scale = active && !reduced ? Math.round((1 + gain * 0.06) * 100) / 100 : 1
            const opacity = opacityFor(active, gain)
            return (
              <motion.button
                key={item.id}
                id={`${baseId}-${item.id}`}
                type="button"
                role="option"
                aria-selected={active}
                aria-label={item.title}
                tabIndex={-1}
                data-index={itemIndex}
                data-title={item.title}
                data-border={border}
                data-scale={scale.toFixed(2)}
                data-opacity={opacity.toFixed(2)}
                data-active={active ? "yes" : "no"}
                initial={false}
                animate={{ scale, opacity }}
                transition={reduced || !snap ? { duration: 0 } : { duration: 0.26 / rate, ease: "easeOut" }}
                onClick={() => {
                  if (skipClick.current) {
                    skipClick.current = false
                    return
                  }
                  commit(itemIndex, false)
                }}
                className="w-32 shrink-0 rounded-2xl bg-transparent p-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ boxShadow: border > 0 ? `0 0 0 ${border}px var(--primary)` : "none" }}
              >
                <span className={cn("relative block h-44 overflow-hidden rounded-xl", item.tone)}>
                  <span className="absolute inset-x-2 bottom-2 rounded-lg bg-card/90 px-2 py-1 text-xs text-card-foreground">{item.title}</span>
                </span>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
      <p role="status" className="sr-only">
        {current.title}
      </p>
    </div>
  )
}
