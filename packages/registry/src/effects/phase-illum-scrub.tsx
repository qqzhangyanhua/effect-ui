"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type PhaseSpan = "5" | "7" | "14"
export type PhaseName = "New" | "Waxing" | "Full" | "Waning"

export interface PhaseIllumScrubProps {
  pace?: number
  intensity?: number
  span?: PhaseSpan
  auto?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const START = 0.18
const TRACK = 280

interface Box {
  left: number
  width: number
}

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

export function phaseSpanCount(span: string) {
  if (span === "5") return 5
  if (span === "14") return 14
  return 7
}

export function phaseSample(t: number) {
  const u = quantize(t)
  const illum = Math.round(Math.sin(Math.PI * u) * 100)
  let phase: PhaseName = "Waning"
  if (u <= 0.04 || u >= 0.96) phase = "New"
  else if (u < 0.46) phase = "Waxing"
  else if (u <= 0.54) phase = "Full"
  return { t: u, illum, phase }
}

export function phaseDays(span: string) {
  const count = phaseSpanCount(span)
  const today = Math.floor((count - 1) / 2)
  return Array.from({ length: count }, (_, index) => {
    const offset = index - today
    const label = offset === 0 ? "TODAY" : offset > 0 ? `+${offset}` : `${offset}`
    const t = quantize(index / (count - 1))
    return { label, t }
  })
}

export function phaseFromPointer(clientX: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : TRACK
  const left = rect.width > 0 ? rect.left : 0
  return quantize((clientX - left) / width)
}

function moonClip(t: number) {
  const lit = Math.sin(Math.PI * clamp(t, 0, 1))
  const hide = Math.round((1 - lit) * 1000) / 10
  if (t <= 0.5) return `inset(0 0 0 ${hide}%)`
  return `inset(0 ${hide}% 0 0)`
}

function curvePath() {
  let path = ""
  for (let i = 0; i <= 28; i += 1) {
    const t = i / 28
    const x = (8 + t * 144).toFixed(1)
    const y = (28 - Math.sin(Math.PI * t) * 22).toFixed(1)
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
  }
  return path
}

const ILLUM_CURVE = curvePath()

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function PhaseIllumScrub({
  pace = 1,
  intensity = 0.7,
  span = "7",
  auto = false,
  className,
  onValueChange,
}: PhaseIllumScrubProps) {
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
  const days = phaseDays(span)
  const [t, setT] = useState(START)
  const [dragging, setDragging] = useState(false)
  const [rest, setRest] = useState<"idle" | "settle">("idle")
  const playing = auto && !reduced && !dragging
  const phase = dragging ? (reduced ? "idle" : "scrubbing") : playing ? "playing" : reduced ? "idle" : rest
  const sample = phaseSample(t)
  const ease = reduced ? 0 : Math.round(180 / rate)
  const glow = Math.round(8 + gain * 18 + sample.illum / 8)

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
      const advanced = tRef.current + dt * 0.25 * rateRef.current
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

  function read(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return phaseFromPointer(event.clientX, rect)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDragging(true)
    commit(read(event))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(read(event))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    commit(read(event))
    setDragging(false)
    if (!auto) setRest("settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      commit(tRef.current + 0.02)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      commit(tRef.current - 0.02)
    } else if (event.key === "Home") {
      event.preventDefault()
      commit(0)
    } else if (event.key === "End") {
      event.preventDefault()
      commit(0.5)
    } else {
      return
    }
    if (!auto) setRest(reduced ? "idle" : "settle")
  }

  const dotX = 8 + sample.t * 144
  const dotY = 28 - (sample.illum / 100) * 22

  return (
    <div
      ref={ref}
      data-slot="phase-illum-scrub"
      data-ritual="moon-illum"
      data-pace={rate}
      data-intensity={gain}
      data-span={days.length}
      data-auto={auto ? "on" : "off"}
      data-t={sample.t.toFixed(2)}
      data-illum={sample.illum}
      data-phase={sample.phase}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">Phase</p>
        <p role="status" className="text-right">
          <span className="block text-2xl font-semibold text-foreground">{sample.illum}%</span>
          <span className="text-sm text-muted-foreground">{sample.phase}</span>
        </p>
      </div>
      <div
        data-moon
        className="relative mx-auto size-36 overflow-hidden rounded-full border border-border bg-muted"
        style={{ boxShadow: `0 0 ${glow}px color-mix(in oklab, var(--foreground) ${30 + Math.round(gain * 40)}%, transparent)` }}
      >
        <div
          data-lit
          className="absolute inset-0 bg-foreground motion-reduce:transition-none"
          style={{
            clipPath: moonClip(sample.t),
            opacity: 0.55 + gain * 0.45,
            transition: reduced ? "none" : `clip-path ${ease}ms linear, opacity ${ease}ms linear`,
          }}
        />
        <span data-crater className="absolute left-[30%] top-[34%] size-3 rounded-full bg-background/40" />
        <span data-crater className="absolute right-[28%] top-[52%] size-2 rounded-full bg-background/35" />
      </div>
      <svg data-part="illum-curve" viewBox="0 0 160 36" className="mt-2 h-9 w-full" aria-hidden>
        <path d={ILLUM_CURVE} fill="none" stroke="var(--chart-2)" strokeWidth={2} />
        <circle data-part="illum-dot" cx={dotX} cy={dotY} r={3} fill="var(--foreground)" />
      </svg>
      <div data-part="days" className="mt-1 flex justify-between gap-1">
        {days.map((day) => (
          <button
            key={day.label}
            type="button"
            onClick={() => {
              commit(day.t)
              if (!auto) setRest(reduced ? "idle" : "settle")
            }}
            className={cn(
              "min-w-0 flex-1 rounded-full px-0.5 py-1 text-[10px]",
              day.label === "TODAY" ? "bg-foreground font-semibold text-background" : "text-muted-foreground",
            )}
          >
            {day.label}
          </button>
        ))}
      </div>
      <div
        role="slider"
        aria-label="Moon phase"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sample.t * 100)}
        aria-valuetext={`${sample.phase} ${sample.illum}%`}
        tabIndex={0}
        data-part="track"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mt-2 h-8 touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <motion.span
          data-part="thumb"
          className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border border-border bg-background motion-reduce:transition-none"
          style={{
            left: `${sample.t * 100}%`,
            transform: "translate(-50%, -50%)",
            transition: reduced ? "none" : `left ${ease}ms linear`,
          }}
        />
      </div>
      {reduced ? (
        <input
          type="range"
          aria-label="Illumination"
          min={0}
          max={100}
          value={Math.round(sample.t * 100)}
          onChange={(event) => commit(Number(event.target.value) / 100)}
          className="mt-2 w-full"
        />
      ) : null}
    </div>
  )
}
