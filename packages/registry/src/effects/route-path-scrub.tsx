"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface RoutePathScrubProps {
  pace?: number
  intensity?: number
  metrics?: boolean
  auto?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const START = 0.3
const TRACK = 280
const KM = 8

export const ROUTE_POINTS = [
  { x: 28, y: 128 },
  { x: 78, y: 96 },
  { x: 124, y: 118 },
  { x: 168, y: 52 },
  { x: 214, y: 84 },
  { x: 262, y: 40 },
  { x: 296, y: 72 },
] as const

interface Box {
  left: number
  width: number
}

type RoutePhase = "idle" | "scrubbing" | "playing" | "settle"

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

function geometry() {
  const lengths = [0]
  let total = 0
  for (let index = 1; index < ROUTE_POINTS.length; index += 1) {
    const prev = ROUTE_POINTS[index - 1]
    const next = ROUTE_POINTS[index]
    if (!prev || !next) continue
    total += Math.hypot(next.x - prev.x, next.y - prev.y)
    lengths.push(total)
  }
  return { lengths, total }
}

const GEO = geometry()

export function routePath() {
  return ROUTE_POINTS.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join(" ")
}

const ROUTE_D = routePath()

export function routePoint(t: number) {
  const dist = clamp(t, 0, 1) * GEO.total
  for (let index = 1; index < ROUTE_POINTS.length; index += 1) {
    const end = GEO.lengths[index] ?? GEO.total
    const start = GEO.lengths[index - 1] ?? 0
    const from = ROUTE_POINTS[index - 1]
    const to = ROUTE_POINTS[index]
    if (!from || !to) continue
    if (dist <= end || index === ROUTE_POINTS.length - 1) {
      const span = end - start || 1
      const local = clamp((dist - start) / span, 0, 1)
      return {
        x: Math.round((from.x + (to.x - from.x) * local) * 10) / 10,
        y: Math.round((from.y + (to.y - from.y) * local) * 10) / 10,
      }
    }
  }
  const last = ROUTE_POINTS[ROUTE_POINTS.length - 1] ?? { x: 0, y: 0 }
  return { x: last.x, y: last.y }
}

export function routeSample(t: number) {
  const u = quantize(t)
  const wave = Math.sin(u * Math.PI)
  const paceSeconds = 280 + Math.round(wave * 40)
  const minutes = Math.floor(paceSeconds / 60)
  const seconds = paceSeconds % 60
  return {
    t: u,
    km: Math.round(u * KM * 10) / 10,
    paceSeconds,
    paceLabel: `${minutes}'${String(seconds).padStart(2, "0")}"`,
    hr: 118 + Math.round(wave * 50),
    elev: Math.round(36 + wave * 84),
    point: routePoint(u),
  }
}

export function routeFromPointer(clientX: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : TRACK
  const left = rect.width > 0 ? rect.left : 0
  return quantize((clientX - left) / width)
}

