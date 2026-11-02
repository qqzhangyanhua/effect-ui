"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Optimal Workshop, Maze, Gumloop, and Airtable (via Mobbin), original implementation.
 * https://mobbin.com/screens/862a94e6-5409-4b90-8412-729be87f8bf7
 * https://mobbin.com/screens/bf355361-3592-45fb-9b5b-196c32bbe8c4
 * https://mobbin.com/screens/d7e88d46-ff4b-4838-9692-9d00398d2980
 * https://mobbin.com/flows/fceaecb8-6019-49fe-87ad-4a76dd68e271
 */

export interface MagnetPocketCatchProps {
  pace?: number
  intensity?: number
  radius?: number
  snapPreview?: boolean
  className?: string
  onValueChange?: (state: { docked: boolean; x: number; y: number }) => void
}

export type PocketPhase = "free" | "preview" | "catch" | "docked"

interface Point {
  x: number
  y: number
}

export const POCKET: Point = { x: 0.74, y: 0.5 }
export const TOKEN_HOME: Point = { x: 0.2, y: 0.5 }

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function catchRadius(radius: number) {
  const factor = clamp(Number.isFinite(radius) ? radius : 1, 0.6, 1.6)
  return Math.round((0.1 + factor * 0.08) * 1000) / 1000
}

export function pocketDistance(point: Point) {
  return Math.hypot(point.x - POCKET.x, point.y - POCKET.y)
}

export function insidePocket(point: Point, radius: number) {
  return pocketDistance(point) <= catchRadius(radius) + 0.0001
}

export function previewPoint(point: Point, intensity: number, active: boolean): Point {
  if (!active) return point
  const gain = 0.16 + clamp(intensity, 0, 1) * 0.14
  return {
    x: point.x + (POCKET.x - point.x) * gain,
    y: point.y + (POCKET.y - point.y) * gain,
  }
}

