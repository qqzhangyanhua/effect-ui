"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Featurebase and Eventbrite (via Mobbin), original implementation.
 * https://mobbin.com/screens/19c5dddb-0f80-4955-8ad0-a3acee80a2c5
 * https://mobbin.com/screens/317c039d-9b52-4435-99b7-bfd6cc498a53
 */

export interface RimRejectWobbleProps {
  pace?: number
  intensity?: number
  nudge?: NudgeKind
  copy?: CopyMode
  className?: string
  onValueChange?: (state: { phase: RejectPhase }) => void
}

export type NudgeKind = "rim" | "soft" | "none"
export type CopyMode = "on" | "off"
export type RejectPhase = "rest" | "reject"

interface Reject {
  progress: number
  still: boolean
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function rejectStep(pace: number) {
  const frames = clamp(12 / paceRate(pace), 8, 16)
  return Math.round((1 / frames) * 1000) / 1000
}

export function rejectShift(progress: number, intensity: number, nudge: NudgeKind, still: boolean) {
  if (still || nudge !== "soft") return 0
  const cap = Math.min(3, 1 + clamp(intensity, 0, 1) * 2)
  const wave = Math.sin(clamp(progress, 0, 1) * Math.PI)
  return Math.round(wave * cap * 10) / 10
}

export function rejectRim(progress: number, intensity: number, nudge: NudgeKind, still: boolean) {
  if (nudge === "none") return 0
  const cap = 0.28 + clamp(intensity, 0, 1) * 0.5
  if (still) return Math.round(cap * 1000) / 1000
  const fade = progress < 0.25 ? progress / 0.25 : 1
  return Math.round(cap * fade * 1000) / 1000
}

function BlockIcon() {
  return (
    <svg data-icon="block" viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 14 L14 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function RimRejectWobble({
  pace = 1,
  intensity = 0.22,
  nudge = "rim",
  copy = "on",
  className,
  onValueChange,
}: RimRejectWobbleProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const attemptRef = useRef<HTMLButtonElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const dragging = useRef(false)
  const onValueRef = useRef(onValueChange)
  const patternId = `hatch${useId().replace(/:/g, "")}`
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [reject, setReject] = useState<Reject | null>(null)
  const phase: RejectPhase = reject ? "reject" : "rest"

  if (reject && !reject.still && (reduced || !live)) setReject({ progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase })
  }, [phase])

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

  useEffect(() => {
    if (!reject) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      dismiss()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function stop() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }

  function play() {
    stop()
    if (reduced || !live) {
      setReject({ progress: 1, still: true })
      return
    }
    const token = gen.current
    const step = rejectStep(pace)
    let progress = 0
    setReject({ progress: 0, still: false })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setReject({ progress: 1, still: true })
        return
      }
      setReject({ progress, still: false })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function dismiss() {
    stop()
    dragging.current = false
    setReject(null)
    attemptRef.current?.focus()
  }

  const still = Boolean(reject?.still || reduced)
  const progress = reject?.progress ?? 0
  const shift = reject ? rejectShift(progress, intensity, nudge, still) : 0
  const rim = reject ? rejectRim(progress, intensity, nudge, still) : 0
  const message = copy === "on" ? "Can't drop here" : "Blocked"
  const buttonClass = cn("rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground", focusRing)

  return (
    <div
      ref={rootRef}
      data-slot="rim-reject-wobble"
      data-ritual="rim-reject"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-nudge={nudge}
      data-copy={copy}
      data-phase={phase}
      data-reject={reject ? (still ? "still" : "run") : "off"}
      data-shift={shift}
      className={cn(
        "relative w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Drag a chip into Locked, or use Attempt invalid move. Esc or Dismiss clears the rim. The nudge stays inside this card, and there is no sound.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div data-zone="open" className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Open</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {["Item A", "Item B"].map((label) => (
              <button
                key={label}
                type="button"
                style={{ touchAction: "none" }}
                onPointerDown={() => {
                  dragging.current = true
                }}
                onPointerUp={() => {
                  dragging.current = false
                }}
                className={cn("rounded-full border border-border px-3 py-1.5 text-sm text-foreground", focusRing)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          data-zone="locked"
          onPointerEnter={() => {
            if (dragging.current) play()
          }}
          className="relative rounded-2xl border border-border bg-background p-3 text-destructive"
          style={nudge === "soft" ? { transform: `translateX(${shift}px)` } : undefined}
        >
          {reject && nudge !== "none" ? (
            <motion.div
              data-rim-layer=""
              aria-hidden="true"
              style={{ pointerEvents: "none", opacity: rim }}
              className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-destructive motion-reduce:transition-none"
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full text-destructive">
                <defs>
                  <pattern id={patternId} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill={`url(#${patternId})`} opacity="0.35" />
              </svg>
            </motion.div>
          ) : null}
          <div className="relative z-10 flex items-center gap-2 text-sm font-medium">
            <BlockIcon />
            <span>Locked</span>
          </div>
          {reject ? (
            <p data-copy-line="" className="relative z-10 mt-2 text-sm text-foreground">
              {message}
            </p>
          ) : (
            <p className="relative z-10 mt-2 text-sm text-muted-foreground">Drop target is closed.</p>
          )}
        </div>
      </div>
      <p role="status" className="mt-3 text-sm text-foreground">
        {reject ? message : "Resting"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button ref={attemptRef} type="button" className={buttonClass} onClick={play}>
          Attempt invalid move
        </button>
        <button type="button" className={buttonClass} onClick={dismiss}>
          Dismiss
        </button>
        <button type="button" className={buttonClass} onClick={dismiss}>
          Reset
        </button>
      </div>
    </div>
  )
}
