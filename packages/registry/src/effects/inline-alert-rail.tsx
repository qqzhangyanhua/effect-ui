"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Substack, Clerk, Claude, v0, and TIDAL (via Mobbin), original implementation.
 * https://mobbin.com/screens/286c847a-7843-4ff8-a13f-4fd526bd635f
 * https://mobbin.com/screens/cc5ea40b-c5e8-4b80-ae30-7991b8119906
 * https://mobbin.com/screens/6e3d049f-83d9-4d35-912e-3763c1030a49
 * https://mobbin.com/screens/6d4a5709-4a2b-4c85-8476-3a6574c8f0ef
 * https://mobbin.com/screens/f334b3f4-5102-44dd-a942-6635ed6aa6a8
 */

export interface InlineAlertRailProps {
  pace?: number
  intensity?: number
  nudge?: NudgeKind
  icon?: AlertIcon
  className?: string
  onValueChange?: (state: { phase: Phase }) => void
}

export type NudgeKind = "none" | "rim" | "soft"
export type AlertIcon = "alert" | "dot"
type Phase = "empty" | "error" | "success"

interface Rim {
  progress: number
  still: boolean
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const EMPTY_COPY = "Empty. Submit checks the reference."

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function alertStep(pace: number) {
  const frames = clamp(20 / paceRate(pace), 12, 28)
  return Math.round((1 / frames) * 1000) / 1000
}

export function referenceVerdict(value: string): "empty" | "short" | "ok" {
  const text = value.trim()
  if (text.length === 0) return "empty"
  if (text.length < 3 || !/[a-z]/i.test(text)) return "short"
  return "ok"
}

export function rimShift(progress: number, nudge: NudgeKind, still: boolean) {
  if (still || nudge !== "soft" || progress < 0) return 0
  return 0
}

export function rimOpacity(progress: number, nudge: NudgeKind, intensity: number, still: boolean) {
  if (nudge === "none") return 0
  const cap = 0.35 + clamp(intensity, 0, 1) * 0.5
  if (still) return Math.round(cap * 0.65 * 1000) / 1000
  if (progress < 0.25) return cap
  return Math.round(cap * (1 - ((progress - 0.25) / 0.75) * 0.4) * 1000) / 1000
}

export function washOpacity(progress: number, nudge: NudgeKind, intensity: number, still: boolean) {
  if (nudge !== "soft") return 0
  const cap = 0.05 + clamp(intensity, 0, 1) * 0.08
  if (still) return cap
  return Math.round(cap * (1 - progress * 0.45) * 1000) / 1000
}

function Mark({ kind }: { kind: "hollow" | "alert" | "dot" | "check" }) {
  if (kind === "check") {
    return (
      <svg data-icon="check" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 10.2 l2.4 2.4 5.4-5.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === "hollow") {
    return (
      <svg data-icon="hollow" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
        <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    )
  }
  if (kind === "dot") {
    return (
      <svg data-icon="dot" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 6.5 l7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg data-icon="alert" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 5.5 v5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function InlineAlertRail({
  pace = 1,
  intensity = 0.18,
  nudge = "rim",
  icon = "alert",
  className,
  onValueChange,
}: InlineAlertRailProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const onValueRef = useRef(onValueChange)
  const fieldId = useId()
  const noteId = useId()
  const patternId = `hatch-${useId().replace(/:/g, "")}`
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [value, setValue] = useState("")
  const [phase, setPhase] = useState<Phase>("empty")
  const [message, setMessage] = useState(EMPTY_COPY)
  const [rim, setRim] = useState<Rim | null>(null)
  const armed = phase === "error" && nudge !== "none" && live

  if (!armed && rim) setRim(null)
  else if (armed && reduced && (!rim || !rim.still)) setRim({ progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase })
  }, [phase])

  useEffect(() => {
    if (phase === "error") fieldRef.current?.focus()
  }, [phase, message])

  useEffect(() => {
    return () => {
      gen.current += 1
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (live && !reduced) return
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }, [live, reduced])

  function playRim() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
    if (!live || reduced || nudge === "none") return
    const token = gen.current
    const step = alertStep(pace)
    let progress = 0
    setRim({ progress: 0, still: false })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setRim({ progress: 1, still: true })
        return
      }
      setRim({ progress, still: false })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const verdict = referenceVerdict(value)
    if (verdict === "ok") {
      gen.current += 1
      cancelAnimationFrame(raf.current)
      setPhase("success")
      setMessage("Reference accepted.")
      return
    }
    setPhase("error")
    setMessage(verdict === "empty" ? "Add a reference." : "Use at least 3 letters.")
    playRim()
  }

  const still = !rim || rim.still || reduced
  const stroke = rim ? rimOpacity(rim.progress, nudge, intensity, still) : 0
  const wash = rim ? washOpacity(rim.progress, nudge, intensity, still) : 0
  const mark = phase === "error" ? icon : phase === "success" ? "check" : "hollow"

  return (
    <div
      ref={rootRef}
      data-slot="inline-alert-rail"
      data-ritual="alert-rail"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-phase={phase}
      data-nudge={nudge}
      data-icon={icon}
      data-rim={rim && armed ? (rim.still || reduced ? "still" : "run") : "off"}
      data-shift={rimShift(rim?.progress ?? 0, nudge, still)}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <form className="relative z-10 space-y-3" onSubmit={onSubmit}>
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          Reference
        </label>
        <div className="relative">
          <input
            ref={fieldRef}
            id={fieldId}
            value={value}
            autoComplete="off"
            spellCheck={false}
            aria-invalid={phase === "error"}
            aria-describedby={noteId}
            onChange={(event) => setValue(event.target.value)}
            className={cn(
              focusRing,
              "w-full rounded-xl border bg-background px-3 py-3 text-sm text-foreground",
              phase === "error" ? "border-dashed border-destructive" : "border-border",
            )}
          />
          {rim && armed ? (
            <div aria-hidden="true" data-rim-layer="" style={{ pointerEvents: "none" }} className="pointer-events-none absolute inset-0">
              <motion.span
                style={{ pointerEvents: "none", opacity: stroke }}
                className="pointer-events-none absolute inset-0 rounded-xl border border-destructive motion-reduce:transition-none"
              />
              {nudge === "soft" ? (
                <motion.span
                  data-wash=""
                  style={{ pointerEvents: "none", opacity: wash }}
                  className="pointer-events-none absolute inset-0 rounded-xl bg-destructive motion-reduce:transition-none"
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <div id={noteId} role={phase === "error" ? "alert" : "status"} className="flex items-start gap-2 text-sm">
          {phase === "error" ? (
            <svg
              data-pattern="hatch"
              width="8"
              height="32"
              aria-hidden="true"
              style={{ pointerEvents: "none" }}
              className="pointer-events-none mt-0.5 shrink-0 text-destructive"
            >
              <defs>
                <pattern id={patternId} width="4" height="4" patternUnits="userSpaceOnUse">
                  <path d="M0 4 L4 0" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="8" height="32" fill={`url(#${patternId})`} />
            </svg>
          ) : null}
          <span className={phase === "error" ? "text-destructive" : phase === "success" ? "text-primary" : "text-muted-foreground"}>
            <Mark kind={mark} />
          </span>
          <span className={phase === "error" ? "text-destructive" : "text-foreground"}>{message}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setValue("lane")}
            className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => {
              gen.current += 1
              cancelAnimationFrame(raf.current)
              setValue("")
              setPhase("empty")
              setMessage(EMPTY_COPY)
              fieldRef.current?.focus()
            }}
            className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}
          >
            Clear
          </button>
          <button type="submit" className={cn("rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground", focusRing)}>
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
