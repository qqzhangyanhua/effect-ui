"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Wise, Snapchat, Best Buy, and Discord (via Mobbin), original implementation.
 * https://mobbin.com/screens/506c7149-fa0d-4ac9-ba2d-644c0e270693
 * https://mobbin.com/screens/af80cd74-548e-4033-9233-6198aa74953c
 * https://mobbin.com/screens/21c9f850-bd20-4a49-9355-82e5002da155
 * https://mobbin.com/screens/282684ca-b970-40bc-985d-fb5c53bd81d4
 */

export interface TetherYankReturnProps {
  pace?: number
  intensity?: number
  stiffness?: number
  showRope?: boolean
  className?: string
  onValueChange?: (state: { pull: number; phase: TetherPhase }) => void
}

export type TetherPhase = "rest" | "yank" | "return"

const REST = 0.18

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function firmOf(stiffness: number) {
  return clamp(Number.isFinite(stiffness) ? stiffness : 1, 0.5, 1.6)
}

export function tetherTravel(intensity: number) {
  return Math.round((0.2 + clamp(intensity, 0, 1) * 0.38) * 1000) / 1000
}

export function tetherShown(raw: number, intensity: number) {
  const max = tetherTravel(intensity)
  const x = clamp(raw, 0, max * 1.8)
  if (x <= 0.015) return 0
  const shown = max * (1 - 1 / (1 + x / Math.max(0.1, max * 0.55)))
  return Math.round(clamp(shown, 0, max) * 1000) / 1000
}

export function tetherFromPointer(ratio: number, intensity: number) {
  return tetherShown(Math.max(0, ratio - REST), intensity)
}

export function tetherStep(current: number, delta: number, intensity: number) {
  return Math.round(clamp(current + delta, 0, tetherTravel(intensity)) * 1000) / 1000
}

function settleFrames(pace: number, stiffness: number) {
  return clamp(Math.round(16 / (rateOf(pace) * firmOf(stiffness))), 8, 22)
}

function settleAt(step: number, total: number, from: number, to: number, overshoot: number) {
  const t = clamp(step / Math.max(1, total), 0, 1)
  if (t >= 1) return to
  const peak = to + overshoot
  if (Math.abs(overshoot) < 0.000001) return from + (to - from) * t
  if (t < 0.7) {
    const u = t / 0.7
    return from + (peak - from) * (1 - (1 - u) ** 3)
  }
  const u = (t - 0.7) / 0.3
  return peak + (to - peak) * (u * u * (3 - 2 * u))
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function TetherYankReturn({
  pace = 1,
  intensity = 0.55,
  stiffness = 1,
  showRope = true,
  className,
  onValueChange,
}: TetherYankReturnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const pullRef = useRef(0)
  const phaseRef = useRef<TetherPhase>("rest")
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(0.55)
  const firmRef = useRef(1)
  const dragRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const firm = firmOf(stiffness)
  const travel = tetherTravel(gain)
  const ease = reduced ? 0 : Math.round(200 / (paceRate * firm))
  const [pull, setPull] = useState(0)
  const [phase, setPhase] = useState<TetherPhase>("rest")
  const handle = 18 + (pull / Math.max(0.05, travel)) * 62
  const sag = 12 * (1 - clamp(pull / Math.max(0.05, travel), 0, 1))

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    gainRef.current = gain
    firmRef.current = firm
  }, [live, reduced, paceRate, gain, firm])

  useEffect(() => {
    if ((live && !reduced) || frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    pullRef.current = 0
    phaseRef.current = "rest"
    setPull(0)
    setPhase("rest")
  }, [live, reduced])

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function publish(next: number, nextPhase: TetherPhase) {
    const safe = Math.round(next * 1000) / 1000
    pullRef.current = safe
    phaseRef.current = nextPhase
    setPull(safe)
    setPhase(nextPhase)
  }

  function cancel() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function readRatio(event: PointerEvent<HTMLElement>) {
    const rect = stageRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : 320
    const left = rect && rect.width > 0 ? rect.left : 0
    return clamp((event.clientX - left) / width, 0, 1)
  }

  function glideHome(from: number) {
    cancel()
    dragRef.current = false
    if (from < 0.03 || reducedRef.current || !liveRef.current) {
      publish(0, "rest")
      onValueChange?.({ pull: 0, phase: "rest" })
      return
    }
    const overshoot = -(0.02 + gainRef.current * 0.045)
    const frames = settleFrames(paceRef.current, firmRef.current)
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        publish(0, "rest")
        frameRef.current = 0
        return
      }
      step += 1
      const done = step >= frames
      const next = done ? 0 : settleAt(step, frames, from, 0, overshoot)
      publish(next, done ? "rest" : "return")
      if (done) {
        frameRef.current = 0
        onValueChange?.({ pull: 0, phase: "rest" })
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    liveRef.current = live
    reducedRef.current = reduced
    cancel()
    dragRef.current = true
    const next = tetherFromPointer(readRatio(event), gainRef.current)
    publish(next, next > 0 ? "yank" : "rest")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = tetherFromPointer(readRatio(event), gainRef.current)
    publish(next, next > 0 ? "yank" : "rest")
  }

  function onPointerUp() {
    if (!dragRef.current && phaseRef.current !== "yank") return
    glideHome(pullRef.current)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    liveRef.current = live
    reducedRef.current = reduced
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      cancel()
      const next = tetherStep(pullRef.current, 0.08, gain)
      publish(next, next > 0 ? "yank" : "rest")
      onValueChange?.({ pull: next, phase: next > 0 ? "yank" : "rest" })
      return
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      cancel()
      const next = tetherStep(pullRef.current, -0.08, gain)
      publish(next, next > 0 ? "yank" : "rest")
      onValueChange?.({ pull: next, phase: next > 0 ? "yank" : "rest" })
      return
    }
    if (event.key === "Home" || event.key === "Escape") {
      event.preventDefault()
      glideHome(pullRef.current)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      cancel()
      const max = tetherTravel(gainRef.current)
      if (reduced || !live) {
        publish(0, "rest")
        onValueChange?.({ pull: 0, phase: "rest" })
        return
      }
      publish(max, "yank")
      glideHome(max)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="tether-yank-return"
      data-ritual="tether-yank"
      data-pace={paceRate}
      data-intensity={gain}
      data-stiffness={firm}
      data-rope={showRope ? "on" : "off"}
      data-pull={pull.toFixed(3)}
      data-phase={phase}
      data-playing={phase === "return" && live ? "on" : "off"}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <p data-caption className="mb-3 text-sm text-muted-foreground">
        Drag the handle. It springs back to the anchor.
      </p>
      <div
        ref={stageRef}
        role="slider"
        aria-label="Tether handle"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((pull / Math.max(0.05, travel)) * 100)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-28 touch-none rounded-2xl border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {showRope ? (
          <svg data-rope viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
            <path
              d={`M 10 50 Q ${(10 + handle) / 2} ${50 + sag} ${handle} 50`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-foreground/70"
            />
          </svg>
        ) : null}
        <span data-anchor aria-hidden className="absolute top-1/2 left-[10%] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
        <motion.span
          data-handle
          aria-hidden
          className="absolute top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground motion-reduce:transition-none"
          style={{ left: `${handle}%` }}
        />
      </div>
    </div>
  )
}
