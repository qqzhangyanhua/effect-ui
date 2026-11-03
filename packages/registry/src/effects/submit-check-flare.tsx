"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Maze, Calendly, Upwork, and Uvodo (via Mobbin), original implementation.
 * https://mobbin.com/screens/30545233-1c08-436f-959b-253654674e61
 * https://mobbin.com/screens/c5b09a03-1415-4325-95fa-138af5c1bf03
 * https://mobbin.com/screens/cf5dee34-134e-4f43-9a41-5d64a458d21a
 * https://mobbin.com/screens/b4e5d7e5-a39f-4196-b41e-f859d737d3ab
 */

export interface SubmitCheckFlareProps {
  pace?: number
  intensity?: number
  style?: FlareStyle
  anchor?: FlareAnchor
  className?: string
  onValueChange?: (state: { phase: Phase }) => void
}

export type FlareStyle = "check" | "pill"
export type FlareAnchor = "button" | "field"
type Phase = "idle" | "error" | "done"

interface Flare {
  progress: number
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const IDLE_COPY = "Empty. Save a short name."

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function noteVerdict(value: string): "empty" | "short" | "ok" {
  const text = value.trim()
  if (text.length === 0) return "empty"
  if (text.length < 2 || !/[a-z]/i.test(text)) return "short"
  return "ok"
}

export function flareStep(pace: number) {
  const frames = clamp(18 / paceRate(pace), 10, 26)
  return Math.round((1 / frames) * 1000) / 1000
}

export function flareOpacity(progress: number, intensity: number, still: boolean) {
  if (still) return 0
  const cap = 0.2 + clamp(intensity, 0, 1) * 0.5
  return Math.round(cap * (1 - clamp(progress, 0, 1)) * 1000) / 1000
}

function Mark({ kind }: { kind: "hollow" | "alert" | "check" }) {
  const icon = kind === "check" ? "check" : kind === "alert" ? "alert" : "hollow"
  return (
    <svg data-icon={icon} viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
      {kind === "check" ? (
        <path d="M5 10.2 l3 3 7-7.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {kind === "alert" ? (
        <>
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 5.6 v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="10" cy="14" r="0.9" fill="currentColor" />
        </>
      ) : null}
      {kind === "hollow" ? (
        <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      ) : null}
    </svg>
  )
}

export function SubmitCheckFlare({
  pace = 1,
  intensity = 0.32,
  style = "check",
  anchor = "button",
  className,
  onValueChange,
}: SubmitCheckFlareProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const resetRef = useRef<HTMLButtonElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const onValueRef = useRef(onValueChange)
  const fieldId = useId()
  const noteId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [value, setValue] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")
  const [message, setMessage] = useState(IDLE_COPY)
  const [flare, setFlare] = useState<Flare | null>(null)

  if ((!live || reduced) && flare) setFlare(null)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase })
  }, [phase])

  useEffect(() => {
    if (phase === "error") fieldRef.current?.focus()
    if (phase === "done") resetRef.current?.focus()
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

  function playFlare() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
    if (!live || reduced) return
    const token = gen.current
    const step = flareStep(pace)
    let progress = 0
    setFlare({ progress: 0 })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setFlare(null)
        return
      }
      setFlare({ progress })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function reset() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
    setValue("")
    setPhase("idle")
    setMessage(IDLE_COPY)
    setFlare(null)
    fieldRef.current?.focus()
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const verdict = noteVerdict(value)
    if (verdict !== "ok") {
      gen.current += 1
      cancelAnimationFrame(raf.current)
      setPhase("error")
      setMessage(verdict === "empty" ? "Add a name before saving." : "Use at least 2 letters.")
      setFlare(null)
      return
    }
    setPhase("done")
    setMessage("Saved")
    playFlare()
  }

  const running = flare !== null && live && !reduced
  const opacity = running && flare ? flareOpacity(flare.progress, intensity, false) : 0
  const mark = phase === "done" ? "check" : phase === "error" ? "alert" : "hollow"
  const flareNode = running ? (
    <div data-flare-layer="" aria-hidden="true" style={{ pointerEvents: "none" }} className="pointer-events-none absolute inset-0 z-20">
      {style === "pill" ? (
        <motion.span
          data-pill=""
          style={{
            pointerEvents: "none",
            opacity,
            transform: `scaleX(${0.45 + (flare?.progress ?? 0) * 0.55})`,
          }}
          className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary motion-reduce:transition-none"
        />
      ) : (
        <motion.svg
          data-flare-check=""
          viewBox="0 0 32 32"
          style={{ pointerEvents: "none", opacity }}
          className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-primary motion-reduce:transition-none"
        >
          <motion.path
            d="M6 17 l6 6 14-15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="32"
            strokeDashoffset={32 * (1 - (flare?.progress ?? 0))}
          />
        </motion.svg>
      )}
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      data-slot="submit-check-flare"
      data-ritual="check-flare"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-anchor={anchor}
      data-phase={phase}
      data-flare={running ? "run" : "off"}
      data-check={phase === "done" ? "on" : "off"}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <form className="relative z-10 space-y-3" onSubmit={onSubmit}>
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          Note title
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
          {anchor === "field" ? flareNode : null}
        </div>
        <div id={noteId} role={phase === "error" ? "alert" : "status"} className="flex items-start gap-2 text-sm">
          <span className={phase === "error" ? "text-destructive" : phase === "done" ? "text-primary" : "text-muted-foreground"}>
            <Mark kind={mark} />
          </span>
          <span className={phase === "error" ? "text-destructive" : "text-foreground"}>{message}</span>
          {phase === "done" ? (
            <button ref={resetRef} type="button" onClick={reset} className={cn("ml-auto text-sm text-foreground", focusRing)}>
              Reset
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setValue("North note")} className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}>
            Sample
          </button>
          <button type="button" onClick={reset} className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}>
            Clear
          </button>
          <span className="relative inline-flex">
            <button type="submit" className={cn("rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground", focusRing)}>
              Save
            </button>
            {anchor === "button" ? flareNode : null}
          </span>
        </div>
      </form>
    </div>
  )
}
