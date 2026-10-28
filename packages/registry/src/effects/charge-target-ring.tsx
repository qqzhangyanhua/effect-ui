"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ChargeTargetRingProps {
  pace?: number
  intensity?: number
  pulse?: boolean
  showEta?: boolean
  className?: string
  onTargetChange?: (target: number) => void
}

const CHARGE_NOW = 0.7
const START = 0.8
const RING = 220
const RADIUS = 72
const CIRC = 2 * Math.PI * RADIUS

interface Box {
  left: number
  top: number
  width: number
  height: number
}

type ChargePhase = "idle" | "dragging" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function chargeTarget(value: number, current = CHARGE_NOW) {
  const floor = quantize(current)
  return Math.max(floor, quantize(value))
}

export function chargeReadout(target: number, current = CHARGE_NOW) {
  const goal = chargeTarget(target, current)
  const pct = Math.round(quantize(current) * 100)
  const mark = Math.round(goal * 100)
  const minutes = Math.round((goal - quantize(current)) * 420)
  return { current: quantize(current), target: goal, pct, mark, minutes }
}

export function chargeFromPointer(clientX: number, clientY: number, rect: Box, current = CHARGE_NOW) {
  const size = rect.width > 0 ? rect.width : RING
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  const dx = clientX - (left + size / 2)
  const dy = clientY - (top + size / 2)
  let degrees = (Math.atan2(dx, -dy) * 180) / Math.PI
  if (degrees < 0) degrees += 360
  return chargeTarget(degrees / 360, current)
}

function notchAt(target: number) {
  const theta = target * Math.PI * 2
  return {
    left: 50 + Math.sin(theta) * ((RADIUS / RING) * 100),
    top: 50 - Math.cos(theta) * ((RADIUS / RING) * 100),
  }
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function ChargeTargetRing({
  pace = 1,
  intensity = 0.7,
  pulse = false,
  showEta = true,
  className,
  onTargetChange,
}: ChargeTargetRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const targetRef = useRef(START)
  const beatRef = useRef(0)
  const onTargetRef = useRef(onTargetChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const pulsingRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(180 / rate)
  const [target, setTarget] = useState(START)
  const [beat, setBeat] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [rest, setRest] = useState<"idle" | "settle">("idle")
  const pulsing = pulse && !reduced && !dragging
  const phase: ChargePhase = dragging ? (reduced ? "idle" : "dragging") : reduced ? "idle" : rest
  const readout = chargeReadout(target)
  const notch = notchAt(readout.target)
  const glow = pulse && !reduced ? 0.65 + Math.sin(beat * Math.PI * 2) * 0.35 : 0.55 + gain * 0.45

  useEffect(() => {
    onTargetRef.current = onTargetChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    pulsingRef.current = pulsing
  }, [onTargetChange, live, reduced, rate, pulsing])

  function commit(next: number) {
    const value = chargeTarget(next)
    targetRef.current = value
    setTarget(value)
    onTargetRef.current?.(value)
  }

  useEffect(() => {
    if (reduced || !live || !pulsing) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !pulsingRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      beatRef.current = (beatRef.current + dt * 1.4 * rateRef.current) % 1
      setBeat(Math.round(beatRef.current * 100) / 100)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, pulsing])

  function read(event: PointerEvent<HTMLDivElement>) {
    return chargeFromPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDragging(true)
    commit(read(event))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(read(event))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    commit(read(event))
    setDragging(false)
    setRest(reduced ? "idle" : "settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") commit(targetRef.current + 0.01)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") commit(targetRef.current - 0.01)
    else if (event.key === "Home") commit(CHARGE_NOW)
    else if (event.key === "End") commit(1)
    else return
    event.preventDefault()
    setRest(reduced ? "idle" : "settle")
  }

  return (
    <div
      ref={ref}
      data-slot="charge-target-ring"
      data-ritual="charge-target"
      data-pace={rate}
      data-intensity={gain}
      data-pulse={pulse ? "on" : "off"}
      data-eta={showEta ? "on" : "off"}
      data-current={readout.current.toFixed(2)}
      data-target={readout.target.toFixed(2)}
      data-minutes={readout.minutes}
      data-beat={beat.toFixed(2)}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">Charge</p>
        <p className="text-sm text-muted-foreground">Target</p>
      </div>
      <div
        role="slider"
        aria-label="Charge target"
        aria-valuemin={Math.round(CHARGE_NOW * 100)}
        aria-valuemax={100}
        aria-valuenow={readout.mark}
        aria-valuetext={`Target ${readout.mark} percent`}
        tabIndex={0}
        data-part="ring"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mx-auto aspect-square w-56 touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox="0 0 220 220" className="size-full" aria-hidden>
          <circle cx="110" cy="110" r={RADIUS} fill="none" stroke="var(--border)" strokeWidth={12} />
          <circle
            data-part="charge-arc"
            cx="110"
            cy="110"
            r={RADIUS}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={`${CHARGE_NOW * CIRC} ${CIRC}`}
            strokeDashoffset={CIRC * 0.25}
            opacity={glow}
            style={{ filter: `drop-shadow(0 0 ${4 + gain * 12}px var(--foreground))` }}
          />
        </svg>
        <motion.span
          data-notch
          className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground motion-reduce:transition-none"
          style={{
            left: `${notch.left}%`,
            top: `${notch.top}%`,
            transition: reduced ? "none" : `left ${ease}ms linear, top ${ease}ms linear`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p role="status" className="text-3xl font-semibold text-foreground">
              ~{readout.pct}%
            </p>
            {showEta ? (
              <p data-part="eta" className="text-sm text-muted-foreground">
                Target {readout.mark}% · ~{readout.minutes}m
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
