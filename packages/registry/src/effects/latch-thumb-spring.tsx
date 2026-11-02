"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Cursor, Family, Airtasker, Pinterest, and Moonlitt (via Mobbin), original implementation.
 * https://mobbin.com/screens/5b7f5b3b-9ba9-44c8-a6c7-6f3df683d7ff
 * https://mobbin.com/screens/04224702-363b-45fa-9d2b-d2b25d2b19d0
 * https://mobbin.com/screens/5551ba32-7479-420b-9b1d-313be592240b
 * https://mobbin.com/screens/bc76818e-190c-4074-b4ab-3e4e0846b260
 * https://mobbin.com/screens/71891ae6-6a43-4b26-b9e9-3aa1974947b6
 */

export interface LatchThumbSpringProps {
  pace?: number
  intensity?: number
  trackFill?: boolean
  labels?: boolean
  className?: string
  onValueChange?: (state: { on: boolean }) => void
}

export type LatchPhase = "rest" | "drag" | "spring"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function latchOvershoot(intensity: number) {
  return 0.012 + clamp(intensity, 0, 1) * 0.05
}

export function latchHeld(position: number) {
  return clamp(position, 0, 1) >= 0.5
}

function settleFrames(pace: number) {
  return clamp(Math.round(14 / rateOf(pace)), 8, 18)
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

export function LatchThumbSpring({
  pace = 1,
  intensity = 0.28,
  trackFill = true,
  labels = true,
  className,
  onValueChange,
}: LatchThumbSpringProps) {
  const ref = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef(0)
  const posRef = useRef(0)
  const onRef = useRef(false)
  const phaseRef = useRef<LatchPhase>("rest")
  const dragRef = useRef<{ x: number; moved: boolean } | null>(null)
  const intentRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(0.28)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(170 / paceRate)
  const [position, setPosition] = useState(0)
  const [on, setOn] = useState(false)
  const [phase, setPhase] = useState<LatchPhase>("rest")

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
    const next = intentRef.current
    const dest = next ? 1 : 0
    posRef.current = dest
    onRef.current = next
    phaseRef.current = "rest"
    setPosition(dest)
    setOn(next)
    setPhase("rest")
  }, [live, reduced])

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function publish(next: number, nextOn: boolean, nextPhase: LatchPhase) {
    const safe = Math.round(clamp(next, -0.08, 1.08) * 1000) / 1000
    posRef.current = safe
    onRef.current = nextOn
    phaseRef.current = nextPhase
    setPosition(safe)
    setOn(nextOn)
    setPhase(nextPhase)
  }

  function cancel() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function readHold(event: PointerEvent<HTMLElement>) {
    const rect = trackRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : 240
    const left = rect && rect.width > 0 ? rect.left : 0
    return clamp((event.clientX - left) / width, 0, 1)
  }

  function glideTo(from: number, nextOn: boolean) {
    cancel()
    dragRef.current = null
    const to = nextOn ? 1 : 0
    intentRef.current = nextOn
    if (reducedRef.current || !liveRef.current) {
      publish(to, nextOn, "rest")
      onValueChange?.({ on: nextOn })
      return
    }
    const dir = Math.sign(to - from) || (nextOn ? 1 : -1)
    const overshoot = dir * latchOvershoot(gainRef.current)
    const frames = settleFrames(paceRef.current)
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        publish(to, nextOn, "rest")
        frameRef.current = 0
        return
      }
      step += 1
      const done = step >= frames
      publish(done ? to : settleAt(step, frames, from, to, overshoot), nextOn, done ? "rest" : "spring")
      if (done) {
        frameRef.current = 0
        onValueChange?.({ on: nextOn })
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function toggle() {
    glideTo(posRef.current, !onRef.current)
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== undefined && event.button !== 0) return
    liveRef.current = live
    reducedRef.current = reduced
    cancel()
    dragRef.current = { x: event.clientX, moved: false }
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag) return
    if (Math.abs(event.clientX - drag.x) > 4) drag.moved = true
    if (!drag.moved) return
    publish(readHold(event), latchHeld(readHold(event)), reduced || !live ? "rest" : "drag")
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag) return
    if (!drag.moved) {
      toggle()
      return
    }
    const hold = readHold(event)
    glideTo(hold, latchHeld(hold))
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    liveRef.current = live
    reducedRef.current = reduced
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggle()
      return
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      glideTo(posRef.current, true)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      glideTo(posRef.current, false)
    }
  }

  const thumb = clamp(position, -0.06, 1.06)

  return (
    <div
      ref={ref}
      data-slot="latch-thumb-spring"
      data-ritual="latch-thumb"
      data-pace={paceRate}
      data-intensity={gain}
      data-fill={trackFill ? "on" : "off"}
      data-labels={labels ? "on" : "off"}
      data-on={on ? "on" : "off"}
      data-pos={position.toFixed(3)}
      data-phase={phase}
      data-playing={phase === "spring" && live ? "on" : "off"}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <button
        ref={trackRef}
        type="button"
        role="switch"
        aria-label="Latch"
        aria-checked={on}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-9 min-w-0 flex-1 touch-none rounded-full border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          data-track
          aria-hidden
          className="absolute inset-y-1 left-1 rounded-full motion-reduce:transition-none"
          style={{
            width: trackFill ? `calc((100% - 0.5rem) * ${clamp(thumb, 0, 1)})` : "0px",
            background: "color-mix(in oklab, var(--primary) 28%, var(--muted))",
          }}
        />
        <motion.span
          data-thumb
          aria-hidden
          className="absolute top-1/2 size-7 -translate-y-1/2 rounded-full border border-border bg-background shadow-sm motion-reduce:transition-none"
          style={{ left: `calc(0.25rem + (100% - 2.25rem) * ${thumb})` }}
        />
      </button>
      {labels ? (
        <p data-caption className="w-12 shrink-0 text-sm font-medium text-foreground">
          {on ? "启用" : "关闭"}
        </p>
      ) : null}
    </div>
  )
}
