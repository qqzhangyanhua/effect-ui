"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SolarOrbitScrubProps {
  pace?: number
  intensity?: number
  span?: number
  snap?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const VIEW_W = 320
const VIEW_H = 220
const CX = 160
const CY = 136
const RX = 118
const RY = 48

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function spanOf(span: number) {
  return clamp(span, 0.45, 1)
}

function quantize(t: number) {
  return Math.round(clamp(t, 0, 1) * 100) / 100
}

export function solarAngle(t: number, span: number) {
  const portion = spanOf(span)
  const sweep = Math.PI * portion
  const start = Math.PI + (Math.PI - sweep) / 2
  return start + sweep * clamp(t, 0, 1)
}

export function solarPoint(t: number, span: number) {
  const angle = solarAngle(t, span)
  return { x: CX + RX * Math.cos(angle), y: CY + RY * Math.sin(angle) }
}

export function solarTAt(x: number, y: number, span: number) {
  let best = 0
  let bestDist = Number.POSITIVE_INFINITY
  const steps = 80
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const point = solarPoint(t, span)
    const dist = (point.x - x) ** 2 + (point.y - y) ** 2
    if (dist < bestDist) {
      bestDist = dist
      best = t
    }
  }
  return quantize(best)
}

export function solarSnap(t: number, enabled: boolean) {
  const next = quantize(t)
  if (!enabled) return next
  if (next <= 0.18) return 0
  if (next >= 0.82) return 1
  return next
}

export function solarShadow(t: number, intensity: number) {
  const gain = clamp(intensity, 0, 1)
  const u = clamp(t, 0, 1)
  const along = (0.5 - u) * 2
  const elevation = Math.sin(Math.PI * u)
  const length = (18 + gain * 46) * (1 - elevation * 0.72)
  return {
    x: Math.round(along * length),
    y: Math.round(8 + (1 - elevation) * (10 + gain * 22)),
    blur: Math.round(6 + gain * 10 + (1 - elevation) * 14),
  }
}

export function solarClock(t: number) {
  const minutes = Math.round(6 * 60 + clamp(t, 0, 1) * 14 * 60)
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function solarWarm(t: number) {
  return Math.round((1 - clamp(t, 0, 1)) * 100)
}

export function SolarOrbitScrub({
  pace = 1,
  intensity = 0.7,
  span = 0.75,
  snap = false,
  className,
  onValueChange,
}: SolarOrbitScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const tRef = useRef(0.5)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const arc = spanOf(span)
  const [t, setT] = useState(0.5)
  const [phase, setPhase] = useState<"idle" | "dragging" | "settle">("idle")
  const shadow = solarShadow(t, gain)
  const clock = solarClock(t)
  const warm = solarWarm(t)
  const sun = solarPoint(t, arc)
  const tilt = Math.round((t - 0.5) * 28)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    tRef.current = t
  }, [t])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function publish(next: number, nextPhase: "idle" | "dragging" | "settle") {
    const value = quantize(next)
    tRef.current = value
    setT(value)
    setPhase(nextPhase)
    onValueRef.current?.(value)
  }

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function settle(raw: number) {
    dragRef.current = false
    stopFrame()
    const next = solarSnap(raw, snap)
    if (reduced || !liveRef.current || Math.abs(next - tRef.current) < 0.001) {
      publish(next, "idle")
      return
    }
    const from = tRef.current
    setPhase("settle")
    let step = 0
    const total = Math.max(6, Math.round(12 / rate))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      step += 1
      const k = 1 - Math.exp(-step * (0.32 + rate * 0.15))
      const value = quantize(from + (next - from) * k)
      if (step >= total || Math.abs(next - value) <= 0.01) {
        publish(next, "idle")
        frame.current = 0
        return
      }
      tRef.current = value
      setT(value)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function read(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : VIEW_W
    const height = rect.height > 0 ? rect.height : VIEW_H
    const x = ((event.clientX - rect.left) / width) * VIEW_W
    const y = ((event.clientY - rect.top) / height) * VIEW_H
    return solarTAt(x, y, arc)
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stopFrame()
    dragRef.current = true
    publish(read(event), "dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    publish(read(event), "dragging")
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    settle(read(event))
  }

  function stepBy(direction: number) {
    stopFrame()
    const next = clamp(Math.round(tRef.current * 100 + direction * 5) / 100, 0, 1)
    publish(next, "idle")
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      stepBy(1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      stepBy(-1)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="solar-orbit-scrub"
      data-ritual="solar-shadow"
      data-pace={rate}
      data-intensity={gain}
      data-span={arc}
      data-snap={snap ? "on" : "off"}
      data-t={t.toFixed(2)}
      data-shadow-x={shadow.x}
      data-shadow-y={shadow.y}
      data-blur={shadow.blur}
      data-time={clock}
      data-warm={warm}
      data-state={phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        className="relative h-56 overflow-hidden rounded-2xl"
        style={{ background: `color-mix(in oklab, var(--chart-4) ${warm}%, var(--chart-5))` }}
      >
        <div className="pointer-events-none absolute inset-0 grid place-items-center" style={{ perspective: "480px" }}>
          <div
            data-cast
            className="absolute h-3 w-16 rounded-full bg-foreground/25 transition-transform motion-reduce:transition-none"
            style={{ transform: `translate(${shadow.x}px, ${18 + shadow.y}px) scaleX(${1 + Math.abs(shadow.x) / 80})` }}
          />
          <div
            data-cube
            className="relative h-16 w-16 rounded-2xl border border-border bg-card transition-transform motion-reduce:transition-none"
            style={{
              transform: `rotateX(12deg) rotateY(${tilt}deg)`,
              boxShadow: `${shadow.x}px ${shadow.y}px ${shadow.blur}px color-mix(in oklab, var(--foreground) 32%, transparent)`,
            }}
          />
        </div>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="slider"
          aria-label="太阳轨道"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          aria-valuetext={clock}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 h-full w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="var(--background)" strokeWidth={8} opacity={0.45} />
          <ellipse cx={CX} cy={CY} rx={RX} ry={RY} fill="none" stroke="var(--foreground)" strokeWidth={2} opacity={0.35} />
          <circle cx={sun.x} cy={sun.y} r={12 + gain * 4} fill="var(--chart-4)" stroke="var(--background)" strokeWidth={3} data-sun />
        </svg>
        <p role="status" data-clock className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-sm text-foreground">
          {clock}
        </p>
      </div>
      {reduced ? (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => stepBy(-1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            更早
          </button>
          <button type="button" onClick={() => stepBy(1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            更晚
          </button>
        </div>
      ) : null}
    </div>
  )
}