function sparkPath() {
  let path = ""
  for (let index = 0; index <= 16; index += 1) {
    const t = index / 16
    const x = (4 + t * 112).toFixed(1)
    const y = (28 - Math.sin(t * Math.PI) * 16).toFixed(1)
    path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return path
}

const SPARK = sparkPath()

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function RoutePathScrub({
  pace = 1,
  intensity = 0.7,
  metrics = true,
  auto = false,
  className,
  onValueChange,
}: RoutePathScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const tRef = useRef(START)
  const onValueRef = useRef(onValueChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const playingRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const [t, setT] = useState(START)
  const [dragging, setDragging] = useState(false)
  const [rest, setRest] = useState<"idle" | "settle">("idle")
  const playing = auto && !reduced && !dragging
  const phase: RoutePhase = dragging ? (reduced ? "idle" : "scrubbing") : playing ? "playing" : reduced ? "idle" : rest
  const sample = routeSample(t)
  const ease = reduced ? 0 : Math.round(160 / rate)

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    playingRef.current = playing
  }, [onValueChange, live, reduced, rate, playing])

  function commit(next: number) {
    const value = quantize(next)
    tRef.current = value
    setT(value)
    onValueRef.current?.(value)
  }

  useEffect(() => {
    if (reduced || !live || !playing) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !playingRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const advanced = tRef.current + dt * 0.24 * rateRef.current
      const value = quantize(advanced >= 1 ? advanced - 1 : advanced)
      tRef.current = value
      setT(value)
      onValueRef.current?.(value)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, playing])

  function read(event: PointerEvent<HTMLElement>) {
    return routeFromPointer(event.clientX, event.currentTarget.getBoundingClientRect())
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDragging(true)
    commit(read(event))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!dragRef.current) return
    commit(read(event))
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    commit(read(event))
    setDragging(false)
    if (!auto) setRest(reduced ? "idle" : "settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowRight") commit(tRef.current + 0.02)
    else if (event.key === "ArrowLeft") commit(tRef.current - 0.02)
    else if (event.key === "Home") commit(0)
    else if (event.key === "End") commit(1)
    else return
    event.preventDefault()
    if (!auto) setRest(reduced ? "idle" : "settle")
  }

  const sparkX = 4 + sample.t * 112
  const sparkY = 28 - ((sample.elev - 36) / 84) * 16

  return (
    <div
      ref={ref}
      data-slot="route-path-scrub"
      data-ritual="route-polyline"
      data-pace={rate}
      data-intensity={gain}
      data-metrics={metrics ? "on" : "off"}
      data-auto={auto ? "on" : "off"}
      data-t={sample.t.toFixed(2)}
      data-km={sample.km.toFixed(1)}
      data-split={sample.paceLabel}
      data-hr={sample.hr}
      data-x={sample.point.x}
      data-y={sample.point.y}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">Route</p>
        <p role="status" className="text-right">
          <span className="block text-lg font-semibold text-foreground">
            {sample.km.toFixed(1)} km
            {metrics ? <span className="text-sm font-medium text-muted-foreground"> · {sample.paceLabel}/km</span> : null}
          </span>
          {metrics ? <span className="text-sm text-muted-foreground">{sample.hr} bpm</span> : null}
        </p>
      </div>
      <div
        data-part="map"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none rounded-2xl bg-muted"
      >
        <svg data-part="route" viewBox="0 0 320 160" className="h-40 w-full" aria-hidden>
          <path d={ROUTE_D} fill="none" stroke="var(--muted-foreground)" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
          <path
            data-part="traveled"
            d={ROUTE_D}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${sample.t * GEO.total} ${GEO.total}`}
            opacity={0.4 + gain * 0.6}
          />
          <circle data-marker cx={sample.point.x} cy={sample.point.y} r={7} fill="var(--background)" stroke="var(--foreground)" strokeWidth={3} />
        </svg>
      </div>
      <svg data-part="spark" viewBox="0 0 120 32" className="mt-2 h-8 w-24" aria-hidden>
        <path d={SPARK} fill="none" stroke="var(--chart-2)" strokeWidth={2} />
        <circle cx={sparkX} cy={sparkY} r={2.5} fill="var(--foreground)" />
      </svg>
      <div
        role="slider"
        aria-label="Route progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sample.t * 100)}
        aria-valuetext={`${sample.km.toFixed(1)} kilometers, ${sample.paceLabel} per kilometer`}
        tabIndex={0}
        data-part="track"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mt-2 h-8 touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-foreground motion-reduce:transition-none"
          style={{ width: `${sample.t * 100}%`, opacity: 0.35 + gain * 0.45, transition: reduced ? "none" : `width ${ease}ms linear` }}
        />
        <motion.span
          data-part="thumb"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background motion-reduce:transition-none"
          style={{ left: `${sample.t * 100}%`, transition: reduced ? "none" : `left ${ease}ms linear` }}
        />
      </div>
    </div>
  )
}
