"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Air, Intercom, Homerun, and heyclicky (via Mobbin), original implementation.
 * https://mobbin.com/sites/sections/9e00570d-8572-4630-a99a-54974bb02ee3
 * https://mobbin.com/sites/sections/8ef342a4-9bd4-48f1-ae25-ae71812ceee8
 * https://mobbin.com/sites/sections/5e3e5e65-26db-4844-86fb-32b5d3684907
 * https://mobbin.com/sites/sections/1d93b1a5-9238-42ad-8dae-40533c3d803b
 */

export interface SillGleamPassProps {
  pace?: number
  intensity?: number
  path?: GleamPath
  loop?: boolean
  className?: string
  onValueChange?: (state: { phase: number; playing: boolean }) => void
}

export type GleamPath = "edge" | "diagonal"
export type GleamMode = "pass" | "paused" | "still" | "rest" | "held"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function round1(value: number) {
  return Math.round(value * 10) / 10
}

export function gleamStep(pace: number) {
  return Math.round(clamp(0.008 * rateOf(pace), 0.002, 0.04) * 10000) / 10000
}

export function gleamPoint(phase: number, path: GleamPath) {
  const t = clamp(phase, 0, 1)
  if (path === "diagonal") return { x: round1(t * 100), y: round1(t * 100) }
  const p = t * 4
  if (p < 1) return { x: round1(p * 100), y: 0 }
  if (p < 2) return { x: 100, y: round1((p - 1) * 100) }
  if (p < 3) return { x: round1((3 - p) * 100), y: 100 }
  if (t >= 1) return { x: 0, y: 0 }
  return { x: 0, y: round1((4 - p) * 100) }
}

export function gleamAlpha(intensity: number) {
  return Math.round((0.12 + clamp(intensity, 0, 1) * 0.28) * 1000) / 1000
}

export function gleamSpan(intensity: number) {
  return Math.round((28 + clamp(intensity, 0, 1) * 36) * 10) / 10
}

export function SillGleamPass({
  pace = 1,
  intensity = 0.18,
  path = "edge",
  loop = true,
  className,
  onValueChange,
}: SillGleamPassProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef(0)
  const frameRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const pausedRef = useRef(false)
  const loopRef = useRef(loop)
  const paceRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const [phase, setPhase] = useState(0)
  const [paused, setPaused] = useState(false)
  const [opened, setOpened] = useState(0)
  const shown = reduced ? 0 : phase
  const point = gleamPoint(shown, path)
  const alpha = gleamAlpha(gain)
  const span = gleamSpan(gain)
  const mode: GleamMode = reduced ? "still" : paused ? "paused" : !loop && phase >= 1 ? "rest" : live ? "pass" : "held"
  const playing = mode === "pass"

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current || pausedRef.current) {
        frameRef.current = 0
        return
      }
      let next = phaseRef.current + gleamStep(paceRef.current)
      if (next >= 1) {
        if (!loopRef.current) {
          phaseRef.current = 1
          setPhase(1)
          frameRef.current = 0
          return
        }
        next = Math.round((next % 1) * 1000) / 1000
      } else {
        next = Math.round(next * 1000) / 1000
      }
      phaseRef.current = next
      setPhase(next)
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    pausedRef.current = paused
    loopRef.current = loop
    paceRef.current = paceRate
    stop()
    if (!live || reduced || paused) return () => stop()
    if (!loop && phaseRef.current >= 1) return () => stop()
    kick()
    return () => stop()
  }, [live, reduced, paused, loop, paceRate])

  useEffect(() => {
    onValueChange?.({ phase: shown, playing })
  }, [shown, playing, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  return (
    <div
      ref={rootRef}
      data-slot="sill-gleam-pass"
      data-ritual="sill-gleam"
      data-gleam={mode}
      data-phase={shown.toFixed(3)}
      data-path={path}
      data-loop={loop ? "on" : "off"}
      data-opened={opened}
      data-playing={playing ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background p-4">
        <div className="relative z-10">
          <h3 className="text-base font-semibold text-foreground">Window card</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">The edge light never takes the click.</p>
          <button
            type="button"
            onClick={() => setOpened((count) => count + 1)}
            className={cn("mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
          >
            Open card
          </button>
        </div>
        <motion.div
          data-gleam-layer=""
          aria-hidden="true"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: span,
            height: span,
            opacity: alpha,
            pointerEvents: "none",
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%)",
          }}
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:transition-none"
        />
      </div>
      <button
        type="button"
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
        className={cn("mt-3 rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
      >
        {paused ? "Play gleam" : "Pause gleam"}
      </button>
    </div>
  )
}
