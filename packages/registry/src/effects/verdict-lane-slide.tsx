"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Whop, Juicebox, Deel, and Mercury (via Mobbin), original implementation.
 * https://mobbin.com/screens/88f31e08-8b43-4cf7-b26f-6d73d6a73dc1
 * https://mobbin.com/screens/5206df5b-d804-4ca2-9bfe-3786b617b5c2
 * https://mobbin.com/screens/66328d19-07aa-4a67-bacd-4cfea6e32885
 * https://mobbin.com/screens/cbeea523-ac61-492f-b65f-2d715ab9be54
 */
export interface VerdictLaneSlideProps {
  pace?: number
  intensity?: number
  threshold?: number
  showLabels?: boolean
  className?: string
  onValueChange?: (state: { verdict: Verdict; hold: number }) => void
}

export type Verdict = "pending" | "approve" | "reject"

const LANE = 280

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function quantize(value: number) {
  return Math.round(clamp(value, -1, 1) * 100) / 100
}

export function verdictThreshold(value: number) {
  if (!Number.isFinite(value)) return 0.65
  return clamp(value, 0.55, 0.75)
}

export function verdictFromHold(hold: number, threshold: number): Verdict {
  const limit = verdictThreshold(threshold)
  if (hold <= -limit) return "approve"
  if (hold >= limit) return "reject"
  return "pending"
}

export function leanHold(direction: -1 | 1, threshold: number) {
  return quantize(direction * (verdictThreshold(threshold) - 0.04))
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

const COPY: Record<Verdict, string> = {
  pending: "Pending",
  approve: "Approved",
  reject: "Declined",
}

export function VerdictLaneSlide({
  pace = 1,
  intensity = 0.4,
  threshold = 0.65,
  showLabels = true,
  className,
  onValueChange,
}: VerdictLaneSlideProps) {
  const ref = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const limit = verdictThreshold(threshold)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [verdict, setVerdict] = useState<Verdict>("pending")
  const [hold, setHold] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ x: number; pointerId: number; moved: boolean } | null>(null)
  const onValueRef = useRef(onValueChange)
  const fill = Math.round(46 + gain * 24)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function emit(next: Verdict, nextHold: number) {
    onValueRef.current?.({ verdict: next, hold: nextHold })
  }

  function commit(next: Verdict) {
    const nextHold = next === "approve" ? -1 : next === "reject" ? 1 : 0
    setVerdict(next)
    setHold(nextHold)
    emit(next, nextHold)
  }

  function holdFrom(clientX: number) {
    const rect = laneRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 1 ? rect.width : LANE
    const left = rect && rect.width > 1 ? rect.left : 0
    return quantize(((clientX - left) / width) * 2 - 1)
  }

  function samePointer(event: PointerEvent<HTMLElement>, pointerId: number) {
    return event.pointerId === pointerId || Number.isNaN(event.pointerId)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = { x: event.clientX, pointerId: event.pointerId, moved: false }
    setDragging(true)
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || !samePointer(event, drag.pointerId)) return
    if (Math.abs(event.clientX - drag.x) > 3) drag.moved = true
    if (!drag.moved) return
    setHold(holdFrom(event.clientX))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || !samePointer(event, drag.pointerId)) return
    const nextHold = holdFrom(event.clientX)
    dragRef.current = null
    setDragging(false)
    if (!drag.moved) return
    const next = verdictFromHold(nextHold, limit)
    commit(next)
  }

  function confirm() {
    if (hold <= -0.2) commit("approve")
    else if (hold >= 0.2) commit("reject")
    else commit("pending")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target
    const onSegment = target instanceof Element && Boolean(target.closest("[data-segment]"))
    if (event.key === "ArrowLeft") {
      const nextHold = leanHold(-1, limit)
      setVerdict("pending")
      setHold(nextHold)
      emit("pending", nextHold)
    } else if (event.key === "ArrowRight") {
      const nextHold = leanHold(1, limit)
      setVerdict("pending")
      setHold(nextHold)
      emit("pending", nextHold)
    } else if (event.key === "Home" || event.key === "Backspace") commit("pending")
    else if (event.key === "Enter" || event.key === " ") {
      if (onSegment) return
      confirm()
    } else return
    event.preventDefault()
  }

  const approveWidth = Math.max(0, -hold) * 50
  const rejectWidth = Math.max(0, hold) * 50
  const handleLeft = ((hold + 1) / 2) * 100
  const motion = reduced || dragging || !live ? "none" : `left ${ms}ms linear, width ${ms}ms linear`

  return (
    <div
      ref={ref}
      data-slot="verdict-lane-slide"
      data-ritual="verdict-lane"
      data-pace={paceRate}
      data-intensity={gain}
      data-threshold={limit}
      data-verdict={verdict}
      data-hold={hold.toFixed(2)}
      data-labels={showLabels ? "on" : "off"}
      data-phase={dragging ? "dragging" : "idle"}
      data-playing="off"
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="group"
      aria-label="Review verdict"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Verdict</p>
        <p data-status className="text-sm text-foreground">
          {COPY[verdict]}
        </p>
      </div>
      <div ref={laneRef} data-track="" className="relative h-24">
        <div className="pointer-events-none absolute inset-x-0 bottom-4 h-2 rounded-full bg-muted" />
        <div
          data-fill="approve"
          className="pointer-events-none absolute bottom-4 left-0 h-2 rounded-full motion-reduce:transition-none"
          style={{
            width: `${approveWidth}%`,
            background: `color-mix(in oklch, oklch(0.62 0.07 150) ${fill}%, var(--muted))`,
            transition: motion,
          }}
        />
        <div
          data-fill="reject"
          className="pointer-events-none absolute right-0 bottom-4 h-2 rounded-full motion-reduce:transition-none"
          style={{
            width: `${rejectWidth}%`,
            background: `color-mix(in oklch, var(--destructive) ${fill}%, var(--muted))`,
            transition: motion,
          }}
        />
        <div className="absolute inset-0 grid grid-cols-3">
          {(["approve", "pending", "reject"] as const).map((zone) => {
            const label = zone === "approve" ? "Agree" : zone === "pending" ? "Hold" : "Decline"
            return (
              <button
                key={zone}
                type="button"
                data-segment={zone}
                aria-label={label}
                onClick={() => commit(zone)}
                className="flex items-start justify-center pt-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showLabels ? label : <span className="sr-only">{label}</span>}
              </button>
            )
          })}
        </div>
        <div
          role="slider"
          tabIndex={0}
          data-handle=""
          aria-label="Verdict handle"
          aria-valuemin={-1}
          aria-valuemax={1}
          aria-valuenow={hold}
          aria-valuetext={COPY[verdict]}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute bottom-1 z-10 size-11 -translate-x-1/2 touch-none rounded-full border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          style={{ left: `clamp(1.375rem, ${handleLeft}%, calc(100% - 1.375rem))`, transition: motion }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Drag the handle past the mark, or pick a side. This note stays outside the track.
      </p>
    </div>
  )
}
