"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface InkStrokeDrawProps {
  pace?: number
  intensity?: number
  stagger?: number
  fillAfter?: boolean
  className?: string
  onComplete?: () => void
}

const LABEL = "墨线"
const DASH = 300

const PATHS = [
  { id: "stem", d: "M28 92 C28 92 26 36 30 24 C46 22 52 40 50 58 C48 78 36 94 28 92" },
  { id: "sweep", d: "M70 30 C98 26 128 42 136 66 C144 90 116 102 90 94 C68 86 64 66 74 50 C84 34 108 34 118 48" },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function localProgress(global: number, index: number, stagger: number) {
  const delay = index * clamp(stagger, 0, 1) * 0.45
  const span = Math.max(0.25, 1 - delay)
  return clamp((global - delay) / span, 0, 1)
}

export function InkStrokeDraw({
  pace = 1,
  intensity = 0.65,
  stagger = 0.35,
  fillAfter = true,
  className,
  onComplete,
}: InkStrokeDrawProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onCompleteRef = useRef(onComplete)
  const phaseRef = useRef<"ready" | "drawing" | "complete">("ready")
  const stepRef = useRef(0)
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const gain = clamp(intensity, 0, 1)
  const shift = clamp(stagger, 0, 1)
  const rate = rateOf(pace)
  const stroke = Math.round((2 + gain * 4) * 10) / 10
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"ready" | "drawing" | "complete">("ready")
  const [run, setRun] = useState(0)
  const visualProgress = reduced ? 1 : progress
  const visualPhase = reduced ? "complete" : phase
  const filled = fillAfter && visualPhase === "complete"

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (reduced || !live) return
    if (phaseRef.current === "complete") return
    let frame = 0
    let stopped = false
    const total = Math.max(8, Math.round(20 / rate))
    const tick = () => {
      if (stopped) return
      const step = stepRef.current + 1
      stepRef.current = step
      const next = Math.min(1, step / total)
      progressRef.current = next
      setProgress(next)
      if (step >= total) {
        phaseRef.current = "complete"
        setPhase("complete")
        if (!doneRef.current) {
          doneRef.current = true
          onCompleteRef.current?.()
        }
        return
      }
      phaseRef.current = "drawing"
      setPhase("drawing")
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [reduced, live, run, rate])

  function replay() {
    if (reduced || !live) return
    doneRef.current = false
    stepRef.current = 0
    progressRef.current = 0
    phaseRef.current = "drawing"
    setProgress(0)
    setPhase("drawing")
    setRun((value) => value + 1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    replay()
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={LABEL}
      data-slot="ink-stroke-draw"
      data-ritual="ink-stroke"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-stagger={shift}
      data-fill={filled ? "on" : "off"}
      data-stroke={stroke}
      data-progress={visualProgress.toFixed(3)}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-state={visualPhase}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-6 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <svg viewBox="0 0 160 120" role="img" aria-label={LABEL} className="h-40 w-full">
        {PATHS.map((item, index) => {
          const local = localProgress(visualProgress, index, shift)
          const offset = (1 - local) * DASH
          return (
            <path
              key={item.id}
              data-stroke={item.id}
              data-offset={offset.toFixed(1)}
              d={item.d}
              fill={filled ? "var(--primary)" : "none"}
              stroke="var(--foreground)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={DASH}
              strokeDashoffset={offset}
              style={{
                filter: `drop-shadow(0 0 ${Math.round(gain * 8)}px color-mix(in oklch, var(--primary) ${Math.round(gain * 55)}%, transparent))`,
                transition: reduced ? "none" : "fill 180ms ease",
              }}
            />
          )
        })}
      </svg>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{LABEL}</p>
        <button
          type="button"
          data-replay=""
          onClick={replay}
          onKeyDown={onKeyDown}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          {visualPhase === "complete" ? "重播" : "开始"}
        </button>
      </div>
    </div>
  )
}
