"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BearingCompassTurnProps {
  pace?: number
  intensity?: number
  snap?: boolean
  noise?: boolean
  className?: string
  onBearingChange?: (bearing: number) => void
}

const START = 248
const DIAL = 240
const DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"] as const

interface Box {
  left: number
  top: number
  width: number
  height: number
}

type BearingPhase = "idle" | "turning" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function wrap(degrees: number) {
  if (!Number.isFinite(degrees)) return 0
  return ((Math.round(degrees) % 360) + 360) % 360
}

export function bearingHeading(degrees: number) {
  const value = wrap(degrees)
  return DIRS[Math.round(value / 22.5) % 16] ?? "N"
}

export function bearingHeld(degrees: number, snap: boolean) {
  const value = wrap(degrees)
  if (!snap) return value
  return wrap(Math.round(value / 45) * 45)
}

export function bearingFromPointer(clientX: number, clientY: number, rect: Box) {
  const size = rect.width > 0 ? rect.width : DIAL
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  const dx = clientX - (left + size / 2)
  const dy = clientY - (top + size / 2)
  let degrees = (Math.atan2(dx, -dy) * 180) / Math.PI
  if (degrees < 0) degrees += 360
  return wrap(degrees)
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function BearingCompassTurn({
  pace = 1,
  intensity = 0.7,
  snap = false,
  noise = false,
  className,
  onBearingChange,
}: BearingCompassTurnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const bearingRef = useRef(START)
  const phaseRef = useRef(0)
  const onBearingRef = useRef(onBearingChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const snapRef = useRef(snap)
  const rateRef = useRef(1)
  const noiseRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(140 / rate)
  const [bearing, setBearing] = useState(START)
  const [wobble, setWobble] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [rest, setRest] = useState<"idle" | "settle">("idle")
  const humming = noise && !reduced && !dragging
  const phase: BearingPhase = dragging ? (reduced ? "idle" : "turning") : reduced ? "idle" : rest
  const heading = bearingHeading(bearing)
  const shownWobble = reduced ? 0 : wobble
  const angle = bearing + shownWobble

  useEffect(() => {
    onBearingRef.current = onBearingChange
    liveRef.current = live
    reducedRef.current = reduced
    snapRef.current = snap
    rateRef.current = rate
    noiseRef.current = humming
  }, [onBearingChange, live, reduced, snap, rate, humming])

  function commit(next: number, snapped: boolean) {
    const value = snapped ? bearingHeld(next, snapRef.current) : wrap(next)
    bearingRef.current = value
    setBearing(value)
    onBearingRef.current?.(value)
  }

  useEffect(() => {
    if (reduced || !live || !humming) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !noiseRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      phaseRef.current += dt * 5 * rateRef.current
      const next = Math.round(Math.sin(phaseRef.current) * 2.4 * 10) / 10
      setWobble(next)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live, humming])

  function read(event: PointerEvent<HTMLDivElement>) {
    return bearingFromPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDragging(true)
    commit(read(event), false)
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(read(event), false)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    commit(read(event), true)
    setDragging(false)
    setRest(reduced ? "idle" : "settle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 15 : 2
    if (event.key === "ArrowRight" || event.key === "ArrowUp") commit(bearingRef.current + step, false)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") commit(bearingRef.current - step, false)
    else if (event.key === "Home") commit(0, false)
    else return
    event.preventDefault()
    setRest(reduced ? "idle" : "settle")
  }

  return (
    <div
      ref={ref}
      data-slot="bearing-compass-turn"
      data-ritual="bearing-rose"
      data-pace={rate}
      data-intensity={gain}
      data-snap={snap ? "on" : "off"}
      data-noise={noise ? "on" : "off"}
      data-bearing={bearing}
      data-heading={heading}
      data-wobble={shownWobble.toFixed(1)}
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
        <p className="text-sm text-muted-foreground">Bearing</p>
        <p className="text-sm text-muted-foreground">{heading}</p>
      </div>
      <div
        role="slider"
        aria-label="Bearing"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={bearing}
        aria-valuetext={`${bearing} degrees ${heading}`}
        tabIndex={0}
        data-part="dial"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mx-auto size-60 touch-none rounded-full border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg data-part="rose" viewBox="0 0 240 240" className="size-full" aria-hidden>
          {Array.from({ length: 24 }, (_, index) => {
            const degrees = index * 15
            const rad = (degrees * Math.PI) / 180
            const inner = index % 6 === 0 ? 74 : 84
            const x1 = 120 + Math.sin(rad) * inner
            const y1 = 120 - Math.cos(rad) * inner
            const x2 = 120 + Math.sin(rad) * 98
            const y2 = 120 - Math.cos(rad) * 98
            return (
              <line
                key={degrees}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={index % 6 === 0 ? "var(--foreground)" : "var(--muted-foreground)"}
                strokeWidth={index % 6 === 0 ? 2 : 1}
                opacity={index % 6 === 0 ? 0.45 + gain * 0.55 : 0.45}
              />
            )
          })}
          <text x="120" y="34" textAnchor="middle" fill="var(--foreground)" fontSize="14">
            N
          </text>
          <text x="206" y="124" textAnchor="middle" fill="var(--foreground)" fontSize="14">
            E
          </text>
          <text x="120" y="214" textAnchor="middle" fill="var(--foreground)" fontSize="14">
            S
          </text>
          <text x="34" y="124" textAnchor="middle" fill="var(--foreground)" fontSize="14">
            W
          </text>
        </svg>
        <motion.div
          data-part="needle"
          className="absolute left-1/2 top-1/2 motion-reduce:transition-none"
          style={{
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
            transition: reduced ? "none" : `transform ${ease}ms linear`,
            filter: `drop-shadow(0 0 ${4 + gain * 8}px var(--foreground))`,
          }}
        >
          <span className="absolute bottom-0 left-1/2 h-16 w-1 -translate-x-1/2 rounded-full bg-foreground" />
          <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 rounded-full" style={{ background: "var(--chart-2)" }} />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="rounded-full bg-card/80 px-3 py-2 text-center">
            <p role="status" className="text-3xl font-semibold text-foreground">
              {bearing}°
            </p>
            <p className="text-sm text-muted-foreground">{heading}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
