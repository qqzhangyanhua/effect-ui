"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface DragTokenGateProps {
  pace?: number
  intensity?: number
  hint?: boolean
  threshold?: number
  className?: string
  onLockChange?: (locked: boolean) => void
}

const HOME = { x: 28, y: 58 }
const TARGET = { x: 188, y: 58 }
const STEP = 24
const SIZE = 44

type Phase = "idle" | "dragging" | "miss" | "success"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function limitOf(threshold: number) {
  return clamp(threshold, 0.2, 0.8)
}

function distance(x: number, y: number) {
  return Math.hypot(x - TARGET.x, y - TARGET.y)
}

export function DragTokenGate({
  pace = 1,
  intensity = 0.65,
  hint = true,
  threshold = 0.45,
  className,
  onLockChange,
}: DragTokenGateProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const drag = useRef(false)
  const origin = useRef({ x: 0, y: 0, px: 0, py: 0 })
  const xRef = useRef(HOME.x)
  const yRef = useRef(HOME.y)
  const lockedRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const radiusRef = useRef(48)
  const rateRef = useRef(1)
  const onLockRef = useRef(onLockChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const limit = limitOf(threshold)
  const radius = 28 + limit * 70 + gain * 12
  const [x, setX] = useState(HOME.x)
  const [y, setY] = useState(HOME.y)
  const [phase, setPhase] = useState<Phase>("idle")
  const [locked, setLocked] = useState(false)
  const [hit, setHit] = useState(false)
  const scale = locked ? 1 + gain * 0.28 : 1

  useEffect(() => {
    onLockRef.current = onLockChange
    reducedRef.current = reduced
    liveRef.current = live
    radiusRef.current = radius
    rateRef.current = rate
    xRef.current = x
    yRef.current = y
    lockedRef.current = locked
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    drag.current = false
  }, [live, locked, onLockChange, radius, rate, reduced, x, y])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function place(nextX: number, nextY: number, nextPhase: Phase) {
    const px = clamp(nextX, 8, 240)
    const py = clamp(nextY, 16, 120)
    xRef.current = px
    yRef.current = py
    setX(px)
    setY(py)
    setPhase(nextPhase)
    setHit(distance(px, py) <= radiusRef.current)
  }

  function lock(next: boolean) {
    if (lockedRef.current === next) return
    lockedRef.current = next
    setLocked(next)
    onLockRef.current?.(next)
  }

  function glide(toX: number, toY: number, kind: "success" | "miss") {
    stopFrame()
    const destPhase: Phase = kind === "success" ? "success" : "idle"
    if (reducedRef.current || !liveRef.current) {
      place(toX, toY, destPhase)
      lock(kind === "success")
      return
    }
    if (kind === "success") lock(true)
    const fromX = xRef.current
    const fromY = yRef.current
    setPhase(kind)
    const steps = Math.max(4, Math.round(8 / rateRef.current))
    let step = 0
    const tick = () => {
      if (!liveRef.current) {
        place(toX, toY, destPhase)
        frame.current = 0
        return
      }
      step += 1
      const progress = Math.min(1, step / steps)
      const eased = 1 - (1 - progress) ** 2
      place(fromX + (toX - fromX) * eased, fromY + (toY - fromY) * eased, progress >= 1 ? destPhase : kind)
      if (progress >= 1) {
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function commitDrop() {
    if (lockedRef.current) return
    drag.current = false
    if (distance(xRef.current, yRef.current) <= radiusRef.current) glide(TARGET.x, TARGET.y, "success")
    else glide(HOME.x, HOME.y, "miss")
  }

  function nudge(dx: number, dy: number) {
    if (lockedRef.current) return
    stopFrame()
    place(xRef.current + dx, yRef.current + dy, "idle")
  }

  function placeToken() {
    if (lockedRef.current) return
    glide(TARGET.x, TARGET.y, "success")
  }

  function replay() {
    stopFrame()
    lock(false)
    place(HOME.x, HOME.y, "idle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      nudge(STEP, 0)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      nudge(-STEP, 0)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(0, -STEP)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(0, STEP)
    } else if (event.key === "Enter") {
      event.preventDefault()
      commitDrop()
    }
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (lockedRef.current) return
    if (event.button !== undefined && event.button !== 0) return
    drag.current = true
    origin.current = { x: xRef.current, y: yRef.current, px: event.clientX, py: event.clientY }
    stopFrame()
    setPhase("dragging")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current || lockedRef.current) return
    place(origin.current.x + event.clientX - origin.current.px, origin.current.y + event.clientY - origin.current.py, "dragging")
  }

  function onPointerUp() {
    if (!drag.current) return
    commitDrop()
  }

  return (
    <div
      ref={ref}
      data-slot="drag-token-gate"
      data-ritual="token-gate"
      data-seeds="off"
      data-escape="off"
      data-pace={rate}
      data-intensity={gain}
      data-hint={hint ? "on" : "off"}
      data-threshold={limit.toFixed(2)}
      data-radius={radius.toFixed(1)}
      data-x={Math.round(x)}
      data-y={Math.round(y)}
      data-home-x={HOME.x}
      data-target-x={TARGET.x}
      data-hit={hit ? "yes" : "no"}
      data-locked={locked ? "yes" : "no"}
      data-state={phase}
      data-tokens="1"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn("w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none", className)}
    >
      <div className="relative h-36 overflow-hidden rounded-2xl bg-muted/50">
        {hint ? (
          <svg data-hint-line className="pointer-events-none absolute inset-0 h-full w-full text-muted-foreground" aria-hidden>
            <line x1={HOME.x} y1={HOME.y} x2={TARGET.x} y2={TARGET.y} stroke="currentColor" strokeDasharray="5 5" />
          </svg>
        ) : null}
        <div
          data-zone
          className={cn("absolute rounded-full border border-dashed", hit ? "border-primary bg-primary/15" : "border-foreground/30")}
          style={{
            width: radius * 2,
            height: radius * 2,
            left: TARGET.x - radius,
            top: TARGET.y - radius,
          }}
        />
        <button
          type="button"
          aria-label="令牌"
          data-token
          disabled={locked}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "absolute grid place-items-center rounded-full bg-primary text-primary-foreground outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring",
            locked && "pointer-events-none",
          )}
          style={{
            width: SIZE,
            height: SIZE,
            left: x - SIZE / 2,
            top: y - SIZE / 2,
            transform: `scale(${scale})`,
          }}
        >
          <span className="h-3 w-3 rounded-sm bg-primary-foreground" />
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={placeToken} disabled={locked}>
          Place token
        </button>
        <button type="button" className="rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground disabled:opacity-40" disabled={!locked}>
          Enter
        </button>
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={replay}>
          Replay
        </button>
      </div>
      <p role="status" className="sr-only">
        {locked ? "locked" : "unlocked"}
      </p>
    </div>
  )
}
