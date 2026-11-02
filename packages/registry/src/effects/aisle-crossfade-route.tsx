"use client"

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Canva, Webflow, Wix, and Figma (via Mobbin), original implementation.
 * https://mobbin.com/flows/2b0fafb0-91e4-4baf-9827-880918a261b2
 * https://mobbin.com/flows/d0e67a07-c4a3-4229-9dca-5e5528031ea5
 * https://mobbin.com/flows/6332a6ad-304d-44fe-b05f-b811bd22a9fe
 * https://mobbin.com/flows/c3eedcc1-8ef5-47e4-aded-b399e2fae156
 */

export interface AisleCrossfadeRouteProps {
  pace?: number
  intensity?: number
  style?: AisleStyle
  direction?: AisleDirection
  className?: string
  onValueChange?: (state: { aisle: AisleId; blend: number }) => void
}

export type AisleStyle = "crossfade" | "soft-wipe"
export type AisleDirection = "horizontal" | "vertical"
export type AisleId = "a" | "b"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const PAGES = [
  {
    id: "a" as const,
    title: "North aisle",
    body: "A short page of notes stays readable while the next aisle arrives.",
    action: "Open notes",
  },
  {
    id: "b" as const,
    title: "South aisle",
    body: "The following page is plain, with one button ready for the keyboard.",
    action: "Review notes",
  },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function aisleFrames(pace: number) {
  return clamp(Math.round(10 / rateOf(pace)), 4, 24)
}

export function aisleOpacity(blend: number, side: AisleId, intensity: number) {
  const raw = side === "a" ? 1 - clamp(blend, 0, 1) : clamp(blend, 0, 1)
  const curve = 1 + clamp(intensity, 0, 1) * 0.35
  const value = raw <= 0 ? 0 : raw ** curve
  return Math.round(value * 1000) / 1000
}

export function aisleShift(blend: number, intensity: number, style: AisleStyle, side: AisleId) {
  if (style !== "soft-wipe") return 0
  const travel = Math.round(clamp(intensity, 0, 1) * 14 * 10) / 10
  const delta = side === "a" ? -clamp(blend, 0, 1) : 1 - clamp(blend, 0, 1)
  return Math.round(delta * travel * 10) / 10
}

export function AisleCrossfadeRoute({
  pace = 1,
  intensity = 0.28,
  style: aisleStyle = "crossfade",
  direction = "horizontal",
  className,
  onValueChange,
}: AisleCrossfadeRouteProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const northRef = useRef<HTMLButtonElement>(null)
  const southRef = useRef<HTMLButtonElement>(null)
  const blendRef = useRef(0)
  const targetRef = useRef(0)
  const frameRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const pendingFocus = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const [blend, setBlend] = useState(0)
  const [target, setTarget] = useState(0)
  const aisle: AisleId = target >= 1 ? "b" : "a"
  const moving = Math.abs(blend - target) > 0.001

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function snap(goal: number) {
    stop()
    blendRef.current = goal
    targetRef.current = goal
    setBlend(goal)
    setTarget(goal)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        frameRef.current = 0
        snap(targetRef.current)
        return
      }
      const goal = targetRef.current
      const step = 1 / aisleFrames(paceRef.current)
      const current = blendRef.current
      let next = current < goal ? Math.min(goal, current + step) : Math.max(goal, current - step)
      if (Math.abs(next - goal) <= step * 0.51) next = goal
      next = Math.round(next * 1000) / 1000
      blendRef.current = next
      setBlend(next)
      if (next === goal) {
        frameRef.current = 0
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function go(next: number, replay = false) {
    const goal = next >= 1 ? 1 : 0
    pendingFocus.current = true
    targetRef.current = goal
    setTarget(goal)
    if (!liveRef.current || reducedRef.current) {
      snap(goal)
      return
    }
    const same = Math.abs(blendRef.current - goal) < 0.001
    if (replay || same) {
      const from = goal === 1 ? 0 : 1
      blendRef.current = from
      setBlend(from)
    }
    kick()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    if (live && !reduced) {
      if (Math.abs(blendRef.current - targetRef.current) > 0.001) kick()
      return () => stop()
    }
    stop()
    const goal = targetRef.current
    if (Math.abs(blendRef.current - goal) > 0.001 || reduced) {
      blendRef.current = goal
      setBlend(goal)
    }
    return () => stop()
  }, [live, reduced, paceRate])

  useEffect(() => {
    if (!pendingFocus.current) return
    if (Math.abs(blend - target) > 0.001) return
    pendingFocus.current = false
    const node = target >= 1 ? southRef.current : northRef.current
    node?.focus()
  }, [blend, target])

  useEffect(() => {
    onValueChange?.({ aisle, blend })
  }, [aisle, blend, onValueChange])

  useEffect(() => {
    return () => stop()
  }, [])

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "]" || event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault()
      go(1)
      return
    }
    if (event.key === "[" || event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      go(0)
      return
    }
    if (event.key === "Enter" && event.currentTarget === event.target) {
      event.preventDefault()
      go(targetRef.current, true)
    }
  }

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-label="Route aisle"
      data-slot="aisle-crossfade-route"
      data-ritual="aisle-crossfade"
      data-aisle={aisle}
      data-blend={blend.toFixed(3)}
      data-settled={moving ? "no" : "yes"}
      data-style={aisleStyle}
      data-direction={direction}
      data-playing={moving && live && !reduced ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        ring,
        className,
      )}
    >
      <p className="mb-3 text-sm text-muted-foreground">Brackets or arrow keys switch aisles. Enter replays the pass.</p>
      <p className="sr-only" aria-live="polite">
        {aisle === "b" ? "South aisle" : "North aisle"}
      </p>
      <div className="relative h-52 overflow-hidden rounded-2xl border border-border bg-background">
        {PAGES.map((page) => {
          const active = (page.id === "b" ? 1 : 0) === target
          const opacity = aisleOpacity(blend, page.id, gain)
          const shift = aisleShift(blend, gain, aisleStyle, page.id)
          const transform = direction === "vertical" ? `translateY(${shift}px)` : `translateX(${shift}px)`
          return (
            <div
              key={page.id}
              inert={active ? undefined : true}
              aria-hidden={active ? undefined : true}
              className={cn("absolute inset-0", active ? "z-10" : "pointer-events-none z-0")}
            >
              <motion.article
                data-page={page.id}
                data-opacity={opacity.toFixed(3)}
                data-shift={shift.toFixed(1)}
                style={{ opacity, transform }}
                className="flex h-full flex-col justify-between bg-card p-4 motion-reduce:transition-none"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground">{page.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{page.body}</p>
                </div>
                <button
                  ref={page.id === "a" ? northRef : southRef}
                  type="button"
                  onClick={() => go(page.id === "a" ? 1 : 0)}
                  className={cn(
                    "mt-4 w-fit rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                    ring,
                  )}
                >
                  {page.action}
                </button>
              </motion.article>
            </div>
          )
        })}
      </div>
    </div>
  )
}
