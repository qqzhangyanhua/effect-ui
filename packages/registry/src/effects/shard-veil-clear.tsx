"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Descript, GoDaddy, incident.io, and Codecademy (via Mobbin), original implementation.
 * https://mobbin.com/screens/c754f8b9-0c39-4e2d-8d28-16b88a0c42a8
 * https://mobbin.com/screens/d721c003-5ec7-42a3-a985-332782a54392
 * https://mobbin.com/screens/8c2d772c-0f84-4c51-bcae-2e8840a51271
 * https://mobbin.com/screens/c827145c-7d03-4771-908c-6a6c4be2abc7
 */

export interface ShardVeilClearProps {
  pace?: number
  intensity?: number
  shardCount?: number
  veilOpacity?: number
  className?: string
  onValueChange?: (state: { phase: ShardPhase }) => void
}

export type ShardPhase = "veiled" | "shattering" | "clear"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function shardCountOf(count: number) {
  if (!Number.isFinite(count)) return 8
  return clamp(Math.round(count), 4, 12)
}

export function veilAlpha(opacity: number) {
  if (!Number.isFinite(opacity)) return 0.86
  return clamp(opacity, 0.45, 1)
}

export function shardOrigin(index: number) {
  const edge = index % 4
  const along = 14 + ((index * 29) % 68)
  if (edge === 0) return { left: `${along}%`, top: "8%" }
  if (edge === 1) return { left: "84%", top: `${along}%` }
  if (edge === 2) return { left: `${along}%`, top: "76%" }
  return { left: "10%", top: `${along}%` }
}

export function shardVector(index: number, intensity: number) {
  const edge = index % 4
  const gain = 0.7 + clamp(intensity, 0, 1) * 0.8
  const along = ((index * 17) % 24) - 12
  const out = Math.round(54 * gain)
  if (edge === 0) return { x: along, y: -out }
  if (edge === 1) return { x: out, y: along }
  if (edge === 2) return { x: -along, y: out }
  return { x: -out, y: -along }
}

function settleFrames(pace: number) {
  return clamp(Math.round(14 / rateOf(pace)), 8, 18)
}

export function ShardVeilClear({
  pace = 1,
  intensity = 0.55,
  shardCount = 8,
  veilOpacity = 0.86,
  className,
  onValueChange,
}: ShardVeilClearProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const phaseRef = useRef<ShardPhase>("veiled")
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(0.55)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const pieces = shardCountOf(shardCount)
  const veil = veilAlpha(veilOpacity)
  const ease = reduced ? 0 : Math.round(160 / paceRate)
  const [phase, setPhase] = useState<ShardPhase>("veiled")
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    gainRef.current = gain
  }, [live, reduced, paceRate, gain])

  useEffect(() => {
    if ((live && !reduced) || frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    if (phaseRef.current !== "shattering") return
    phaseRef.current = "clear"
    setProgress(1)
    setPhase("clear")
  }, [live, reduced])

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function cancel() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function shatter() {
    liveRef.current = live
    reducedRef.current = reduced
    if (phaseRef.current === "clear") return
    cancel()
    if (reduced || !live) {
      phaseRef.current = "clear"
      setProgress(1)
      setPhase("clear")
      onValueChange?.({ phase: "clear" })
      return
    }
    phaseRef.current = "shattering"
    setPhase("shattering")
    setProgress(0)
    onValueChange?.({ phase: "shattering" })
    const frames = settleFrames(paceRef.current)
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        phaseRef.current = "clear"
        setProgress(1)
        setPhase("clear")
        frameRef.current = 0
        return
      }
      step += 1
      const done = step >= frames
      setProgress(done ? 1 : step / frames)
      if (done) {
        phaseRef.current = "clear"
        setPhase("clear")
        frameRef.current = 0
        onValueChange?.({ phase: "clear" })
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function reset() {
    cancel()
    phaseRef.current = "veiled"
    setProgress(0)
    setPhase("veiled")
    onValueChange?.({ phase: "veiled" })
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" || event.key === "r" || event.key === "R") {
      event.preventDefault()
      reset()
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      shatter()
    }
  }

  const shards = Array.from({ length: pieces }, (_, index) => {
    const origin = shardOrigin(index)
    const vector = shardVector(index, gain)
    return { index, origin, vector }
  })

  return (
    <div
      ref={ref}
      data-slot="shard-veil-clear"
      data-ritual="shard-veil"
      data-pace={paceRate}
      data-intensity={gain}
      data-count={pieces}
      data-veil={veil.toFixed(2)}
      data-phase={phase}
      data-progress={progress.toFixed(2)}
      data-playing={phase === "shattering" && live ? "on" : "off"}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <motion.button
        type="button"
        aria-label="Clear cover"
        onClick={shatter}
        onKeyDown={onKeyDown}
        className="relative w-full rounded-2xl border border-border bg-muted/40 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative overflow-hidden rounded-xl bg-muted/50">
          {phase === "shattering"
            ? shards.map((piece) => (
                <span
                  key={piece.index}
                  data-shard
                  aria-hidden
                  className="absolute z-0 h-3 w-5 bg-foreground/40"
                  style={{
                    ...piece.origin,
                    transform: `translate(${piece.vector.x * progress}%, ${piece.vector.y * progress}%) rotate(${progress * (piece.index % 2 === 0 ? 18 : -18)}deg)`,
                    opacity: 1 - progress,
                  }}
                />
              ))
            : null}
          <div data-copy className="relative z-10 m-3 rounded-xl bg-card px-4 py-4">
            <p className="text-sm font-semibold text-foreground">Morning note</p>
            <p className="mt-1 text-sm text-foreground">This sentence stays readable after the cover clears.</p>
          </div>
          {phase === "veiled" ? (
            <span data-veil aria-hidden className="absolute inset-0 z-20 rounded-xl bg-background" style={{ opacity: veil }} />
          ) : null}
        </div>
      </motion.button>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-full border border-border px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Reset
      </button>
    </div>
  )
}
