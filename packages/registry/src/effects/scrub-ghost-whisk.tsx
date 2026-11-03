"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Paramount+, Disney+, Loom, Arcade, and Magnific (via Mobbin), original implementation.
 * https://mobbin.com/screens/481a1495-11e7-4f02-8d6f-ef961a12386b
 * https://mobbin.com/screens/f664c6b6-fd48-4c5d-9333-5aa34cc46fa5
 * https://mobbin.com/screens/03405c4e-2764-41b6-9093-783df57d87e4
 * https://mobbin.com/screens/0dff4ddd-39f5-4979-8da7-d9355ec556bd
 * https://mobbin.com/screens/8e4cce47-da84-465f-8a90-9c2b704a0d75
 */

export interface ScrubGhostWhiskProps {
  pace?: number
  intensity?: number
  style?: WhiskStyle
  linger?: number
  className?: string
  onValueChange?: (state: { value: number; ghost: boolean }) => void
}

export type WhiskStyle = "line" | "pip"

export interface Whisk {
  from: number
  to: number
  life: number
}

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function scrubRatio(clientX: number, left: number, width: number) {
  const span = width > 0 ? width : 1
  return Math.round(clamp((clientX - left) / span, 0, 1) * 1000) / 1000
}

export function whiskLength(intensity: number) {
  return Math.round((0.05 + clamp(intensity, 0, 1) * 0.12) * 1000) / 1000
}

export function whiskAlpha(intensity: number) {
  return Math.round((0.16 + clamp(intensity, 0, 1) * 0.36) * 1000) / 1000
}

export function whiskSpan(value: number, intensity: number) {
  const length = whiskLength(intensity)
  return {
    from: Math.round(clamp(value - length, 0, 1) * 1000) / 1000,
    to: Math.round(clamp(value, 0, 1) * 1000) / 1000,
  }
}

export function lingerFrames(linger: number, pace: number) {
  if (!Number.isFinite(linger) || linger <= 0) return 0
  return clamp(Math.round((linger / 40) * rateOf(pace)), 1, 24)
}

export function markLabel(value: number) {
  const total = Math.round(clamp(value, 0, 1) * 90)
  const seconds = total % 60
  return `00:${String(seconds).padStart(2, "0")}`
}

export function ScrubGhostWhisk({
  pace = 1,
  intensity = 0.3,
  style = "line",
  linger = 0,
  className,
  onValueChange,
}: ScrubGhostWhiskProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<Whisk | null>(null)
  const valueRef = useRef(0.42)
  const draggingRef = useRef(false)
  const frameRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const intensityRef = useRef(0.3)
  const lingerRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const [value, setValue] = useState(0.42)
  const [ghost, setGhost] = useState<Whisk | null>(null)
  const [dragging, setDragging] = useState(false)
  const [probes, setProbes] = useState(0)
  if ((!live || reduced) && (dragging || ghost)) {
    if (dragging) setDragging(false)
    if (ghost) setGhost(null)
  }

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function clearGhost() {
    stop()
    ghostRef.current = null
    setGhost(null)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      const current = ghostRef.current
      if (!liveRef.current || reducedRef.current) {
        draggingRef.current = false
        setDragging(false)
        ghostRef.current = null
        setGhost(null)
        frameRef.current = 0
        return
      }
      if (!current || current.life < 0) {
        frameRef.current = 0
        return
      }
      if (current.life <= 1) {
        ghostRef.current = null
        setGhost(null)
        frameRef.current = 0
        return
      }
      const next = { ...current, life: current.life - 1 }
      ghostRef.current = next
      setGhost(next)
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function showGhost(nextValue: number, life: number) {
    valueRef.current = nextValue
    setValue(nextValue)
    if (reducedRef.current || !liveRef.current || life === 0) {
      clearGhost()
      return
    }
    const span = whiskSpan(nextValue, intensityRef.current)
    const next = { ...span, life }
    ghostRef.current = next
    setGhost(next)
    if (life > 0) kick()
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const next = scrubRatio(event.clientX, rect.left, rect.width)
    if (reducedRef.current || !liveRef.current) {
      draggingRef.current = false
      setDragging(false)
      showGhost(next, 0)
      return
    }
    draggingRef.current = true
    setDragging(true)
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    showGhost(next, -1)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    showGhost(scrubRatio(event.clientX, rect.left, rect.width), -1)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    if (typeof event.currentTarget.releasePointerCapture === "function" && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    const frames = reducedRef.current || !liveRef.current ? 0 : lingerFrames(lingerRef.current, paceRef.current)
    if (frames <= 0) {
      clearGhost()
      return
    }
    const span = whiskSpan(valueRef.current, intensityRef.current)
    const next = { ...span, life: frames }
    ghostRef.current = next
    setGhost(next)
    kick()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = valueRef.current
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next += 0.05
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next -= 0.05
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = 1
    else return
    event.preventDefault()
    next = Math.round(clamp(next, 0, 1) * 1000) / 1000
    const frames = reducedRef.current || !liveRef.current ? 0 : Math.max(3, lingerFrames(lingerRef.current, paceRef.current))
    showGhost(next, frames)
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = rateOf(pace)
    intensityRef.current = gain
    lingerRef.current = linger
    if (live && !reduced) return
    if (frameRef.current !== 0) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    draggingRef.current = false
    ghostRef.current = null
  }, [live, reduced, pace, gain, linger])

  useEffect(() => {
    onValueChange?.({ value, ghost: ghost !== null })
  }, [value, ghost, onValueChange])

  useEffect(() => () => stop(), [])

  const pip = style === "pip"

  return (
    <div
      ref={rootRef}
      data-slot="scrub-ghost-whisk"
      data-ritual="scrub-ghost"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-value={value.toFixed(3)}
      data-ghost={ghost ? "on" : "off"}
      data-dragging={dragging ? "on" : "off"}
      data-probes={probes}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">Timeline</p>
      <p className="mt-1 text-xs text-muted-foreground">{markLabel(value)}</p>
      <div
        role="slider"
        aria-label="Timeline"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn("relative mt-4 h-12 touch-pan-y rounded-full border border-border bg-background", ring)}
      >
        <div className="pointer-events-none absolute top-1/2 right-3 left-3 h-1 -translate-y-1/2 rounded-full bg-muted" />
        {ghost ? (
          <motion.div
            data-ghost-layer=""
            data-from={ghost.from}
            data-to={ghost.to}
            aria-hidden="true"
            style={{
              left: pip ? `${ghost.to * 100}%` : `${ghost.from * 100}%`,
              width: pip ? 10 + gain * 8 : `${Math.max(0, ghost.to - ghost.from) * 100}%`,
              height: pip ? 10 + gain * 8 : undefined,
              opacity: whiskAlpha(gain),
              pointerEvents: "none",
            }}
            className={cn(
              "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 motion-reduce:transition-none",
              pip ? "-translate-x-1/2 rounded-full bg-primary" : "h-1 rounded-full bg-primary",
            )}
          />
        ) : null}
        <div
          data-thumb=""
          aria-hidden="true"
          style={{ left: `${value * 100}%` }}
          className="pointer-events-none absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background"
        />
      </div>
      <button
        type="button"
        onClick={() => setProbes((count) => count + 1)}
        className={cn("mt-4 rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
      >
        Probe
      </button>
    </div>
  )
}
