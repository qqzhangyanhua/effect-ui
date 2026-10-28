"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BalancePlanePuckProps {
  pace?: number
  intensity?: number
  snap?: boolean
  grid?: boolean
  className?: string
  onValueChange?: (point: { x: number; y: number }) => void
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

const START_X = 0.24
const START_Y = -0.16
const PLANE = 220

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function qAxis(value: number) {
  return Math.round(clamp(value, -1, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function balanceHeld(x: number, y: number, snap: boolean) {
  const next = { x: qAxis(x), y: qAxis(y) }
  if (snap && Math.hypot(next.x, next.y) <= 0.16) return { x: 0, y: 0 }
  return next
}

export function balanceReadout(x: number, y: number) {
  const balance = Math.abs(x) < 0.05 ? "Center" : x < 0 ? `L ${Math.round(Math.abs(x) * 100)}` : `R ${Math.round(x * 100)}`
  const fade = Math.abs(y) < 0.05 ? "Center" : y < 0 ? `F ${Math.round(Math.abs(y) * 100)}` : `B ${Math.round(y * 100)}`
  return { balance, fade }
}

export function balanceFromPointer(clientX: number, clientY: number, rect: Box, snap: boolean) {
  const width = rect.width > 0 ? rect.width : PLANE
  const height = rect.height > 0 ? rect.height : PLANE
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  const x = ((clientX - left) / width) * 2 - 1
  const y = ((clientY - top) / height) * 2 - 1
  return balanceHeld(x, y, snap)
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function BalancePlanePuck({
  pace = 1,
  intensity = 0.65,
  snap = true,
  grid = false,
  className,
  onValueChange,
}: BalancePlanePuckProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
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
  const [phase, setPhase] = useState<"idle" | "dragging" | "settle">("idle")
  const readout = balanceReadout(x, y)

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    snapRef.current = snap
    rateRef.current = rate
  }, [onValueChange, live, reduced, snap, rate])

  function publish(nextX: number, nextY: number, nextPhase: "idle" | "dragging" | "settle") {
    const safeX = qAxis(nextX)
    const safeY = qAxis(nextY)
    xRef.current = safeX
    yRef.current = safeY
    setX(safeX)
    setY(safeY)
    setPhase(nextPhase)
    onValueRef.current?.({ x: safeX, y: safeY })
  }

  function stop() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function glideTo(targetX: number, targetY: number) {
    stop()
    dragRef.current = false
    const fromX = xRef.current
    const fromY = yRef.current
    if (reducedRef.current || !liveRef.current || (Math.abs(fromX - targetX) < 0.001 && Math.abs(fromY - targetY) < 0.001)) {
      publish(targetX, targetY, "idle")
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
        publish(targetX, targetY, "idle")
        frame.current = 0
        return
      }
      publish(fromX + (targetX - fromX) * (step / total), fromY + (targetY - fromY) * (step / total), "settle")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (live) return
    stop()
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
    })
  }, [live])

  useEffect(() => stop, [])

  function read(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return balanceFromPointer(event.clientX, event.clientY, rect, snapRef.current)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    if (event.detail !== undefined && event.detail >= 2) return
    stop()
    dragRef.current = true
    const next = read(event)
    publish(next.x, next.y, reducedRef.current ? "idle" : "dragging")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = read(event)
    publish(next.x, next.y, reducedRef.current ? "idle" : "dragging")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const next = read(event)
    publish(next.x, next.y, "idle")
  }

  function nudge(dx: number, dy: number) {
    stop()
    dragRef.current = false
    const next = balanceHeld(xRef.current + dx, yRef.current + dy, snapRef.current)
    publish(next.x, next.y, "idle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 0.2 : 0.05
    if (event.key === "ArrowRight") {
      event.preventDefault()
      nudge(step, 0)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      nudge(-step, 0)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(0, -step)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(0, step)
    } else if (event.key === "Home") {
      event.preventDefault()
      glideTo(0, 0)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="balance-plane-puck"
      data-ritual="balance-plane"
      data-pace={rate}
      data-intensity={gain}
      data-snap={snap ? "on" : "off"}
      data-grid={grid ? "on" : "off"}
      data-x={x.toFixed(2)}
      data-y={y.toFixed(2)}
      data-balance={readout.balance}
      data-fade={readout.fade}
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
        <p className="text-sm text-muted-foreground">Field</p>
        <p role="status" className="text-right text-sm font-semibold text-foreground">
          Balance {readout.balance}
          <span className="mx-1 text-muted-foreground">·</span>
          Fade {readout.fade}
        </p>
      </div>
      <div
        role="slider"
        aria-label="Balance plane"
        aria-valuemin={-100}
        aria-valuemax={100}
        aria-valuenow={Math.round(x * 100)}
        aria-valuetext={`Balance ${readout.balance}, Fade ${readout.fade}`}
        tabIndex={0}
        data-part="plane"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => glideTo(0, 0)}
        className="relative aspect-square w-full touch-none rounded-3xl border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {grid ? (
          <>
            {[25, 75].map((offset) => (
              <span key={`v-${offset}`} data-part="grid-line" className="absolute inset-y-3 w-px bg-border" style={{ left: `${offset}%` }} />
            ))}
            {[25, 75].map((offset) => (
              <span key={`h-${offset}`} data-part="grid-line" className="absolute inset-x-3 h-px bg-border" style={{ top: `${offset}%` }} />
            ))}
          </>
        ) : null}
        <span className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 border-l border-dashed border-foreground/40" />
        <span className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 border-t border-dashed border-foreground/40" />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">L</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R</span>
        <span className="absolute left-1/2 top-2 -translate-x-1/2 text-xs text-muted-foreground">F</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">B</span>
        <motion.span
          data-puck
          className="absolute size-8 rounded-full border-2 border-background bg-foreground motion-reduce:transition-none"
          style={{
            left: `${((x + 1) / 2) * 100}%`,
            top: `${((y + 1) / 2) * 100}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 ${8 + gain * 18}px color-mix(in oklab, var(--foreground) 55%, transparent)`,
            transition: reduced ? "none" : `left ${ease}ms linear, top ${ease}ms linear`,
          }}
        />
      </div>
      <button type="button" onClick={() => glideTo(0, 0)} className="mt-3 rounded-full border border-border px-3 py-1.5 text-sm text-foreground">
        Reset
      </button>
    </div>
  )
}
