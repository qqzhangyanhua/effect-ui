"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ArcFilmCarouselProps {
  pace?: number
  intensity?: number
  count?: number
  depth?: number
  className?: string
  onIndexChange?: (index: number) => void
}

interface Studio {
  id: string
  title: string
  tone: string
}

type Phase = "idle" | "sliding" | "settle"

const STUDIO_FALLBACK: Studio = { id: "alpha", title: "Alpha Studio", tone: "bg-chart-1" }

const STUDIOS: readonly Studio[] = [
  { id: "alpha", title: "Alpha Studio", tone: "bg-chart-1" },
  { id: "bravo", title: "Bravo Atelier", tone: "bg-chart-2" },
  { id: "charlie", title: "Charlie Field", tone: "bg-chart-3" },
  { id: "delta", title: "Delta Room", tone: "bg-chart-4" },
  { id: "echo", title: "Echo Line", tone: "bg-chart-5" },
  { id: "foxtrot", title: "Foxtrot Hall", tone: "bg-chart-1" },
  { id: "golf", title: "Golf Court", tone: "bg-chart-2" },
  { id: "hotel", title: "Hotel Yard", tone: "bg-chart-3" },
  { id: "india", title: "India Dock", tone: "bg-chart-4" },
]

const STEP = 96

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 5, 9)
}

function depthOf(depth: number) {
  return clamp(depth, 0, 1)
}

function poseFor(offset: number, gain: number, depth: number) {
  const abs = Math.abs(offset)
  const scale = offset === 0
    ? Math.round((1 + gain * 0.08) * 100) / 100
    : Math.round(Math.max(0.7, 1 - abs * (0.06 + gain * 0.08)) * 100) / 100
  const opacity = offset === 0 ? 1 : Math.round(Math.max(0.35, 1 - abs * (0.16 + gain * 0.14)) * 100) / 100
  return {
    x: Math.round(offset * (84 - gain * 14)),
    y: Math.round(abs * abs * (6 + gain * 14)),
    scale,
    opacity,
    rotate: Math.round(offset * (8 + gain * 12)),
    z: Math.round(depth * 40 - abs * (12 + depth * 18)),
  }
}

export function ArcFilmCarousel({
  pace = 1,
  intensity = 0.65,
  count = 7,
  depth = 0.55,
  className,
  onIndexChange,
}: ArcFilmCarouselProps) {
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
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const curve = depthOf(depth)
  const items = STUDIOS.slice(0, total)
  const last = items.length - 1
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const safe = clamp(index, 0, last)
  const current = items[safe] ?? items[0] ?? STUDIO_FALLBACK
  const ease = reduced ? 0 : Math.round(320 / rate)

  if (index !== safe) setIndex(safe)

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
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
  }, [reduced, live, rate, onIndexChange, safe])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function runSlide() {
    stopFrame()
    if (reducedRef.current || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("sliding")
    let left = Math.max(4, Math.round(6 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      left -= 1
      if (left === 1) setPhase("settle")
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
      setPhase(reducedRef.current || !liveRef.current ? "idle" : "sliding")
      return
    }
    runSlide()
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
    if (!reducedRef.current && liveRef.current) setPhase("sliding")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(originRef.current.index - (event.clientX - originRef.current.x) / STEP, true)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const dx = event.clientX - originRef.current.x
    if (Math.abs(dx) > 4) skipClick.current = true
    commit(originRef.current.index - dx / STEP, false)
  }

  return (
    <div
      ref={ref}
      data-slot="arc-film-carousel"
      data-ritual="arc-film"
      data-layout="bent-strip"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-depth={curve}
      data-index={safe}
      data-title={current.title}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "grid w-full max-w-3xl gap-3 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={() => commit(indexRef.current - 1, false)}>
          上一帧
        </button>
        <p className="text-sm font-medium text-foreground">{current.title}</p>
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={() => commit(indexRef.current + 1, false)}>
          下一帧
        </button>
      </div>
      <div
        data-part="arc"
        role="listbox"
        aria-label="弧形胶片"
        aria-activedescendant={`${baseId}-${current.id}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-64 touch-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ perspective: `${Math.round(980 - curve * 360)}px` }}
      >
        {items.map((item, itemIndex) => {
          const offset = itemIndex - safe
          const pose = poseFor(offset, gain, curve)
          const active = offset === 0
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
              data-x={pose.x}
              data-y={pose.y}
              data-z={pose.z}
              data-scale={pose.scale.toFixed(2)}
              data-active={active ? "yes" : "no"}
              initial={false}
              animate={{
                x: pose.x,
                y: pose.y,
                z: pose.z,
                rotateY: pose.rotate,
                scale: pose.scale,
                opacity: pose.opacity,
              }}
              transition={reduced ? { duration: 0 } : { duration: 0.34 / rate, ease: "easeOut" }}
              style={{ zIndex: 30 - Math.abs(offset), marginLeft: -56 }}
              onClick={() => {
                if (skipClick.current) {
                  skipClick.current = false
                  return
                }
                commit(itemIndex, false)
              }}
              className={cn(
                "absolute left-1/2 top-6 h-40 w-28 rounded-2xl border border-border text-background outline-none focus-visible:ring-2 focus-visible:ring-ring",
                item.tone,
              )}
            >
              <span className="absolute inset-x-2 bottom-2 rounded-lg bg-card/90 px-1 py-1 text-[11px] text-card-foreground">
                {item.title}
              </span>
            </motion.button>
          )
        })}
      </div>
      <p role="status" className="sr-only">
        {current.title}
      </p>
    </div>
  )
}
