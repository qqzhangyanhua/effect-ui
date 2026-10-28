"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface RidgeProfileScrubProps {
  pace?: number
  intensity?: number
  marks?: boolean
  tint?: boolean
  className?: string
  onValueChange?: (distance: number) => void
}

const HEIGHTS = [86, 140, 210, 268, 340, 312, 390, 448, 402, 470, 436, 360, 300, 240, 188, 132] as const
const START = 0.32
const VIEW_W = 320
const VIEW_H = 150

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

export function ridgeElevation(distance: number) {
  const u = clamp(distance, 0, 1) * (HEIGHTS.length - 1)
  const index = Math.min(HEIGHTS.length - 2, Math.floor(u))
  const portion = u - index
  const left = HEIGHTS[index] ?? HEIGHTS[0]
  const right = HEIGHTS[index + 1] ?? left
  return Math.round(left + (right - left) * portion)
}

function yOf(height: number) {
  return 16 + (1 - (height - 40) / 500) * 112
}

function xOf(index: number) {
  return 12 + (index / (HEIGHTS.length - 1)) * (VIEW_W - 24)
}

function profilePoints() {
  return HEIGHTS.map((height, index) => ({ x: xOf(index), y: yOf(height), height }))
}

function slopeMix(delta: number) {
  const steep = Math.round(Math.min(1, Math.abs(delta) / 90) * 100)
  return `color-mix(in oklab, var(--chart-5) ${steep}%, var(--chart-2))`
}

export function RidgeProfileScrub({
  pace = 1,
  intensity = 0.65,
  marks = true,
  tint = true,
  className,
  onValueChange,
}: RidgeProfileScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const dragRef = useRef(false)
  const distanceRef = useRef(START)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const [distance, setDistance] = useState(START)
  const [phase, setPhase] = useState<"idle" | "scrubbing" | "settle">("idle")
  const elevation = ridgeElevation(distance)
  const ease = reduced ? 0 : Math.round(180 / rate)
  const points = profilePoints()
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ")
  const area = `${line} L ${points[points.length - 1]?.x ?? 0} ${VIEW_H - 12} L ${points[0]?.x ?? 0} ${VIEW_H - 12} Z`
  const cursorX = 12 + distance * (VIEW_W - 24)
  const stroke = 1.5 + gain * 2.5

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function commit(next: number, nextPhase: "idle" | "scrubbing" | "settle") {
    const value = quantize(next)
    distanceRef.current = value
    setDistance(value)
    setPhase(reduced ? "idle" : nextPhase)
    onValueRef.current?.(value)
  }

  function readD(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : VIEW_W
    return quantize((event.clientX - rect.left) / width)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    commit(readD(event), "scrubbing")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(readD(event), "scrubbing")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    commit(readD(event), "idle")
  }

  function stepBy(direction: number) {
    commit(distanceRef.current + direction * 0.02, "idle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      stepBy(1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      stepBy(-1)
    } else if (event.key === "Home") {
      event.preventDefault()
      commit(0, "idle")
    } else if (event.key === "End") {
      event.preventDefault()
      commit(1, "idle")
    }
  }

  return (
    <div
      ref={ref}
      data-slot="ridge-profile-scrub"
      data-ritual="ridge-profile"
      data-pace={rate}
      data-intensity={gain}
      data-marks={marks ? "on" : "off"}
      data-tint={tint ? "on" : "off"}
      data-d={distance.toFixed(2)}
      data-elevation={elevation}
      data-state={phase}
      data-ease={ease}
      data-stroke={stroke.toFixed(1)}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <svg data-part="route" viewBox="0 0 120 36" className="mb-2 h-9 w-full" aria-hidden>
        <polyline
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth={2}
          points={HEIGHTS.map((height, index) => `${(index / (HEIGHTS.length - 1)) * 112 + 4},${30 - ((height - 40) / 500) * 24}`).join(" ")}
        />
        <circle data-marker cx={4 + distance * 112} cy={30 - ((elevation - 40) / 500) * 24} r={3.5} fill="var(--foreground)" />
      </svg>
      <div
        role="slider"
        aria-label="海拔剖面"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(distance * 100)}
        aria-valuetext={`${elevation} m`}
        tabIndex={0}
        data-part="profile"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-40 w-full" aria-hidden>
          <path d={area} fill="var(--chart-2)" opacity={0.12 + gain * 0.28} />
          {tint ? (
            points.slice(0, -1).map((point, index) => {
              const next = points[index + 1]
              if (!next) return null
              return (
                <line
                  key={`${point.x}-${next.x}`}
                  data-segment
                  x1={point.x}
                  y1={point.y}
                  x2={next.x}
                  y2={next.y}
                  stroke={slopeMix(next.height - point.height)}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                />
              )
            })
          ) : (
            <path data-segment d={line} fill="none" stroke="var(--foreground)" strokeWidth={stroke} strokeLinejoin="round" />
          )}
        </svg>
        <motion.div
          data-part="cursor"
          className="pointer-events-none absolute bottom-3 top-2 w-px bg-foreground motion-reduce:transition-none"
          style={{
            left: `${(cursorX / VIEW_W) * 100}%`,
            transition: reduced ? "none" : `left ${ease}ms linear`,
          }}
        />
        <p
          role="status"
          className="pointer-events-none absolute top-2 rounded-full bg-background/90 px-2 py-1 text-xs text-foreground"
          style={{ left: `${distance * 100}%`, transform: distance > 0.75 ? "translateX(-100%)" : undefined }}
        >
          {elevation} m
        </p>
      </div>
      {marks ? (
        <div data-part="marks" className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{HEIGHTS[0]} m</span>
          <span>{HEIGHTS[HEIGHTS.length - 1]} m</span>
        </div>
      ) : null}
      <input
        type="range"
        aria-label="距离"
        min={0}
        max={100}
        value={Math.round(distance * 100)}
        onChange={(event) => commit(Number(event.target.value) / 100, "scrubbing")}
        className="mt-2 w-full touch-none"
      />
    </div>
  )
}
