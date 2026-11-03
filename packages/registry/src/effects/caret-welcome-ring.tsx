"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Base, HubSpot, Calendly, Bonsai, and Zillow (via Mobbin), original implementation.
 * https://mobbin.com/screens/758189a6-ec9c-47ea-96b3-0ddff9ddec5d
 * https://mobbin.com/screens/89fd3b1c-117a-4b76-801b-45fc76431fc5
 * https://mobbin.com/screens/c5b09a03-1415-4325-95fa-138af5c1bf03
 * https://mobbin.com/screens/9aba4849-6d29-4e47-9a9f-49ec414153c5
 * https://mobbin.com/screens/bd3235e4-658f-49fd-aeb2-7278c55f58a6
 */

export interface CaretWelcomeRingProps {
  pace?: number
  intensity?: number
  style?: WelcomeStyle
  caret?: CaretKind
  className?: string
  onValueChange?: (state: { phase: "empty" | "filled"; focused: boolean }) => void
}

export type WelcomeStyle = "ring" | "underline"
export type CaretKind = "bar" | "block"

interface Welcome {
  progress: number
  still: boolean
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const CORNERS = [
  { id: "nw", className: "left-2 top-2 border-l-2 border-t-2", x: -1, y: -1 },
  { id: "ne", className: "right-2 top-2 border-r-2 border-t-2", x: 1, y: -1 },
  { id: "sw", className: "bottom-2 left-2 border-b-2 border-l-2", x: -1, y: 1 },
  { id: "se", className: "right-2 bottom-2 border-r-2 border-b-2", x: 1, y: 1 },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function welcomeStep(pace: number) {
  const frames = clamp(22 / paceRate(pace), 12, 30)
  return Math.round((1 / frames) * 1000) / 1000
}

export function ringOpacity(progress: number, intensity: number, still: boolean) {
  const cap = 0.28 + clamp(intensity, 0, 1) * 0.5
  if (still) return Math.round(cap * 0.72 * 1000) / 1000
  const fade = progress < 0.3 ? progress / 0.3 : 1
  return Math.round(cap * fade * 1000) / 1000
}

export function ringSpread(progress: number, style: WelcomeStyle, still: boolean) {
  if (still || style === "underline") return 0
  const travel = Math.sin(clamp(progress, 0, 1) * Math.PI) * 2
  return Math.round(travel * 100) / 100
}

export function caretOpacity(progress: number, still: boolean) {
  if (still) return 0
  if (progress <= 0.65) return 0.9
  return Math.round((1 - (progress - 0.65) / 0.35) * 1000) / 1000
}

export function CaretWelcomeRing({
  pace = 1,
  intensity = 0.34,
  style = "ring",
  caret = "bar",
  className,
  onValueChange,
}: CaretWelcomeRingProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const raf = useRef(0)
  const gen = useRef(0)
  const onValueRef = useRef(onValueChange)
  const fieldId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const [welcome, setWelcome] = useState<Welcome | null>(null)
  const phase = value.trim().length > 0 ? "filled" : "empty"

  if ((!focused || !live) && welcome) setWelcome(null)
  else if (focused && live && reduced && (!welcome || !welcome.still)) setWelcome({ progress: 1, still: true })

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase, focused })
  }, [phase, focused])

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

  function stop() {
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }

  function play() {
    stop()
    if (!live || reduced) return
    const token = gen.current
    const step = welcomeStep(pace)
    let progress = 0
    setWelcome({ progress: 0, still: false })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setWelcome({ progress: 1, still: true })
        return
      }
      setWelcome({ progress, still: false })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function onFocus() {
    setFocused(true)
    play()
  }

  function onBlur() {
    stop()
    setFocused(false)
  }

  const spread = welcome ? ringSpread(welcome.progress, style, welcome.still || reduced) : 0
  const opacity = welcome ? ringOpacity(welcome.progress, intensity, welcome.still || reduced) : 0
  const caretAlpha = welcome ? caretOpacity(welcome.progress, welcome.still || reduced) : 0

  return (
    <div
      ref={rootRef}
      data-slot="caret-welcome-ring"
      data-ritual="caret-welcome"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-caret={caret}
      data-phase={phase}
      data-ring={welcome ? (welcome.still || reduced ? "still" : "run") : "off"}
      data-spread={spread}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative z-10 space-y-3">
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          Display name
        </label>
        <div className="relative">
          <input
            ref={fieldRef}
            id={fieldId}
            value={value}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setValue(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className={cn(
              focusRing,
              "relative z-10 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground",
            )}
          />
          {welcome ? (
            <div
              data-ring-layer=""
              aria-hidden="true"
              style={{ pointerEvents: "none" }}
              className="pointer-events-none absolute inset-0 z-20"
            >
              {style === "underline" ? (
                <motion.span
                  data-underline=""
                  style={{ pointerEvents: "none", opacity }}
                  className="pointer-events-none absolute inset-x-3 bottom-2 h-0.5 bg-primary motion-reduce:transition-none"
                />
              ) : (
                CORNERS.map((corner) => (
                  <motion.span
                    key={corner.id}
                    data-corner={corner.id}
                    style={{
                      pointerEvents: "none",
                      opacity,
                      transform: `translate(${corner.x * spread}px, ${corner.y * spread}px)`,
                    }}
                    className={cn(
                      "pointer-events-none absolute h-3 w-3 border-primary motion-reduce:transition-none",
                      corner.className,
                    )}
                  />
                ))
              )}
              {caretAlpha > 0 ? (
                <motion.span
                  data-caret-mark=""
                  style={{
                    pointerEvents: "none",
                    opacity: caretAlpha,
                    width: caret === "block" ? "0.55rem" : "2px",
                  }}
                  className="pointer-events-none absolute top-1/2 left-3 h-4 -translate-y-1/2 rounded-sm bg-primary motion-reduce:transition-none"
                />
              ) : null}
            </div>
          ) : null}
        </div>
        <p data-phase-copy="" className="text-sm text-muted-foreground">
          {phase === "filled" ? "Filled" : "Empty"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setValue("Ada North")
              fieldRef.current?.focus()
            }}
            className={cn("rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground", focusRing)}
          >
            Sample
          </button>
          <button
            type="button"
            onClick={() => {
              setValue("")
              fieldRef.current?.blur()
            }}
            className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
