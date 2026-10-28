"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CurbSpotWalkProps {
  pace?: number
  intensity?: number
  flow?: boolean
  showEta?: boolean
  className?: string
  onValueChange?: (state: { spotIndex: number; minutes: number }) => void
}

export interface CurbSpot {
  id: string
  label: string
  minutes: number
  x: number
  y: number
}

export const CURB_SPOTS: readonly CurbSpot[] = [
  { id: "a", label: "Spot A", minutes: 2, x: 58, y: 150 },
  { id: "b", label: "Spot B", minutes: 5, x: 124, y: 150 },
  { id: "c", label: "Spot C", minutes: 8, x: 210, y: 150 },
  { id: "d", label: "Spot D", minutes: 3, x: 268, y: 150 },
]

export const CURB_ENTRY = { x: 160, y: 78 }

const MAP_W = 320
const MAP_H = 200

type WalkPhase = "idle" | "selecting" | "pathVisible"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

const CURB_FALLBACK: CurbSpot = { id: "a", label: "Spot A", minutes: 2, x: 58, y: 150 }

export function curbSpot(index: number): CurbSpot {
  return CURB_SPOTS[clamp(Math.round(index), 0, CURB_SPOTS.length - 1)] ?? CURB_FALLBACK
}

export function curbWalkPath(index: number) {
  const spot = curbSpot(index)
  const midX = (spot.x + CURB_ENTRY.x) / 2
  const midY = Math.min(spot.y, CURB_ENTRY.y) - 26
  return `M ${spot.x} ${spot.y} Q ${midX} ${midY} ${CURB_ENTRY.x} ${CURB_ENTRY.y}`
}

export function CurbSpotWalk({
  pace = 1,
  intensity = 0.7,
  flow = true,
  showEta = true,
  className,
  onValueChange,
}: CurbSpotWalkProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<WalkPhase>("idle")
  const [offset, setOffset] = useState(0)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(240 / rate)
  const spot = curbSpot(index)
  const path = curbWalkPath(index)
  const flowing = flow && live && !reduced

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (reduced || phase !== "selecting") return
    const frame = window.requestAnimationFrame(() => setPhase("pathVisible"))
    return () => window.cancelAnimationFrame(frame)
  }, [phase, reduced])

  useEffect(() => {
    if (!flowing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setOffset((value) => (value + dt * 36 * rate) % 48)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [flowing, rate])

  function choose(next: number) {
    const safe = clamp(Math.round(next), 0, CURB_SPOTS.length - 1)
    const item = CURB_SPOTS[safe]
    if (!item) return
    setIndex(safe)
    setPhase(reduced ? "pathVisible" : "selecting")
    onValueRef.current?.({ spotIndex: safe, minutes: item.minutes })
  }

  function confirm() {
    setPhase("pathVisible")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") choose(index + 1)
    else if (event.key === "ArrowLeft") choose(index - 1)
    else if (event.key === "Enter") confirm()
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="curb-spot-walk"
      data-ritual="curb-walk"
      data-pace={rate}
      data-intensity={gain}
      data-flow={flow ? "on" : "off"}
      data-flowing={flowing ? "on" : "off"}
      data-eta={showEta ? "on" : "off"}
      data-index={index}
      data-spot={spot.id}
      data-minutes={spot.minutes}
      data-state={phase}
      data-dash={offset.toFixed(1)}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Curb</p>
        {showEta ? (
          <p data-part="badge" className="rounded-full bg-primary px-2 py-1 text-[10px] font-semibold tracking-wide text-primary-foreground">
            {spot.minutes} MIN WALK
          </p>
        ) : null}
      </div>
      <div
        role="radiogroup"
        aria-label="Curb spots"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="relative aspect-[320/200] overflow-hidden rounded-2xl bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden>
          <rect x="36" y="28" width="84" height="70" rx="6" fill="var(--background)" />
          <rect x="196" y="24" width="88" height="74" rx="6" fill="var(--background)" />
          <path d="M 16 150 H 304" fill="none" stroke="var(--muted-foreground)" strokeWidth="10" strokeLinecap="round" opacity="0.45" />
          <motion.path
            data-part="walk"
            d={path}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2 + gain * 2}
            strokeDasharray="7 7"
            strokeDashoffset={flowing ? -offset : 0}
            strokeLinecap="round"
            style={{ transition: reduced ? "none" : `d ${ms}ms ease` }}
          />
          <circle cx={CURB_ENTRY.x} cy={CURB_ENTRY.y} r="7" fill="var(--foreground)" />
          <text x={CURB_ENTRY.x} y={CURB_ENTRY.y - 14} textAnchor="middle" fill="var(--foreground)" fontSize="11">
            Entry
          </text>
        </svg>
        {CURB_SPOTS.map((item, itemIndex) => {
          const on = itemIndex === index
          return (
            <div
              key={item.id}
              role="radio"
              aria-checked={on}
              tabIndex={-1}
              data-spot={item.id}
              aria-label={`${item.label}, ${item.minutes} min walk`}
              onClick={() => choose(itemIndex)}
              className={cn(
                "absolute z-10 grid -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border outline-none motion-reduce:transition-none",
                on ? "size-11 border-primary bg-primary text-primary-foreground" : "size-8 border-border bg-background text-foreground",
              )}
              style={{
                left: `${(item.x / MAP_W) * 100}%`,
                top: `${(item.y / MAP_H) * 100}%`,
                boxShadow: on
                  ? `0 0 ${6 + gain * 14}px color-mix(in srgb, var(--primary) ${Math.round(30 + gain * 50)}%, transparent)`
                  : undefined,
                transition: reduced ? "none" : `width ${ms}ms ease, height ${ms}ms ease, box-shadow ${ms}ms ease`,
              }}
            >
              <span className="text-[10px] font-semibold">{item.label.slice(-1)}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex justify-center gap-2">
        {CURB_SPOTS.map((item, itemIndex) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Choose ${item.label}`}
            data-pager={itemIndex}
            onClick={() => choose(itemIndex)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return
              event.preventDefault()
              choose(itemIndex)
            }}
            className={cn(
              "size-2.5 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
              itemIndex === index ? "bg-primary" : "bg-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <p role="status" className="sr-only">
        {showEta ? `${spot.label}, ${spot.minutes} MIN WALK` : spot.label}
      </p>
    </div>
  )
}
