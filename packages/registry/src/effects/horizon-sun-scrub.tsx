"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HorizonSunScrubProps {
  pace?: number
  intensity?: number
  span?: number
  snap?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const START = 0.2
const VIEW_W = 320

const ANCHORS = [
  { id: "rise", t: 0.06 },
  { id: "noon", t: 0.44 },
  { id: "set", t: 0.81 },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function spanOf(span: number) {
  return clamp(span, 0.45, 1)
}

function horizonClock(t: number) {
  const minutes = Math.round(5 * 60 + quantize(t) * 16 * 60)
  const bounded = Math.min(21 * 60, Math.max(5 * 60, minutes))
  const hour = Math.floor(bounded / 60)
  const minute = bounded % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function horizonWash(t: number, intensity: number) {
  const noon = Math.sin(Math.PI * clamp(t, 0, 1))
  const gain = clamp(intensity, 0, 1)
  return {
    sky: Math.round(noon * (50 + gain * 50)),
    warm: Math.round((1 - noon) * (30 + gain * 70)),
    glow: Math.round(8 + gain * 16 + noon * 10),
  }
}

function horizonPoint(t: number, span: number) {
  const u = clamp(t, 0, 1)
  const portion = spanOf(span)
  const x = (1 - portion) / 2 + portion * u
  const local = (u - 0.5) * 2
  const y = 0.78 - (1 - local * local) * 0.42 * portion
  return { x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 }
}

function horizonSnap(t: number, enabled: boolean) {
  const next = quantize(t)
  if (!enabled) return { t: next, anchor: "free" }
  let best = { t: next, anchor: "free" }
  let dist = 0.08
  for (const anchor of ANCHORS) {
    const gap = Math.abs(next - anchor.t)
    if (gap <= dist) {
      dist = gap
      best = { t: anchor.t, anchor: anchor.id }
    }
  }
  return best
}

function arcPath(span: number) {
  let path = ""
  for (let i = 0; i <= 24; i += 1) {
    const point = horizonPoint(i / 24, span)
    const x = (point.x * VIEW_W).toFixed(1)
    const y = (point.y * 180).toFixed(1)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return path
}

export function HorizonSunScrub({
  pace = 1,
  intensity = 0.7,
  span = 0.8,
  snap = true,
  className,
  onValueChange,
}: HorizonSunScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const tRef = useRef(START)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const snapRef = useRef(snap)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const arc = spanOf(span)
  const [t, setT] = useState(START)
  const [anchor, setAnchor] = useState("free")
  const [phase, setPhase] = useState<"idle" | "dragging" | "settle">("idle")
  const wash = horizonWash(t, gain)
  const point = horizonPoint(t, arc)
  const clock = horizonClock(t)
  const ease = reduced ? 0 : Math.round(180 / rate)

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    snapRef.current = snap
    rateRef.current = rate
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
    })
  }, [onValueChange, live, reduced, snap, rate])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(next: number, nextAnchor: string, nextPhase: "idle" | "dragging" | "settle") {
    const value = quantize(next)
    tRef.current = value
    setT(value)
    setAnchor(nextAnchor)
    setPhase(nextPhase)
    onValueRef.current?.(value)
  }

  function settle(raw: number) {
    dragRef.current = false
    stopFrame()
    const snapped = horizonSnap(raw, snapRef.current)
    if (reducedRef.current || !liveRef.current || Math.abs(snapped.t - tRef.current) < 0.001) {
      publish(snapped.t, snapped.anchor, "idle")
      return
    }
    const from = tRef.current
    setPhase("settle")
    setAnchor(snapped.anchor)
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        publish(snapped.t, snapped.anchor, "idle")
        frame.current = 0
        return
      }
      const value = quantize(from + (snapped.t - from) * (step / total))
      tRef.current = value
      setT(value)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function readT(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : VIEW_W
    return quantize((event.clientX - rect.left) / width)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stopFrame()
    dragRef.current = true
    const next = readT(event)
    publish(next, "free", reducedRef.current ? "idle" : "dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    publish(readT(event), "free", reducedRef.current ? "idle" : "dragging")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    settle(readT(event))
  }

  function stepBy(direction: number) {
    stopFrame()
    publish(clamp(tRef.current + direction * 0.02, 0, 1), "free", "idle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      stepBy(1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      stepBy(-1)
    }
  }

  const sky = `linear-gradient(180deg, color-mix(in oklab, var(--chart-1) ${wash.warm}%, var(--background)) 0%, color-mix(in oklab, var(--chart-4) ${wash.sky}%, var(--chart-2)) 58%, color-mix(in oklab, var(--chart-5) ${wash.warm}%, var(--muted)) 100%)`

  return (
    <div
      ref={ref}
      data-slot="horizon-sun-scrub"
      data-ritual="horizon-wash"
      data-pace={rate}
      data-intensity={gain}
      data-span={arc}
      data-snap={snap ? "on" : "off"}
      data-t={t.toFixed(2)}
      data-time={clock}
      data-anchor={anchor}
      data-sky={wash.sky}
      data-warm={wash.warm}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="slider"
        aria-label="地平线时刻"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(t * 100)}
        aria-valuetext={clock}
        tabIndex={0}
        data-part="scrub"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ background: sky }}
      >
        <svg viewBox={`0 0 ${VIEW_W} 180`} className="h-44 w-full" aria-hidden>
          <path d={arcPath(arc)} fill="none" stroke="var(--foreground)" strokeWidth={2} strokeDasharray="5 6" opacity={0.55} />
          <line x1={16} x2={304} y1={150} y2={150} stroke="var(--foreground)" strokeWidth={2} opacity={0.4} />
        </svg>
        <motion.div
          data-sun
          data-sun-x={point.x}
          data-sun-y={point.y}
          className="pointer-events-none absolute size-8 rounded-full border-2 border-background bg-chart-4 motion-reduce:transition-none"
          style={{
            left: `${point.x * 100}%`,
            top: `${point.y * 100}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${wash.glow}px color-mix(in oklab, var(--chart-4) 75%, transparent)`,
            transition: reduced ? "none" : `left ${ease}ms linear, top ${ease}ms linear`,
          }}
        />
        <p
          role="status"
          data-clock
          className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-sm text-foreground"
        >
          {clock}
        </p>
        <div
          data-part="ruler"
          className="pointer-events-none absolute inset-x-3 bottom-3 h-1 rounded-full bg-foreground/20"
          aria-hidden
        >
          <span
            data-part="thumb"
            className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-background"
            style={{ left: `${t * 100}%`, transform: "translate(-50%, -50%)" }}
          />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {ANCHORS.map((item) => (
          <button
            key={item.id}
            type="button"
            data-jump={item.id}
            onClick={() => publish(item.t, item.id, "idle")}
            className="rounded-full border border-border px-3 py-1 text-xs text-foreground"
          >
            {item.id === "rise" ? "Rise" : item.id === "noon" ? "Noon" : "Set"}
          </button>
        ))}
      </div>
      {reduced ? (
        <div className="mt-2 flex items-center gap-2">
          <button type="button" onClick={() => stepBy(-1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            更早
          </button>
          <input
            type="range"
            aria-label="时刻"
            min={0}
            max={100}
            value={Math.round(t * 100)}
            onChange={(event) => publish(Number(event.target.value) / 100, "free", "idle")}
            className="min-w-0 flex-1"
          />
          <button type="button" onClick={() => stepBy(1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            更晚
          </button>
        </div>
      ) : null}
    </div>
  )
}
