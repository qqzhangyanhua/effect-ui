"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Original implementation.
 * An SVG curve covers one page. When the pass ends, the other page is in view.
 * This component does not navigate.
 */

export type CurtainDirection = "left" | "right" | "up" | "down"
export type CurtainSide = "north" | "south"

export interface CurtainRouteTransitionProps {
  duration?: number
  intensity?: number
  direction?: CurtainDirection
  className?: string
  onPass?: (state: { side: CurtainSide }) => void
}

const FRAME_MS = 16
const DURATION_MIN = 320
const DURATION_MAX = 1600
const DURATION_DEFAULT = 800

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const HALLS = {
  north: {
    title: "North hall",
    body: "A short page stays covered until the curved curtain has passed.",
    action: "Open south hall",
  },
  south: {
    title: "South hall",
    body: "The following page is plain once the curtain is gone.",
    action: "Open north hall",
  },
} as const

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function curtainDuration(duration: number) {
  if (!Number.isFinite(duration)) return DURATION_DEFAULT
  return clamp(Math.round(duration), DURATION_MIN, DURATION_MAX)
}

export function curtainIntensity(intensity: number) {
  if (!Number.isFinite(intensity)) return 0.4
  return Math.round(clamp(intensity, 0, 1) * 100) / 100
}

export function curtainBow(intensity: number) {
  return Math.round(curtainIntensity(intensity) * 36)
}

function unit(progress: number) {
  if (!Number.isFinite(progress)) return 0
  return clamp(progress, 0, 1)
}

export function curtainEdge(progress: number, direction: CurtainDirection) {
  const along = Math.round(unit(progress) * 1000) / 10
  if (direction === "left" || direction === "up") return Math.round((100 - along) * 10) / 10
  return along
}

function curtainDirection(direction: string | undefined): CurtainDirection {
  if (direction === "right" || direction === "up" || direction === "down") return direction
  return "left"
}

function format(value: number) {
  const rounded = Math.round(value * 10) / 10
  if (rounded === 0) return "0"
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function curtainPath(progress: number, intensity: number, direction: CurtainDirection) {
  const edge = curtainEdge(progress, direction)
  const bow = curtainBow(intensity)
  const edgeText = format(edge)
  if (direction === "left") {
    return `M 0 0 H ${edgeText} Q ${format(edge + bow)} 50 ${edgeText} 100 H 0 Z`
  }
  if (direction === "right") {
    return `M ${edgeText} 0 H 100 V 100 H ${edgeText} Q ${format(edge - bow)} 50 ${edgeText} 0 Z`
  }
  if (direction === "up") {
    return `M 0 0 V ${edgeText} Q 50 ${format(edge + bow)} 100 ${edgeText} V 0 Z`
  }
  return `M 0 ${edgeText} Q 50 ${format(edge - bow)} 100 ${edgeText} V 100 H 0 Z`
}

export function curtainProgress(elapsed: number, duration: number) {
  const ms = curtainDuration(duration)
  if (!Number.isFinite(elapsed) || elapsed <= 0) return 0
  return Math.min(1, Math.round((elapsed / ms) * 1000) / 1000)
}

function opposite(side: CurtainSide): CurtainSide {
  return side === "north" ? "south" : "north"
}

export function CurtainRouteTransition({
  duration = 800,
  intensity = 0.4,
  direction = "left",
  className,
  onPass,
}: CurtainRouteTransitionProps) {
  const reduced = usePrefersReducedMotion()
  const frameRef = useRef(0)
  const elapsedRef = useRef(0)
  const [side, setSide] = useState<CurtainSide>("north")
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const travel = curtainDirection(direction)
  const current = HALLS[side]
  const incoming = HALLS[opposite(side)]

  useEffect(() => {
    return () => {
      if (frameRef.current !== 0) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  function finish(next: CurtainSide) {
    frameRef.current = 0
    setPlaying(false)
    setProgress(0)
    setSide(next)
    onPass?.({ side: next })
  }

  function play() {
    if (frameRef.current !== 0) return
    const next = opposite(side)
    if (reduced) {
      finish(next)
      return
    }
    const ms = curtainDuration(duration)
    elapsedRef.current = 0
    setPlaying(true)
    setProgress(0)
    const step = () => {
      elapsedRef.current += FRAME_MS
      const nextProgress = curtainProgress(elapsedRef.current, ms)
      if (nextProgress >= 1) {
        finish(next)
        return
      }
      setProgress(nextProgress)
      frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return
    if (
      event.key !== "Enter" &&
      event.key !== " " &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown"
    ) {
      return
    }
    event.preventDefault()
    play()
  }

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Curtain route"
      data-slot="curtain-route-transition"
      data-side={side}
      data-playing={playing ? "on" : "off"}
      data-direction={travel}
      data-motion={reduced ? "off" : "on"}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        ring,
        className,
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">The button or the arrow keys play the curtain.</p>
      <div className="relative h-52 overflow-hidden rounded-2xl border border-border bg-background">
        {playing ? (
          <article aria-hidden inert className="pointer-events-none absolute inset-0 p-5">
            <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">Page</p>
            <h2 className="mt-2 text-xl font-medium">{incoming.title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{incoming.body}</p>
          </article>
        ) : null}
        <article className={playing ? "sr-only" : "absolute inset-0 p-5"}>
          <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">Page</p>
          <h2 className="mt-2 text-xl font-medium">{current.title}</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{current.body}</p>
        </article>
        {playing ? (
          <svg
            data-curtain="on"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-0 z-10 h-full w-full"
          >
            <path d={curtainPath(progress, intensity, travel)} fill="var(--primary)" />
          </svg>
        ) : null}
      </div>
      <button
        type="button"
        onClick={play}
        className={cn("mt-3 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground", ring)}
      >
        {current.action}
      </button>
    </div>
  )
}