function settleFrames(pace: number) {
  return clamp(Math.round(16 / rateOf(pace)), 8, 22)
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

export function MagnetPocketCatch({
  pace = 1,
  intensity = 0.55,
  radius = 1,
  snapPreview = true,
  className,
  onValueChange,
}: MagnetPocketCatchProps) {
  const ref = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const pointRef = useRef<Point>(TOKEN_HOME)
  const outsideRef = useRef<Point>(TOKEN_HOME)
  const phaseRef = useRef<PocketPhase>("free")
  const dockedRef = useRef(false)
  const intentRef = useRef<{ point: Point; docked: boolean }>({ point: TOKEN_HOME, docked: false })
  const dragRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const gainRef = useRef(0.55)
  const radiusRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const reach = catchRadius(radius)
  const ease = reduced ? 0 : Math.round(180 / paceRate)
  const [point, setPoint] = useState<Point>(TOKEN_HOME)
  const [phase, setPhase] = useState<PocketPhase>("free")
  const [docked, setDocked] = useState(false)
  const showPreview = snapPreview && phase === "preview"
  const visual = previewPoint(point, gain, showPreview)

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    gainRef.current = gain
    radiusRef.current = radius
  }, [live, reduced, paceRate, gain, radius])

  useEffect(() => {
    if ((live && !reduced) || frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
    const intent = intentRef.current
    pointRef.current = intent.point
    dockedRef.current = intent.docked
    phaseRef.current = intent.docked ? "docked" : "free"
    setPoint(intent.point)
    setDocked(intent.docked)
    setPhase(intent.docked ? "docked" : "free")
  }, [live, reduced])

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) window.cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function publish(next: Point, nextPhase: PocketPhase, nextDocked: boolean) {
    const safe = { x: Math.round(next.x * 1000) / 1000, y: Math.round(next.y * 1000) / 1000 }
    pointRef.current = safe
    phaseRef.current = nextPhase
    dockedRef.current = nextDocked
    setPoint(safe)
    setPhase(nextPhase)
    setDocked(nextDocked)
  }

  function cancel() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function readPoint(event: PointerEvent<HTMLElement>): Point {
    const rect = stageRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : 320
    const height = rect && rect.height > 0 ? rect.height : 176
    const left = rect && rect.width > 0 ? rect.left : 0
    const top = rect && rect.height > 0 ? rect.top : 0
    return {
      x: clamp((event.clientX - left) / width, 0.06, 0.94),
      y: clamp((event.clientY - top) / height, 0.12, 0.88),
    }
  }

  function glideTo(from: Point, to: Point, nextDocked: boolean) {
    cancel()
    dragRef.current = false
    intentRef.current = { point: to, docked: nextDocked }
    if (reducedRef.current || !liveRef.current) {
      publish(to, nextDocked ? "docked" : "free", nextDocked)
      onValueChange?.({ docked: nextDocked, x: to.x, y: to.y })
      return
    }
    const frames = settleFrames(paceRef.current)
    const overshoot = 0.04 + gainRef.current * 0.04
    let step = 0
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        publish(to, nextDocked ? "docked" : "free", nextDocked)
        frameRef.current = 0
        return
      }
      step += 1
      const done = step >= frames
      const t = done ? 1 : settleAt(step, frames, 0, 1, overshoot)
      const next = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t }
      publish(next, done ? (nextDocked ? "docked" : "free") : "catch", nextDocked && done)
      if (done) {
        frameRef.current = 0
        onValueChange?.({ docked: nextDocked, x: to.x, y: to.y })
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function finish(next: Point) {
    if (insidePocket(next, radiusRef.current)) glideTo(next, POCKET, true)
    else glideTo(next, TOKEN_HOME, false)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    if (dockedRef.current) return
    liveRef.current = live
    reducedRef.current = reduced
    cancel()
    dragRef.current = true
    const next = readPoint(event)
    if (!insidePocket(next, radiusRef.current)) outsideRef.current = next
    publish(next, insidePocket(next, radiusRef.current) ? "preview" : "free", false)
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = readPoint(event)
    if (!insidePocket(next, radiusRef.current)) outsideRef.current = next
    publish(next, insidePocket(next, radiusRef.current) ? "preview" : "free", false)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    finish(readPoint(event))
  }

  function nudge(dx: number, dy: number) {
    if (dockedRef.current) return
    cancel()
    const next = {
      x: clamp(pointRef.current.x + dx, 0.06, 0.94),
      y: clamp(pointRef.current.y + dy, 0.12, 0.88),
    }
    if (!insidePocket(next, radiusRef.current)) outsideRef.current = next
    const preview = insidePocket(next, radiusRef.current)
    publish(next, preview ? "preview" : "free", false)
    onValueChange?.({ docked: false, x: next.x, y: next.y })
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    liveRef.current = live
    reducedRef.current = reduced
    const step = event.shiftKey ? 0.12 : 0.07
    if (event.key === "ArrowRight") {
      event.preventDefault()
      nudge(step, 0)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      nudge(-step, 0)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(0, -step)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(0, step)
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (dockedRef.current) glideTo(pointRef.current, TOKEN_HOME, false)
      else if (insidePocket(pointRef.current, radiusRef.current)) glideTo(pointRef.current, POCKET, true)
    } else if (event.key === "Escape") {
      event.preventDefault()
      if (dockedRef.current) return
      cancel()
      const back = outsideRef.current
      publish(back, "free", false)
      onValueChange?.({ docked: false, x: back.x, y: back.y })
    }
  }

  return (
    <div
      ref={ref}
      data-slot="magnet-pocket-catch"
      data-ritual="magnet-pocket"
      data-pace={paceRate}
      data-intensity={gain}
      data-radius={reach.toFixed(3)}
      data-preview={snapPreview ? "on" : "off"}
      data-docked={docked ? "on" : "off"}
      data-phase={phase}
      data-x={point.x.toFixed(3)}
      data-y={point.y.toFixed(3)}
      data-playing={phase === "catch" && live ? "on" : "off"}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("flex w-full items-start gap-3 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <div
        ref={stageRef}
        role="group"
        aria-label="Pocket token"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-44 flex-1 touch-none rounded-2xl border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span
          data-pocket
          aria-hidden
          className={cn(
            "absolute h-16 w-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-dashed border-foreground/50",
            phase === "preview" || docked ? "bg-primary/10" : "bg-transparent",
          )}
          style={{ left: `${POCKET.x * 100}%`, top: `${POCKET.y * 100}%` }}
        />
        <motion.span
          data-token
          aria-hidden
          className="absolute grid h-9 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-foreground text-xs font-medium text-background motion-reduce:transition-none"
          style={{ left: `${visual.x * 100}%`, top: `${visual.y * 100}%` }}
        >
          Token
        </motion.span>
      </div>
      <p role="status" data-label className="w-14 shrink-0 pt-2 text-sm font-medium text-foreground">
        {docked ? "袋内" : "袋外"}
      </p>
    </div>
  )
}
