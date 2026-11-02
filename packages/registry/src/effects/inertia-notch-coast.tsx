"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Cal AI, Replika, Sonos, and Cleo (via Mobbin), original implementation.
 * https://mobbin.com/screens/cc58e09b-ac29-471f-a883-eaf949272259
 * https://mobbin.com/screens/4eb025ce-3874-4420-8b3e-c50ee632fb45
 * https://mobbin.com/screens/52eea023-f6d8-4704-b380-51a018a0a751
 * https://mobbin.com/screens/39d6b9d5-1a21-4085-bb29-45d0609a5680
 */

export interface InertiaNotchCoastProps {
  pace?: number
  intensity?: number
  notches?: number
  showTicks?: boolean
  className?: string
  onValueChange?: (state: { index: number; label: string }) => void
}

export type CoastPhase = "rest" | "drag" | "coast"

const NAMES = ["Low", "Soft", "Mid", "Firm", "High", "Peak", "Max"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function notchCountOf(value: number) {
  if (!Number.isFinite(value)) return 5
  return clamp(Math.round(value), 3, 7)
}

export function notchAt(index: number, count: number) {
  const safe = notchCountOf(count)
  const last = Math.max(1, safe - 1)
  return clamp(Math.round(index), 0, last) / last
}

export function nearestNotch(position: number, count: number) {
  const safe = notchCountOf(count)
  const last = Math.max(1, safe - 1)
  return clamp(Math.round(clamp(position, 0, 1) * last), 0, last)
}

export function notchLabel(index: number, count: number) {
  const safe = notchCountOf(count)
  const names = NAMES.slice(0, safe)
  return names[clamp(index, 0, names.length - 1)] ?? "Low"
}

export function coastKeep(pace: number) {
  return clamp(0.86 - rateOf(pace) * 0.08, 0.62, 0.9)
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

export function InertiaNotchCoast({
  pace = 1,
  intensity = 0.55,
  notches = 5,
  showTicks = true,
  className,
  onValueChange,
}: InertiaNotchCoastProps) {
  const ref = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const posRef = useRef(0)
  const phaseRef = useRef<CoastPhase>("rest")
  const velocityRef = useRef(0)
  const destRef = useRef<number | null>(null)
  const dragRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(0.55)
  const countRef = useRef(5)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const count = notchCountOf(notches)
  const ease = reduced ? 0 : Math.round(180 / paceRate)
  const [position, setPosition] = useState(0)
  const [phase, setPhase] = useState<CoastPhase>("rest")
  const index = nearestNotch(position, count)
  const label = notchLabel(index, count)

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    gainRef.current = gain
    countRef.current = count
    const next = notchAt(nearestNotch(posRef.current, count), count)
    if (Math.abs(posRef.current - next) < 0.0005) return
    posRef.current = next
    setPosition(next)
    setPhase("rest")
  }, [live, reduced, paceRate, gain, count])

  useEffect(() => {
    if ((live && !reduced) || frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    const dest = destRef.current ?? notchAt(nearestNotch(posRef.current, countRef.current), countRef.current)
    destRef.current = dest
    posRef.current = dest
    phaseRef.current = "rest"
    setPosition(dest)
    setPhase("rest")
  }, [live, reduced])

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function publish(next: number, nextPhase: CoastPhase) {
    const safe = Math.round(clamp(next, -0.04, 1.04) * 1000) / 1000
    posRef.current = safe
    phaseRef.current = nextPhase
    setPosition(safe)
    setPhase(nextPhase)
  }

  function cancel() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function readPos(event: PointerEvent<HTMLElement>) {
    const rect = railRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : 320
    const left = rect && rect.width > 0 ? rect.left : 0
    const pad = 16
    const span = Math.max(1, width - pad * 2)
    return clamp((event.clientX - left - pad) / span, 0, 1)
  }

  function glideTo(from: number, to: number) {
    cancel()
    dragRef.current = false
    destRef.current = to
    if (reducedRef.current || !liveRef.current || Math.abs(to - from) < 0.001) {
      publish(to, "rest")
      onValueChange?.({ index: nearestNotch(to, countRef.current), label: notchLabel(nearestNotch(to, countRef.current), countRef.current) })
      return
    }
    const dir = Math.sign(to - from) || 1
    const overshoot = dir * (0.012 + gainRef.current * 0.02)
    const frames = settleFrames(paceRef.current)
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        publish(to, "rest")
        frameRef.current = 0
        return
      }
      step += 1
      const done = step >= frames
      publish(done ? to : settleAt(step, frames, from, to, overshoot), done ? "rest" : "coast")
      if (done) {
        frameRef.current = 0
        const landed = nearestNotch(to, countRef.current)
        onValueChange?.({ index: landed, label: notchLabel(landed, countRef.current) })
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function coast(from: number, velocity: number) {
    cancel()
    destRef.current = null
    if (reducedRef.current || !liveRef.current || Math.abs(velocity) < 0.01) {
      const dest = notchAt(nearestNotch(from, countRef.current), countRef.current)
      glideTo(from, dest)
      return
    }
    let pos = from
    let vel = velocity
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        const dest = notchAt(nearestNotch(posRef.current, countRef.current), countRef.current)
        publish(dest, "rest")
        frameRef.current = 0
        return
      }
      step += 1
      vel *= coastKeep(paceRef.current)
      pos = clamp(pos + vel, 0, 1)
      if (Math.abs(vel) < 0.008 || step >= 12) {
        frameRef.current = 0
        const dest = notchAt(nearestNotch(pos, countRef.current), countRef.current)
        glideTo(pos, dest)
        return
      }
      publish(pos, "coast")
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
    velocityRef.current = 0
    publish(readPos(event), reduced || !live ? "rest" : "drag")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = readPos(event)
    velocityRef.current = next - posRef.current
    publish(next, "drag")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const next = readPos(event)
    const delta = next - posRef.current
    const velocity = clamp((velocityRef.current || delta) * (0.45 + gainRef.current * 0.9), -0.12, 0.12)
    coast(next, velocity)
  }

  function goTo(indexTarget: number) {
    const dest = notchAt(indexTarget, count)
    glideTo(posRef.current, dest)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    liveRef.current = live
    reducedRef.current = reduced
    const current = nearestNotch(posRef.current, count)
    if (event.key === "ArrowRight") {
      event.preventDefault()
      goTo(Math.min(count - 1, current + 1))
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      goTo(Math.max(0, current - 1))
    } else if (event.key === "Home") {
      event.preventDefault()
      goTo(0)
    } else if (event.key === "End") {
      event.preventDefault()
      goTo(count - 1)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="inertia-notch-coast"
      data-ritual="inertia-notch"
      data-pace={paceRate}
      data-intensity={gain}
      data-notches={count}
      data-ticks={showTicks ? "on" : "off"}
      data-index={index}
      data-label={label}
      data-pos={position.toFixed(3)}
      data-phase={phase}
      data-playing={phase === "coast" && live ? "on" : "off"}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <p role="status" data-readout className="mb-3 text-sm font-semibold text-foreground">
        {label}
      </p>
      <div
        ref={railRef}
        role="slider"
        aria-label="Notch rail"
        aria-valuemin={0}
        aria-valuemax={count - 1}
        aria-valuenow={index}
        aria-valuetext={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-14 touch-none rounded-full border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="absolute top-1/2 right-4 left-4 h-1 -translate-y-1/2 rounded-full bg-foreground/15" />
        {showTicks
          ? Array.from({ length: count }, (_, tick) => (
              <span
                key={tick}
                data-tick
                aria-hidden
                className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/50"
                style={{ left: `calc(16px + (100% - 32px) * ${notchAt(tick, count)})` }}
              />
            ))
          : null}
        <motion.span
          data-puck
          aria-hidden
          className="absolute top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground motion-reduce:transition-none"
          style={{ left: `calc(16px + (100% - 32px) * ${clamp(position, -0.03, 1.03)})` }}
        />
      </div>
    </div>
  )
}
