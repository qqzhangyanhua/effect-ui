"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type HoldFillMode = "ring" | "bar"

export interface HoldFillCommitProps {
  pace?: number
  intensity?: number
  threshold?: number
  mode?: HoldFillMode
  className?: string
  onCommit?: () => void
}

const radius = 52
const circumference = 2 * Math.PI * radius

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function fixed(value: number) {
  return (Math.round(value * 1000) / 1000).toFixed(3)
}

export function HoldFillCommit({
  pace = 1,
  intensity = 0.7,
  threshold = 1,
  mode = "ring",
  className,
  onCommit,
}: HoldFillCommitProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const gate = clamp(threshold, 0.05, 1)
  const rate = rateOf(pace)
  const stroke = 4 + gain * 8
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"ready" | "holding" | "committed">("ready")
  const [holding, setHolding] = useState(false)
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const onCommitRef = useRef(onCommit)
  const visual = phase === "committed" ? 1 : Math.min(1, progress / gate)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  useEffect(() => {
    if (reduced || !live || phase === "committed") return
    if (!holding && progressRef.current <= 0) return
    let frame = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      if (holding) {
        const next = Math.min(1, Math.round((progressRef.current + 0.02 * rate) * 1000) / 1000)
        progressRef.current = next
        setProgress(next)
        if (next + 0.0001 >= gate) {
          commit()
          return
        }
      } else {
        const next = Math.max(0, Math.round((progressRef.current - 0.08 * rate) * 1000) / 1000)
        progressRef.current = next
        setProgress(next)
        if (next <= 0) {
          setPhase("ready")
          return
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [holding, live, reduced, phase, rate, gate])

  useEffect(() => {
    if (!holding) return
    const stop = () => setHolding(false)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    return () => {
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
    }
  }, [holding])

  function commit() {
    if (doneRef.current) return
    doneRef.current = true
    progressRef.current = 1
    setProgress(1)
    setHolding(false)
    setPhase("committed")
    onCommitRef.current?.()
  }

  function reset() {
    doneRef.current = false
    progressRef.current = 0
    setProgress(0)
    setHolding(false)
    setPhase("ready")
  }

  function begin(event?: { preventDefault?: () => void; button?: number }) {
    if (phase === "committed" || doneRef.current) return
    if (event?.button !== undefined && event.button !== 0) return
    event?.preventDefault?.()
    if (reduced || !live) {
      if (reduced) commit()
      return
    }
    setPhase("holding")
    setHolding(true)
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    begin(event)
    if (reduced || phase === "committed") return
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        return
      }
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Spacebar" && event.key !== "Enter") return
    if (event.repeat) return
    begin(event)
  }

  const label = phase === "committed" ? "已提交" : reduced ? "提交" : "按住提交"

  return (
    <div
      ref={ref}
      data-slot="hold-fill-commit"
      data-ritual="hold-fill"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-threshold={gate}
      data-mode={mode === "bar" ? "bar" : "ring"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-holding={holding ? "on" : "off"}
      data-state={phase}
      data-progress={fixed(progress)}
      role="group"
      aria-label="按住提交"
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-card-foreground motion-reduce:transition-none",
        phase === "committed" && "border-primary",
        className,
      )}
    >
      <div className="relative mx-auto grid h-44 w-44 place-items-center">
        {mode === "bar" ? null : (
          <svg viewBox="0 0 120 120" aria-hidden className="absolute inset-0 h-full w-full">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
            <circle
              data-ring=""
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * (1 - visual)}
              transform="rotate(-90 60 60)"
              opacity={0.4 + gain * 0.6}
            />
          </svg>
        )}
        <button
          type="button"
          data-hold=""
          aria-label={label}
          disabled={phase === "committed"}
          onPointerDown={onPointerDown}
          onPointerUp={() => setHolding(false)}
          onPointerCancel={() => setHolding(false)}
          onKeyDown={onKeyDown}
          onKeyUp={() => setHolding(false)}
          onBlur={() => setHolding(false)}
          onClick={() => {
            if (reduced) commit()
          }}
          className="relative z-10 grid size-24 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-80 motion-reduce:transition-none"
        >
          {label}
        </button>
      </div>
      {mode === "bar" ? (
        <div data-bar="" className="mt-4 overflow-hidden rounded-full bg-muted" style={{ height: 6 + gain * 10 }}>
          <div
            data-fill=""
            className="h-full bg-primary motion-reduce:transition-none"
            style={{ width: `${visual * 100}%`, opacity: 0.45 + gain * 0.55 }}
          />
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-label="按住进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(visual * 100)}
        className="sr-only"
      />
      <div className="mt-4 flex justify-center">
        <button type="button" data-reset="" onClick={reset} className="rounded-full border border-border px-3 py-1.5 text-sm">
          Reset
        </button>
      </div>
    </div>
  )
}
