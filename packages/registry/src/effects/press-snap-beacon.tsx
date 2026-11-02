"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Buffer, Revolut, Amplitude, Cosmos, and Better Stack (via Mobbin), original implementation.
 * https://mobbin.com/screens/58994801-481b-4b08-9d3b-d7aedd27bb99
 * https://mobbin.com/screens/6fa361cc-4ea6-4323-8a7c-f0885ab324d1
 * https://mobbin.com/screens/75fb4ce8-674d-41a2-9877-12c21d704c37
 * https://mobbin.com/screens/fc750b0c-7575-47e2-a438-fd352fbc6ee7
 * https://mobbin.com/screens/1ec0d237-177e-40b6-b709-5343ced7691c
 */

export interface PressSnapBeaconProps {
  pace?: number
  intensity?: number
  style?: BeaconStyle
  count?: number
  className?: string
  onValueChange?: (state: { picked: string; beacon: boolean }) => void
}

export type BeaconStyle = "ring" | "pip"
export type BeaconId = "alpha" | "beta" | "gamma" | "delta"

export interface Beacon {
  x: number
  y: number
  progress: number
}

const BUTTONS: readonly { id: BeaconId; label: string }[] = [
  { id: "alpha", label: "Alpha" },
  { id: "beta", label: "Beta" },
  { id: "gamma", label: "Gamma" },
  { id: "delta", label: "Delta" },
]

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function beaconRings(count: number) {
  return clamp(Math.round(count), 1, 3)
}

export function beaconStep(pace: number) {
  return Math.round(clamp(0.14 * rateOf(pace), 0.06, 0.32) * 1000) / 1000
}

export function beaconRadius(intensity: number, index: number) {
  return Math.round(16 + clamp(intensity, 0, 1) * 18 + index * 7)
}

export function beaconAlpha(progress: number, intensity: number) {
  return Math.round((1 - clamp(progress, 0, 1)) * (0.18 + clamp(intensity, 0, 1) * 0.4) * 1000) / 1000
}

export function PressSnapBeacon({
  pace = 1,
  intensity = 0.32,
  style = "ring",
  count = 1,
  className,
  onValueChange,
}: PressSnapBeaconProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const beaconRef = useRef<Beacon | null>(null)
  const frameRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const rings = beaconRings(count)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const [picked, setPicked] = useState<BeaconId | "none">("none")
  const [beacon, setBeacon] = useState<Beacon | null>(null)
  if ((!live || reduced) && beacon) setBeacon(null)

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function clearBeacon() {
    stop()
    beaconRef.current = null
    setBeacon(null)
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      const current = beaconRef.current
      if (!current || !liveRef.current || reducedRef.current) {
        beaconRef.current = null
        setBeacon(null)
        frameRef.current = 0
        return
      }
      const progress = Math.round((current.progress + beaconStep(paceRef.current)) * 1000) / 1000
      if (progress >= 1) {
        beaconRef.current = null
        setBeacon(null)
        frameRef.current = 0
        return
      }
      const next = { ...current, progress }
      beaconRef.current = next
      setBeacon(next)
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function press(id: BeaconId, point: { x: number; y: number }) {
    setPicked(id)
    if (reducedRef.current || !liveRef.current) {
      clearBeacon()
      return
    }
    const next = { x: point.x, y: point.y, progress: 0 }
    beaconRef.current = next
    setBeacon(next)
    kick()
  }

  function pointOf(node: HTMLButtonElement, event: PointerEvent<HTMLButtonElement> | null) {
    const root = rootRef.current
    const rootRect = root?.getBoundingClientRect()
    const rect = node.getBoundingClientRect()
    const originX = rootRect?.left ?? 0
    const originY = rootRect?.top ?? 0
    if (!event) {
      return {
        x: rect.left - originX + (rect.width || Number(node.dataset.nx ?? 48)) / 2,
        y: rect.top - originY + (rect.height || Number(node.dataset.ny ?? 32)) / 2,
      }
    }
    return { x: event.clientX - originX, y: event.clientY - originY }
  }

  function onPointerDown(id: BeaconId, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    press(id, pointOf(event.currentTarget, event))
  }

  function onKeyDown(id: BeaconId, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    press(id, pointOf(event.currentTarget, null))
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = paceRate
    if (live && !reduced) return
    if (frameRef.current !== 0) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    beaconRef.current = null
  }, [live, reduced, paceRate])

  useEffect(() => {
    onValueChange?.({ picked, beacon: beacon !== null })
  }, [picked, beacon, onValueChange])

  useEffect(() => () => stop(), [])

  return (
    <div
      ref={rootRef}
      data-slot="press-snap-beacon"
      data-ritual="press-snap"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-picked={picked}
      data-beacon={beacon ? "on" : "off"}
      data-rings={rings}
      data-progress={beacon ? beacon.progress.toFixed(3) : "0.000"}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {BUTTONS.map((item, index) => {
          const selected = picked === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              data-nx={48 + index * 24}
              data-ny={36}
              onPointerDown={(event) => onPointerDown(item.id, event)}
              onKeyDown={(event) => onKeyDown(item.id, event)}
              className={cn(
                "rounded-2xl border px-4 py-6 text-sm font-medium",
                selected ? "border-primary bg-muted text-foreground" : "border-border bg-background text-foreground",
                ring,
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div data-beacon-layer="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
        {beacon
          ? Array.from({ length: rings }, (_, index) => {
              const grow = 0.55 + Math.min(1, beacon.progress + index * 0.08) * 0.45
              const size = beaconRadius(gain, index) * (style === "pip" ? grow * 0.55 : grow)
              return (
                <motion.span
                  key={index}
                  data-beacon-ring=""
                  style={{
                    left: beacon.x,
                    top: beacon.y,
                    width: size,
                    height: size,
                    opacity: beaconAlpha(Math.min(1, beacon.progress + index * 0.08), gain),
                    pointerEvents: "none",
                  }}
                  className={cn(
                    "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:transition-none",
                    style === "pip" ? "bg-primary" : "border border-primary bg-transparent",
                  )}
                />
              )
            })
          : null}
      </div>
    </div>
  )
}
