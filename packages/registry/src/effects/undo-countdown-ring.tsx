"use client"

import { useEffect, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface UndoCountdownRingProps {
  pace?: number
  intensity?: number
  autoCommit?: boolean
  label?: string
  className?: string
  onCommit?: () => void
  onUndo?: () => void
  onLock?: () => void
}

const RADIUS = 15

type Phase = "idle" | "counting" | "locked"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function secondsOf(pace: number) {
  if (!Number.isFinite(pace)) return 4
  return clamp(pace, 2, 8)
}

export function UndoCountdownRing({
  pace = 4,
  intensity = 0.6,
  autoCommit = false,
  label = "Commit",
  className,
  onCommit,
  onUndo,
  onLock,
}: UndoCountdownRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const lastRef = useRef<number | null>(null)
  const remainRef = useRef(0)
  const phaseRef = useRef<Phase>("idle")
  const liveRef = useRef(false)
  const autoNotify = useRef(false)
  const onCommitRef = useRef(onCommit)
  const onUndoRef = useRef(onUndo)
  const onLockRef = useRef(onLock)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const seconds = secondsOf(pace)
  const durationMs = Math.round(seconds * 1000)
  const stroke = Math.round((2 + gain * 6) * 10) / 10
  const circ = 2 * Math.PI * RADIUS
  const [phase, setPhase] = useState<Phase>("idle")
  const [remaining, setRemaining] = useState(durationMs)
  const [note, setNote] = useState("尚未提交")
  const [result, setResult] = useState<"open" | "undone" | "locked">("open")
  const [tracked, setTracked] = useState(durationMs)
  const [armed, setArmed] = useState(false)

  if (phase === "idle" && tracked !== durationMs) {
    setTracked(durationMs)
    setRemaining(durationMs)
  }

  if (autoCommit && !armed && phase !== "locked" && phase !== "counting" && (reduced || live)) {
    setArmed(true)
    setRemaining(durationMs)
    setPhase("counting")
    setResult("open")
    setNote("已提交，还可以撤销")
  }

  const ratio = durationMs <= 0 ? 0 : clamp(remaining / durationMs, 0, 1)
  const offset = reduced || phase !== "counting" ? 0 : circ * (1 - ratio)
  const shownSeconds = Math.max(0, Math.ceil(remaining / 1000))

  useEffect(() => {
    onCommitRef.current = onCommit
    onUndoRef.current = onUndo
    onLockRef.current = onLock
    remainRef.current = remaining
    phaseRef.current = phase
    liveRef.current = live
  }, [onCommit, onUndo, onLock, remaining, phase, live])

  useEffect(() => {
    if (!armed || autoNotify.current || phase !== "counting") return
    autoNotify.current = true
    onCommitRef.current?.()
  }, [armed, phase])

  useEffect(() => {
    if (reduced || !live || phase !== "counting") return
    let stopped = false
    lastRef.current = null
    const tick = (now: number) => {
      if (stopped || !liveRef.current || phaseRef.current !== "counting") return
      if (lastRef.current === null) {
        lastRef.current = now
      } else {
        const dt = Math.max(0, now - lastRef.current)
        lastRef.current = now
        const next = Math.max(0, remainRef.current - dt)
        remainRef.current = next
        setRemaining(next)
        if (next <= 0) {
          phaseRef.current = "locked"
          setPhase("locked")
          setResult("locked")
          setNote("已锁定")
          onLockRef.current?.()
          return
        }
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      lastRef.current = null
    }
  }, [reduced, live, phase])

  function begin() {
    if (phaseRef.current === "locked" || phaseRef.current === "counting") return
    const ms = Math.round(secondsOf(pace) * 1000)
    remainRef.current = ms
    phaseRef.current = "counting"
    setRemaining(ms)
    setPhase("counting")
    setResult("open")
    setNote("已提交，还可以撤销")
    onCommitRef.current?.()
  }

  function undo() {
    if (phaseRef.current !== "counting") return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    phaseRef.current = "idle"
    setPhase("idle")
    setResult("undone")
    setNote("已撤销")
    onUndoRef.current?.()
  }

  return (
    <div
      ref={ref}
      data-slot="undo-countdown-ring"
      data-ritual="undo-ring"
      data-pace={Number.isFinite(pace) ? pace : 4}
      data-intensity={gain}
      data-seconds={seconds}
      data-duration={durationMs}
      data-remaining={Math.round(remaining)}
      data-offset={offset.toFixed(1)}
      data-stroke={stroke}
      data-auto={autoCommit ? "on" : "off"}
      data-label={label}
      data-ring={reduced ? "static" : phase === "counting" ? "run" : "off"}
      data-state={phase}
      data-result={result}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <button
        type="button"
        onClick={begin}
        disabled={phase === "counting" || phase === "locked"}
        className="h-11 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {label}
      </button>
      {phase === "counting" ? (
        <div
          data-banner
          className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2"
          style={{ boxShadow: `0 0 0 ${Math.round(gain * 3)}px color-mix(in oklch, var(--primary) ${Math.round(gain * 40)}%, transparent)` }}
        >
          <svg viewBox="0 0 36 36" className="h-9 w-9 shrink-0" aria-hidden>
            <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
            <circle
              data-ring
              cx="18"
              cy="18"
              r={RADIUS}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={stroke}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <p className="min-w-0 flex-1 text-sm text-foreground">
            可以撤销
            <span data-left className="ml-2 font-mono text-muted-foreground">
              {shownSeconds}s
            </span>
          </p>
          <button
            type="button"
            onClick={undo}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
          >
            Undo
          </button>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
        {note}
      </p>
    </div>
  )
}
