"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SkewAxisWarpProps {
  pace?: number
  intensity?: number
  grid?: boolean
  snap?: boolean
  className?: string
  onValueChange?: (point: { x: number; y: number }) => void
}

type SkewAxis = "x" | "y"
type SkewPhase = "idle" | "dragging" | "settle" | "zero"

interface Box {
  left: number
  width: number
}

const START_X = 12
const START_Y = -8
const AXIS = 240

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function skewText(value: number) {
  const next = Math.round(value)
  if (next > 0) return `+${next}`
  if (next < 0) return `\u2212${Math.abs(next)}`
  return "0"
}

export function skewFromPointer(clientX: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : AXIS
  const left = rect.width > 0 ? rect.left : 0
  return Math.round(clamp((clientX - left) / width, 0, 1) * 80 - 40)
}

export function skewRelease(value: number, snap: boolean) {
  const next = Math.round(clamp(value, -40, 40))
  if (snap && Math.abs(next) <= 3) return 0
  return next
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

function SkewRail({
  label,
  value,
  active,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onKeyDown,
  onFocus,
}: {
  label: string
  value: number
  active: boolean
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onFocus: () => void
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span>{skewText(value)}</span>
      </div>
      <div className="relative mb-1 h-3" aria-hidden>
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            data-part="tick"
            className={cn("absolute top-0 w-px", index === 4 ? "h-3 bg-foreground" : "h-2 bg-border")}
            style={{ left: `${(index / 8) * 100}%` }}
          />
        ))}
      </div>
      <div
        role="slider"
        aria-label={`Skew ${label}`}
        aria-valuemin={-40}
        aria-valuemax={40}
        aria-valuenow={value}
        aria-valuetext={`${label} ${skewText(value)}`}
        tabIndex={0}
        data-axis={label.toLowerCase()}
        onFocus={onFocus}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          "relative h-8 touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring",
          active && "ring-1 ring-ring",
        )}
      >
        <span
          data-part="thumb"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background"
          style={{ left: `${((value + 40) / 80) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function SkewAxisWarp({
  pace = 1,
  intensity = 0.7,
  grid = true,
  snap = true,
  className,
  onValueChange,
}: SkewAxisWarpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef<SkewAxis | null>(null)
  const xRef = useRef(START_X)
  const yRef = useRef(START_Y)
  const onValueRef = useRef(onValueChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const snapRef = useRef(snap)
  const rateRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(180 / rate)
  const [x, setX] = useState(START_X)
  const [y, setY] = useState(START_Y)
  const [axis, setAxis] = useState<SkewAxis>("x")
  const [phase, setPhase] = useState<SkewPhase>("idle")
  const rotY = (x / 40) * 28 * gain
  const rotX = (-y / 40) * 28 * gain

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    snapRef.current = snap
    rateRef.current = rate
  }, [onValueChange, live, reduced, snap, rate])

  function stop() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(nextX: number, nextY: number, nextPhase: SkewPhase) {
    const safeX = Math.round(clamp(nextX, -40, 40))
    const safeY = Math.round(clamp(nextY, -40, 40))
    xRef.current = safeX
    yRef.current = safeY
    setX(safeX)
    setY(safeY)
    setPhase(nextPhase)
    onValueRef.current?.({ x: safeX, y: safeY })
  }

  function glideTo(targetX: number, targetY: number) {
    stop()
    dragRef.current = null
    const fromX = xRef.current
    const fromY = yRef.current
    const done = targetX === 0 && targetY === 0 ? "zero" : "idle"
    if (reducedRef.current || !liveRef.current || (fromX === targetX && fromY === targetY)) {
      publish(targetX, targetY, done)
      return
    }
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    setPhase("settle")
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        publish(targetX, targetY, done)
        frame.current = 0
        return
      }
      publish(fromX + ((targetX - fromX) * step) / total, fromY + ((targetY - fromY) * step) / total, "settle")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (live) return
    stop()
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" || current === "zero" ? current : "idle"))
    })
  }, [live])

  useEffect(() => stop, [])

  function onDown(nextAxis: SkewAxis, event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stop()
    dragRef.current = nextAxis
    setAxis(nextAxis)
    const next = skewFromPointer(event.clientX, event.currentTarget.getBoundingClientRect())
    publish(nextAxis === "x" ? next : xRef.current, nextAxis === "y" ? next : yRef.current, reducedRef.current ? "idle" : "dragging")
    capture(event)
  }

  function onMove(nextAxis: SkewAxis, event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current !== nextAxis) return
    const next = skewFromPointer(event.clientX, event.currentTarget.getBoundingClientRect())
    publish(nextAxis === "x" ? next : xRef.current, nextAxis === "y" ? next : yRef.current, reducedRef.current ? "idle" : "dragging")
  }

  function onUp(nextAxis: SkewAxis, event: PointerEvent<HTMLDivElement>) {
    if (dragRef.current !== nextAxis) return
    dragRef.current = null
    const next = skewRelease(skewFromPointer(event.clientX, event.currentTarget.getBoundingClientRect()), snapRef.current)
    const nextX = nextAxis === "x" ? next : xRef.current
    const nextY = nextAxis === "y" ? next : yRef.current
    const nextPhase: SkewPhase = reducedRef.current ? "idle" : nextX === 0 && nextY === 0 ? "zero" : "settle"
    publish(nextX, nextY, nextPhase)
  }

  function onKey(nextAxis: SkewAxis, event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 4 : 1
    let delta = 0
    if (event.key === "ArrowRight") delta = step
    else if (event.key === "ArrowLeft") delta = -step
    else return
    event.preventDefault()
    stop()
    dragRef.current = null
    setAxis(nextAxis)
    const nextX = nextAxis === "x" ? xRef.current + delta : xRef.current
    const nextY = nextAxis === "y" ? yRef.current + delta : yRef.current
    const landed = nextX === 0 && nextY === 0
    publish(nextX, nextY, reducedRef.current ? "idle" : landed ? "zero" : "settle")
  }

  return (
    <div
      ref={ref}
      data-slot="skew-axis-warp"
      data-ritual="axis-warp"
      data-pace={rate}
      data-intensity={gain}
      data-grid={grid ? "on" : "off"}
      data-snap={snap ? "on" : "off"}
      data-x={x}
      data-y={y}
      data-axis={axis}
      data-rotx={rotX.toFixed(2)}
      data-roty={rotY.toFixed(2)}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-sm text-muted-foreground">Warp</p>
        <p role="status" className="text-sm font-semibold text-foreground">
          X {skewText(x)}
          <span className="mx-1 text-muted-foreground">·</span>Y {skewText(y)}
        </p>
      </div>
      <div className="[perspective:680px]">
        <motion.div
          data-part="panel"
          className="relative h-44 overflow-hidden rounded-2xl border border-border bg-muted motion-reduce:transition-none"
          style={{
            transform: `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`,
            transition: reduced ? "none" : `transform ${ease}ms linear`,
          }}
        >
          {grid ? (
            <div
              data-part="warp-grid"
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          ) : null}
          <span className="absolute left-5 top-5 h-14 w-24 rounded-xl bg-foreground/85" />
          <span className="absolute bottom-5 right-6 size-14 rounded-full" style={{ background: "var(--chart-2)" }} />
          <span className="absolute left-1/2 top-1/2 h-8 w-20 -translate-x-1/2 -translate-y-1/2 rounded-md" style={{ background: "var(--chart-4)" }} />
        </motion.div>
      </div>
      <SkewRail
        label="X"
        value={x}
        active={axis === "x"}
        onFocus={() => setAxis("x")}
        onPointerDown={(event) => onDown("x", event)}
        onPointerMove={(event) => onMove("x", event)}
        onPointerUp={(event) => onUp("x", event)}
        onKeyDown={(event) => onKey("x", event)}
      />
      <SkewRail
        label="Y"
        value={y}
        active={axis === "y"}
        onFocus={() => setAxis("y")}
        onPointerDown={(event) => onDown("y", event)}
        onPointerMove={(event) => onMove("y", event)}
        onPointerUp={(event) => onUp("y", event)}
        onKeyDown={(event) => onKey("y", event)}
      />
      <button type="button" onClick={() => glideTo(0, 0)} className="mt-3 rounded-full border border-border px-3 py-1.5 text-sm text-foreground">
        Reset
      </button>
    </div>
  )
}
