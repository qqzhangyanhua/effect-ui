"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HexTrailClaimProps {
  pace?: number
  intensity?: number
  count?: number
  auto?: boolean
  className?: string
  onProgressChange?: (progress: number) => void
}

const TRAIL: readonly { c: number; r: number }[] = [
  { c: 1, r: 0 },
  { c: 2, r: 0 },
  { c: 3, r: 0 },
  { c: 3, r: 1 },
  { c: 2, r: 1 },
  { c: 1, r: 1 },
  { c: 1, r: 2 },
  { c: 2, r: 2 },
  { c: 3, r: 2 },
  { c: 4, r: 2 },
  { c: 4, r: 3 },
  { c: 3, r: 3 },
  { c: 2, r: 3 },
  { c: 1, r: 3 },
  { c: 1, r: 4 },
  { c: 2, r: 4 },
  { c: 3, r: 4 },
  { c: 4, r: 4 },
  { c: 4, r: 5 },
  { c: 3, r: 5 },
  { c: 2, r: 5 },
  { c: 1, r: 5 },
  { c: 0, r: 5 },
  { c: 0, r: 6 },
]

type Phase = "idle" | "claiming" | "complete" | "scrub"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function countOf(count: number) {
  return clamp(Math.round(count), 12, 24)
}

export function claimedCount(progress: number, count: number) {
  return Math.round(clamp(progress, 0, 1) * countOf(count))
}

export function exploredPercent(progress: number, count: number) {
  const total = countOf(count)
  if (total <= 0) return 0
  return Math.round((claimedCount(progress, count) / total) * 100)
}

function hexCenter(cell: { c: number; r: number }) {
  return { x: 26 + cell.c * 30, y: 24 + cell.r * 32 + (cell.c % 2) * 10 }
}

function hexPoints(cx: number, cy: number, radius: number) {
  const parts: string[] = []
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    parts.push(`${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`)
  }
  return parts.join(" ")
}

export function HexTrailClaim({
  pace = 1,
  intensity = 0.7,
  count = 16,
  auto = false,
  className,
  onProgressChange,
}: HexTrailClaimProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const progressRef = useRef(0)
  const dragRef = useRef(false)
  const onProgressRef = useRef(onProgressChange)
  const rateRef = useRef(1)
  const countRef = useRef(16)
  const autoRef = useRef(auto)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const claimed = claimedCount(progress, total)
  const percent = exploredPercent(progress, total)
  const ease = reduced ? 0 : Math.round(220 / rate)
  const cells = TRAIL.slice(0, total)
  const centers = cells.map((cell) => hexCenter(cell))
  const trail = centers.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")
  const head = claimed > 0 ? centers[claimed - 1] : undefined

  function commitClaimed(next: number, mode: "scrub" | "step") {
    const claimedNext = clamp(Math.round(next), 0, countRef.current)
    const value = countRef.current === 0 ? 0 : claimedNext / countRef.current
    progressRef.current = value
    setProgress(value)
    if (claimedNext >= countRef.current) setPhase("complete")
    else if (mode === "scrub") setPhase("scrub")
    else setPhase(claimedNext <= 0 ? "idle" : "claiming")
    onProgressRef.current?.(value)
  }

  useEffect(() => {
    onProgressRef.current = onProgressChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    countRef.current = total
    autoRef.current = auto
  }, [onProgressChange, live, reduced, rate, total, auto])

  useEffect(() => {
    if (!auto || reduced || !live) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !autoRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      last = now > 0 ? now : last
      if (!dragRef.current && progressRef.current < 1) {
        const next = Math.min(1, progressRef.current + dt * 0.28 * rateRef.current)
        progressRef.current = next
        setProgress(next)
        setPhase(next >= 1 ? "complete" : "claiming")
        onProgressRef.current?.(next)
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [auto, reduced, live])

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      commitClaimed(claimedCount(progressRef.current, countRef.current) + 1, "step")
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      commitClaimed(claimedCount(progressRef.current, countRef.current) - 1, "step")
    } else if (event.key === "Home") {
      event.preventDefault()
      commitClaimed(0, "step")
    } else if (event.key === "End") {
      event.preventDefault()
      commitClaimed(countRef.current, "step")
    }
  }

  function onPointerDown(event: PointerEvent<HTMLInputElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setPhase("scrub")
  }

  function onPointerUp() {
    dragRef.current = false
    const value = progressRef.current
    if (value >= 1) setPhase("complete")
    else if (autoRef.current && !reducedRef.current) setPhase(value <= 0 ? "idle" : "claiming")
    else setPhase(value <= 0 ? "idle" : "claiming")
  }

  return (
    <div
      ref={ref}
      data-slot="hex-trail-claim"
      data-ritual="hex-claim"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-auto={auto ? "on" : "off"}
      data-progress={progress.toFixed(2)}
      data-claimed={claimed}
      data-percent={percent}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <svg viewBox="0 0 180 250" className="h-64 w-full" aria-hidden>
        <path d={trail} fill="none" stroke="var(--border)" strokeWidth={3} />
        {centers.map((point, index) => {
          const on = index < claimed
          const isHead = index === claimed - 1
          const opacity = on ? 0.35 + gain * 0.6 : 0.45
          return (
            <polygon
              key={`${point.x}-${point.y}`}
              data-hex={index}
              data-claimed={on ? "yes" : "no"}
              data-head={isHead ? "yes" : "no"}
              points={hexPoints(point.x, point.y, 12)}
              fill={isHead ? "var(--primary)" : on ? "var(--chart-2)" : "var(--muted)"}
              stroke={isHead ? "var(--foreground)" : "var(--border)"}
              strokeWidth={isHead ? 2 : 1}
              opacity={opacity}
              style={{ transition: reduced ? "none" : `fill ${ease}ms linear, opacity ${ease}ms linear` }}
            />
          )
        })}
        {head ? (
          <text data-tip x={head.x} y={head.y - 16} textAnchor="middle" fill="var(--foreground)" fontSize={10}>
            {percent}%
          </text>
        ) : null}
      </svg>
      <div className="mt-2 flex items-center gap-3">
        <motion.p
          role="status"
          data-part="pill"
          className="shrink-0 rounded-full bg-foreground px-3 py-1 text-sm text-background motion-reduce:transition-none"
        >
          {percent}% explored
        </motion.p>
        <input
          type="range"
          aria-label="探路进度"
          aria-valuetext={`${percent}% explored`}
          min={0}
          max={total}
          step={1}
          value={claimed}
          onChange={(event) => commitClaimed(Number(event.target.value), "scrub")}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="min-w-0 flex-1 touch-none"
        />
      </div>
    </div>
  )
}
