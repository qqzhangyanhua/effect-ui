"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by GitBook, Air, and Dialpad (via Mobbin), original implementation.
 * https://mobbin.com/screens/67765a57-fa20-461d-aa20-65ad9cdcb25d
 * https://mobbin.com/screens/8e66cd6e-1a6e-49e4-bff5-68f987a39cfa
 * https://mobbin.com/screens/846c9e64-dac8-465f-8dd5-87dd4a6cd0cc
 */

export interface FolioDriftPlaneProps {
  pace?: number
  intensity?: number
  planeOpacity?: number
  axis?: "y" | "x"
  className?: string
  onValueChange?: (state: { progress: number; shift: number }) => void
}

export type DriftAxis = "y" | "x"

export const FOLIO_DRAG = 220

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function driftAxisOf(axis: string | undefined): DriftAxis {
  return axis === "x" ? "x" : "y"
}

export function driftTravel(intensity: number) {
  return Math.round((3 + clamp(intensity, 0, 1) * 10) * 10) / 10
}

export function driftOffset(progress: number, intensity: number) {
  const centered = clamp(progress, 0, 1) - 0.5
  return Math.round(centered * 2 * driftTravel(intensity) * 10) / 10
}

export function approachShift(current: number, target: number, pace: number) {
  const delta = target - current
  if (Math.abs(delta) < 0.05) return target
  const step = delta * clamp(0.34 * rateOf(pace), 0.18, 0.75)
  return Math.round((current + step) * 1000) / 1000
}

export function folioFromPointer(clientY: number, originY: number, origin: number) {
  return clamp(origin + (originY - clientY) / FOLIO_DRAG, 0, 1)
}

function capture(event: ReactPointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function FolioDriftPlane({
  pace = 1,
  intensity = 0.22,
  planeOpacity = 0.38,
  axis = "y",
  className,
  onValueChange,
}: FolioDriftPlaneProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const progressRef = useRef(0)
  const shownRef = useRef(driftOffset(0, intensity))
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(intensity)
  const dragRef = useRef(false)
  const originRef = useRef({ y: 0, progress: 0 })
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const opacity = clamp(planeOpacity, 0.15, 0.7)
  const mode = driftAxisOf(axis)
  const paceRate = rateOf(pace)
  const [progress, setProgress] = useState(0)
  const [shown, setShown] = useState(() => driftOffset(0, intensity))
  const [playing, setPlaying] = useState(false)

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function publish(next: number) {
    const value = Math.round(clamp(next, 0, 1) * 1000) / 1000
    progressRef.current = value
    setProgress(value)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current) {
        frameRef.current = 0
        setPlaying(false)
        return
      }
      if (reducedRef.current) {
        shownRef.current = 0
        setShown(0)
        frameRef.current = 0
        setPlaying(false)
        return
      }
      const target = driftOffset(progressRef.current, gainRef.current)
      const next = approachShift(shownRef.current, target, paceRef.current)
      shownRef.current = next
      setShown(next)
      if (Math.abs(next - target) < 0.05) {
        shownRef.current = target
        setShown(target)
        frameRef.current = 0
        setPlaying(false)
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    setPlaying(true)
    frameRef.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    gainRef.current = gain
    if (!live || reduced) {
      stop()
      return
    }
    const target = driftOffset(progressRef.current, gain)
    if (Math.abs(shownRef.current - target) >= 0.05) kick()
    return () => stop()
  }, [live, reduced, progress, gain, paceRate])

  useEffect(() => {
    onValueChange?.({ progress, shift: reduced ? 0 : shown })
  }, [progress, shown, reduced, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      publish(progressRef.current + 0.08)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      publish(progressRef.current - 0.08)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      publish(0)
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      publish(1)
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originRef.current = { y: event.clientY, progress: progressRef.current }
    capture(event)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    publish(folioFromPointer(event.clientY, originRef.current.y, originRef.current.progress))
  }

  function onPointerUp() {
    dragRef.current = false
  }

  const planeShift = reduced ? 0 : shown
  const transform = mode === "x" ? `translateX(${planeShift}px)` : `translateY(${planeShift}px)`

  return (
    <div
      ref={ref}
      data-slot="folio-drift-plane"
      data-ritual="folio-drift"
      data-progress={progress.toFixed(3)}
      data-plane-shift={planeShift.toFixed(1)}
      data-folio-shift="0"
      data-axis={mode}
      data-playing={playing && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full rounded-3xl border border-border bg-background p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">The passage stays put. Only the ground plane drifts.</p>
      <div
        tabIndex={0}
        role="region"
        aria-label="Reading folio"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn("relative h-80 touch-none overflow-hidden rounded-2xl border border-border bg-background", ring)}
      >
        <motion.div
          aria-hidden="true"
          data-plane=""
          style={{ opacity, transform }}
          className="absolute inset-6 rounded-2xl bg-muted motion-reduce:transition-none"
        />
        <div
          data-folio=""
          data-shift="0"
          style={{ transform: "none" }}
          className="relative z-10 m-10 rounded-xl border border-border bg-card px-4 py-4 text-card-foreground shadow-sm"
        >
          <h3 className="text-sm font-semibold text-foreground">Field folio</h3>
          <p className="mt-2 text-sm leading-6 text-foreground">
            A fixed passage stays readable while a single muted plane shifts a few pixels behind it.
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Arrow keys, Home, and End move the reading place. The words themselves do not slide.
          </p>
        </div>
      </div>
    </div>
  )
}
