"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PuzzleSlideFitProps {
  pace?: number
  intensity?: number
  target?: number
  jagged?: number
  className?: string
  onSuccess?: () => void
}

const stage = 320
const seeded = [0.62, 0.28, 0.74, 0.41, 0.55]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function goalOf(target: number) {
  return clamp(target, 0.2, 0.8)
}

function piecePath(width: number, height: number, jagged: number) {
  const teeth = 2 + Math.round(clamp(jagged, 0, 1) * 2)
  const step = height / teeth
  let d = `M 0 0 H ${(width - 12).toFixed(1)}`
  for (let index = 0; index < teeth; index += 1) {
    const y0 = index * step
    const mid = y0 + step / 2
    const y1 = y0 + step
    const bump = index % 2 === 0 ? 12 : 0
    d += ` V ${y0.toFixed(1)} H ${(width - 12 + bump).toFixed(1)} V ${mid.toFixed(1)} H ${(width - 12).toFixed(1)} V ${y1.toFixed(1)}`
  }
  d += " H 0 Z"
  return d
}

export function PuzzleSlideFit({
  pace = 1,
  intensity = 0.55,
  target = 0.62,
  jagged = 0.45,
  className,
  onSuccess,
}: PuzzleSlideFitProps) {
  const ref = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const xRef = useRef(0)
  const goalRef = useRef(goalOf(target))
  const phaseRef = useRef<"idle" | "sliding" | "success" | "retry">("idle")
  const drag = useRef(false)
  const done = useRef(false)
  const liveRef = useRef(false)
  const onSuccessRef = useRef(onSuccess)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const teeth = clamp(jagged, 0, 1)
  const tolerance = 0.03 + (1 - gain) * 0.1
  const piece = Math.round(64 + gain * 36)
  const travel = stage - piece
  const [goal, setGoal] = useState(() => goalOf(target))
  const [seed, setSeed] = useState(1)
  const [x, setX] = useState(0)
  const [phase, setPhase] = useState<"idle" | "sliding" | "success" | "retry">("idle")
  const nextGoal = goalOf(target)
  const [trackedGoal, setTrackedGoal] = useState(nextGoal)

  if (trackedGoal !== nextGoal) {
    setTrackedGoal(nextGoal)
    setGoal(nextGoal)
    setX(0)
    setPhase("idle")
  }

  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    goalRef.current = goal
    xRef.current = x
    phaseRef.current = phase
    if (phase !== "success") done.current = false
  }, [goal, x, phase])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current || phaseRef.current !== "retry") return
      xRef.current = 0
      phaseRef.current = "idle"
      setX(0)
      setPhase("idle")
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function setPosition(next: number, nextPhase: "idle" | "sliding" | "success" | "retry") {
    const clamped = clamp(next, 0, 1)
    xRef.current = clamped
    phaseRef.current = nextPhase
    setX(clamped)
    setPhase(nextPhase)
  }

  function succeed(at: number) {
    if (done.current) return
    done.current = true
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    goalRef.current = at
    setPosition(at, "success")
    onSuccessRef.current?.()
  }

  function miss() {
    const start = xRef.current
    if (reduced || !liveRef.current) {
      setPosition(0, "idle")
      return
    }
    setPhase("retry")
    phaseRef.current = "retry"
    let count = 0
    const total = Math.max(5, Math.round(10 / rate))
    const tick = () => {
      if (!liveRef.current) {
        setPosition(0, "idle")
        return
      }
      count += 1
      if (count >= total) {
        setPosition(0, "idle")
        frame.current = 0
        return
      }
      setPosition(start * (1 - count / total), "retry")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function check(raw: number) {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    const next = clamp(raw, 0, 1)
    xRef.current = next
    setX(next)
    if (Math.abs(next - goalRef.current) <= tolerance + 0.0001) succeed(goalRef.current)
    else miss()
  }

  function read(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : stage
    const left = rect?.left ?? 0
    return clamp((clientX - left) / width, 0, 1)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || done.current || (event.button !== undefined && event.button !== 0)) return
    drag.current = true
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    setPosition(read(event.clientX), "sliding")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !drag.current) return
    setPosition(read(event.clientX), "sliding")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    drag.current = false
    if (reduced) return
    check(read(event.clientX))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (reduced || done.current) return
    if (event.key === "ArrowRight") {
      event.preventDefault()
      setPosition(xRef.current + 0.05, "sliding")
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      setPosition(xRef.current - 0.05, "sliding")
    } else if (event.key === "Enter") {
      event.preventDefault()
      check(xRef.current)
    }
  }

  function refresh() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    const nextSeed = seed + 1
    const next = seeded[nextSeed % seeded.length] ?? 0.5
    done.current = false
    goalRef.current = next
    xRef.current = 0
    phaseRef.current = "idle"
    setSeed(nextSeed)
    setGoal(next)
    setX(0)
    setPhase("idle")
  }

  const path = piecePath(piece, 96, teeth)
  const fit = phase === "success" ? "ok" : phase === "retry" ? "miss" : "open"

  return (
    <div
      ref={ref}
      data-slot="puzzle-slide-fit"
      data-ritual="puzzle-slide"
      data-pace={rate}
      data-intensity={gain}
      data-target={goal.toFixed(3)}
      data-x={x.toFixed(3)}
      data-tolerance={tolerance.toFixed(3)}
      data-jagged={teeth.toFixed(2)}
      data-seed={seed}
      data-state={phase}
      data-fit={fit}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-32 overflow-hidden rounded-2xl border border-border bg-background" data-stage>
        <svg viewBox={`0 0 ${stage} 120`} className="h-full w-full" aria-hidden>
          <rect x="18" y="28" width="70" height="40" rx="8" fill="var(--accent)" />
          <rect x="120" y="36" width="90" height="24" rx="8" fill="var(--secondary)" />
          <rect x="220" y="24" width="48" height="56" rx="8" fill="var(--muted-foreground)" opacity="0.35" />
          <g transform={`translate(${(goal * travel).toFixed(1)} 12)`} data-notch>
            <path d={path} fill="none" stroke="var(--foreground)" strokeDasharray="4 4" strokeWidth="2" />
          </g>
          <g transform={`translate(${(x * travel).toFixed(1)} 12)`} data-piece>
            <path d={path} fill="var(--primary)" opacity={phase === "success" ? 1 : 0.92} />
          </g>
        </svg>
        {phase === "success" ? (
          <p className="absolute top-3 right-3 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground" data-check>
            对齐了
          </p>
        ) : null}
      </div>
      {reduced ? (
        <button type="button" onClick={() => succeed(goalRef.current)} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground">
          对齐
        </button>
      ) : (
        <div
          ref={trackRef}
          role="slider"
          aria-label="拼图滑块"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(x * 100)}
          tabIndex={0}
          data-track
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative mt-4 h-10 touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <span data-thumb className="absolute top-1 h-8 w-8 rounded-full bg-primary" style={{ left: `calc(${x * 100}% - ${x * 32}px)` }} />
        </div>
      )}
      <div className="mt-3">
        <button type="button" onClick={refresh} className="rounded-full border border-border px-3 py-1.5 text-sm">
          重排
        </button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {phase === "success" ? "已对齐" : "未对齐"}
      </p>
    </div>
  )
}
