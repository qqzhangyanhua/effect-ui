"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Mercury, Squarespace, Lindy, Visitors, and Railway (via Mobbin), original implementation.
 * https://mobbin.com/screens/0f1077ca-927b-4984-9c90-71f71a2ba777
 * https://mobbin.com/screens/f48cfdb8-bcd5-40f9-86ea-ec9b38593170
 * https://mobbin.com/screens/f70008f9-171b-4090-a1df-c2c62f34cf27
 * https://mobbin.com/screens/d897d98e-42b2-4ff4-a3f7-03a12f079588
 * https://mobbin.com/screens/6ee59ad8-1bb2-473c-bad4-e7e08f525da0
 */

export interface HazeAmbientVeilProps {
  pace?: number
  intensity?: number
  tint?: HazeTint
  lift?: number
  className?: string
  onValueChange?: (state: { clear: number }) => void
}

export type HazeTint = "muted" | "primary-soft"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function hazeFrames(pace: number) {
  return clamp(Math.round(12 / rateOf(pace)), 4, 28)
}

export function veilAlpha(amount: number, intensity: number) {
  const density = 0.16 + clamp(intensity, 0, 1) * 0.42
  return Math.round((1 - clamp(amount, 0, 1)) * density * 1000) / 1000
}

export function liftPx(amount: number, lift: number) {
  return Math.round((1 - clamp(amount, 0, 1)) * clamp(lift, 0, 1) * 10 * 10) / 10
}

export function HazeAmbientVeil({
  pace = 1,
  intensity = 0.28,
  tint = "muted",
  lift = 0.2,
  className,
  onValueChange,
}: HazeAmbientVeilProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const amountRef = useRef(0)
  const frameRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const seenLive = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const liftGain = clamp(lift, 0, 1)
  const paceRate = rateOf(pace)
  const [amount, setAmount] = useState(0)
  const [acks, setAcks] = useState(0)
  const clear = reduced ? 1 : amount
  const alpha = veilAlpha(clear, gain)
  const rise = liftPx(clear, liftGain)
  const showVeil = !reduced && clear < 0.999
  const veilMix =
    tint === "primary-soft"
      ? `color-mix(in oklab, var(--primary) ${Math.round(alpha * 100)}%, transparent)`
      : `color-mix(in oklab, var(--muted) ${Math.round(alpha * 100)}%, transparent)`

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        frameRef.current = 0
        amountRef.current = 1
        setAmount(1)
        return
      }
      const step = 1 / hazeFrames(paceRef.current)
      const next = Math.min(1, Math.round((amountRef.current + step) * 1000) / 1000)
      amountRef.current = next
      setAmount(next)
      if (next >= 1) {
        frameRef.current = 0
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function replay() {
    if (reducedRef.current || !liveRef.current) {
      stop()
      amountRef.current = 1
      setAmount(1)
      return
    }
    stop()
    amountRef.current = 0
    setAmount(0)
    kick()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    if (reduced) {
      stop()
      return () => stop()
    }
    if (!live) {
      stop()
      if (seenLive.current && amountRef.current < 1) {
        amountRef.current = 1
        setAmount(1)
      }
      return () => stop()
    }
    seenLive.current = true
    if (amountRef.current < 1) kick()
    return () => stop()
  }, [live, reduced, paceRate])

  useEffect(() => {
    onValueChange?.({ clear })
  }, [clear, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    replay()
  }

  return (
    <div
      ref={rootRef}
      data-slot="haze-ambient-veil"
      data-ritual="haze-veil"
      data-clear={clear.toFixed(3)}
      data-tint={tint}
      data-lift={rise.toFixed(1)}
      data-acks={acks}
      data-playing={showVeil && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border border-border bg-card p-6 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <motion.div style={{ transform: `translateY(${rise}px)` }} className="relative z-10 motion-reduce:transition-none">
        <h3 className="text-base font-semibold text-foreground">Soft arrival</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          A light veil lifts off the headline. The buttons stay available the whole time.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setAcks((count) => count + 1)
              replay()
            }}
            className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
          >
            Continue
          </button>
          <button
            type="button"
            onClick={replay}
            className={cn("rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
          >
            Reset veil
          </button>
        </div>
      </motion.div>
      {showVeil ? (
        <div
          data-veil=""
          data-alpha={alpha.toFixed(3)}
          aria-hidden="true"
          style={{ background: veilMix, pointerEvents: "none" }}
          className="pointer-events-none absolute inset-0 z-20"
        />
      ) : null}
    </div>
  )
}
