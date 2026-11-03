"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Evernote, Apple Notes, Freeform, ChatGPT, and Mixpanel (via Mobbin), original implementation.
 * https://mobbin.com/screens/a88c094f-caa5-44a3-b5a5-164b3a5091bd
 * https://mobbin.com/screens/357a35bd-3b1d-40a6-b9cc-3e138dac6955
 * https://mobbin.com/screens/0502e28c-c215-4677-8b28-e700624589e8
 * https://mobbin.com/screens/fff43526-eb2b-47a4-bc78-b1d5df434fcf
 * https://mobbin.com/screens/65625dbf-4bb2-4c68-b8e2-f895db497249
 */

export interface NibCrumbFadeProps {
  pace?: number
  intensity?: number
  density?: number
  style?: CrumbStyle
  className?: string
  onValueChange?: (state: { crumbs: number; enabled: boolean }) => void
}

export type CrumbStyle = "dot" | "nib"

export interface Crumb {
  id: number
  x: number
  y: number
  age: number
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

export function crumbCap(density: number) {
  return clamp(Math.round(density), 1, 8)
}

export function crumbStep(pace: number) {
  return Math.round(clamp(0.09 * rateOf(pace), 0.03, 0.24) * 1000) / 1000
}

export function crumbGap(density: number) {
  return Math.round(42 - crumbCap(density) * 2)
}

export function crumbSpan(intensity: number, style: CrumbStyle) {
  const gain = clamp(intensity, 0, 1)
  if (style === "nib") return { w: Math.round(11 + gain * 8), h: Math.round(3 + gain * 2) }
  const size = Math.round(5 + gain * 5)
  return { w: size, h: size }
}

export function crumbAlpha(age: number, intensity: number) {
  const life = 1 - clamp(age, 0, 1)
  return Math.round(life * (0.16 + clamp(intensity, 0, 1) * 0.4) * 1000) / 1000
}

export function placeCrumb(crumbs: readonly Crumb[], point: { x: number; y: number }, density: number, id: number) {
  const cap = crumbCap(density)
  const gap = crumbGap(cap)
  const last = crumbs[crumbs.length - 1]
  if (last) {
    const dx = point.x - last.x
    const dy = point.y - last.y
    if (dx * dx + dy * dy < gap * gap) return crumbs
  }
  const next = [...crumbs, { id, x: Math.round(point.x * 10) / 10, y: Math.round(point.y * 10) / 10, age: 0 }]
  return next.length > cap ? next.slice(next.length - cap) : next
}

export function ageCrumbs(crumbs: readonly Crumb[], step: number) {
  return crumbs
    .map((crumb) => ({ ...crumb, age: Math.round((crumb.age + step) * 1000) / 1000 }))
    .filter((crumb) => crumb.age < 1)
}

export function NibCrumbFade({
  pace = 1,
  intensity = 0.28,
  density = 5,
  style = "dot",
  className,
  onValueChange,
}: NibCrumbFadeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const crumbsRef = useRef<readonly Crumb[]>([])
  const frameRef = useRef(0)
  const idRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const enabledRef = useRef(true)
  const paceRef = useRef(1)
  const densityRef = useRef(5)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const cap = crumbCap(density)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const span = crumbSpan(gain, style)
  const [crumbs, setCrumbs] = useState<readonly Crumb[]>([])
  const [enabled, setEnabled] = useState(true)
  const [marks, setMarks] = useState(0)
  const [saves, setSaves] = useState(0)
  const [clears, setClears] = useState(0)
  const frozen = !live || reduced || !enabled
  if (frozen && crumbs.length > 0) setCrumbs([])

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current || !enabledRef.current) {
        crumbsRef.current = []
        setCrumbs([])
        frameRef.current = 0
        return
      }
      const next = ageCrumbs(crumbsRef.current, crumbStep(paceRef.current))
      crumbsRef.current = next
      setCrumbs(next)
      if (next.length === 0) {
        frameRef.current = 0
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function clearCrumbs() {
    stop()
    crumbsRef.current = []
    setCrumbs([])
    setClears((count) => count + 1)
  }

  function onMove(event: PointerEvent<HTMLDivElement>) {
    if (!enabledRef.current || reducedRef.current || !liveRef.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const next = placeCrumb(
      crumbsRef.current,
      { x: event.clientX - rect.left, y: event.clientY - rect.top },
      densityRef.current,
      idRef.current + 1,
    )
    if (next === crumbsRef.current) return
    idRef.current += 1
    crumbsRef.current = next
    setCrumbs(next)
    kick()
  }

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.target !== event.currentTarget) return
    event.preventDefault()
    clearCrumbs()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    enabledRef.current = enabled
    paceRef.current = paceRate
    densityRef.current = cap
    if (live && !reduced && enabled) return
    if (frameRef.current !== 0) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    crumbsRef.current = []
  }, [live, reduced, enabled, paceRate, cap])

  useEffect(() => {
    onValueChange?.({ crumbs: crumbs.length, enabled })
  }, [crumbs.length, enabled, onValueChange])

  useEffect(() => () => stop(), [])

  return (
    <div
      ref={rootRef}
      data-slot="nib-crumb-fade"
      data-ritual="nib-crumb"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-enabled={enabled ? "on" : "off"}
      data-crumbs={crumbs.length}
      data-marks={marks}
      data-saves={saves}
      data-clears={clears}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="region"
        aria-label="Ink canvas"
        tabIndex={0}
        onPointerMove={onMove}
        onKeyDown={onKey}
        className={cn("relative min-h-44 rounded-2xl border border-border bg-background", ring)}
      >
        <div className="relative z-10 flex flex-wrap gap-2 p-4">
          <button
            type="button"
            onClick={() => setMarks((count) => count + 1)}
            className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
          >
            Mark note
          </button>
          <button
            type="button"
            onClick={() => setSaves((count) => count + 1)}
            className={cn("rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
          >
            Save note
          </button>
        </div>
        <div data-crumb-layer="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          {crumbs.map((crumb) => (
            <motion.span
              key={crumb.id}
              data-crumb=""
              style={{
                left: crumb.x,
                top: crumb.y,
                width: span.w,
                height: span.h,
                opacity: crumbAlpha(crumb.age, gain),
                pointerEvents: "none",
                transform: style === "nib" ? "translate(-50%, -50%) rotate(-18deg)" : "translate(-50%, -50%)",
              }}
              className="pointer-events-none absolute rounded-full bg-foreground motion-reduce:transition-none"
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        aria-label="Toggle crumbs"
        onClick={() => setEnabled((value) => !value)}
        className={cn("mt-3 rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
      >
        {enabled ? "Crumbs on" : "Crumbs off"}
      </button>
    </div>
  )
}
