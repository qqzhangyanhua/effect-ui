"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PaintLiftRailProps {
  pace?: number
  intensity?: number
  snap?: boolean
  hue?: number
  className?: string
  onValueChange?: (t: number) => void
}

const TRACK = 160

type Phase = "idle" | "dragging" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function roundT(value: number) {
  return Math.round(clamp(value, 0, 1) * 1000) / 1000
}

function nearestStop(value: number) {
  const stops = [0, 0.5, 1]
  return stops.reduce((best, stop) => {
    const next = Math.abs(stop - value)
    const prev = Math.abs(best - value)
    if (next < prev || (next === prev && stop > best)) return stop
    return best
  })
}

export function PaintLiftRail({
  pace = 1,
  intensity = 0.6,
  snap = false,
  hue = 28,
  className,
  onValueChange,
}: PaintLiftRailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const drag = useRef(false)
  const origin = useRef({ y: 0, t: 0 })
  const tRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const snapRef = useRef(snap)
  const rateRef = useRef(1)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const paintHue = clamp(Math.round(hue), 0, 360)
  const [t, setT] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const shown = roundT(t)
  const clipTop = ((1 - shown) * 100).toFixed(1)
  const clip = `inset(${clipTop}% 0 0 0)`
  const brushing = phase === "dragging" && !reduced && gain > 0
  const jitter = brushing ? (gain * 8).toFixed(1) : "0"

  useEffect(() => {
    onValueRef.current = onValueChange
    snapRef.current = snap
    rateRef.current = rate
    reducedRef.current = reduced
    liveRef.current = live
    tRef.current = shown
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    drag.current = false
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
    })
  }, [live, onValueChange, rate, reduced, shown, snap])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(next: number, nextPhase: Phase) {
    const rounded = roundT(next)
    tRef.current = rounded
    setT(rounded)
    setPhase(nextPhase)
    onValueRef.current?.(rounded)
  }

  function springTo(target: number, useSnap: boolean) {
    stopFrame()
    const dest = roundT(useSnap && snapRef.current ? nearestStop(target) : target)
    if (reducedRef.current || !liveRef.current) {
      publish(dest, "idle")
      return
    }
    const from = tRef.current
    if (Math.abs(dest - from) < 0.001) {
      publish(dest, "idle")
      return
    }
    setPhase("settle")
    const steps = Math.max(4, Math.round(8 / rateRef.current))
    let step = 0
    const tick = () => {
      if (!liveRef.current) {
        publish(dest, "idle")
        frame.current = 0
        return
      }
      step += 1
      const progress = Math.min(1, step / steps)
      const eased = 1 - (1 - progress) ** 2
      const nextPhase = progress >= 1 ? "idle" : "settle"
      publish(from + (dest - from) * eased, nextPhase)
      if (progress >= 1) {
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function nudge(delta: number) {
    springTo(tRef.current + delta, false)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(0.05)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(-0.05)
    }
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== undefined && event.button !== 0) return
    drag.current = true
    origin.current = { y: event.clientY, t: tRef.current }
    stopFrame()
    if (!reducedRef.current && liveRef.current) setPhase("dragging")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!drag.current) return
    const next = origin.current.t + (origin.current.y - event.clientY) / TRACK
    if (reducedRef.current || !liveRef.current) {
      publish(next, "idle")
      return
    }
    publish(next, "dragging")
  }

  function onPointerUp() {
    if (!drag.current) return
    drag.current = false
    springTo(tRef.current, true)
  }

  return (
    <div
      ref={ref}
      data-slot="paint-lift-rail"
      data-ritual="paint-lift"
      data-axis="vertical"
      data-confirm="off"
      data-pace={rate}
      data-intensity={gain}
      data-snap={snap ? "on" : "off"}
      data-hue={paintHue}
      data-t={shown.toFixed(3)}
      data-clip={clip}
      data-edge={brushing ? "brush" : "straight"}
      data-jitter={jitter}
      data-state={phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "flex w-full max-w-md items-stretch gap-4 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative w-10 shrink-0" style={{ height: TRACK }} data-track="vertical">
        <div className="absolute inset-x-2 top-0 bottom-0 rounded-full bg-muted" />
        <button
          type="button"
          aria-label="油漆手柄"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={shown}
          aria-orientation="vertical"
          role="slider"
          data-handle
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute left-0 h-8 w-10 -translate-y-1/2 rounded-full border border-border bg-background shadow-sm outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ top: `${(1 - shown) * 100}%` }}
        />
      </div>
      <div className="relative min-h-40 flex-1 overflow-hidden rounded-2xl border border-border bg-background">
        <div className="absolute inset-0 bg-muted/40" />
        <div
          data-paint
          className="absolute inset-0"
          style={{
            clipPath: clip,
            background: `linear-gradient(180deg, color-mix(in oklab, var(--primary) 58%, hsl(${paintHue} 72% 46%)), color-mix(in oklab, var(--primary) 22%, hsl(${paintHue} 64% 64%)))`,
          }}
        />
        {brushing ? (
          <svg
            data-brush
            aria-hidden
            viewBox="0 0 100 8"
            className="absolute inset-x-0 h-2 text-primary"
            style={{ top: `calc(${clipTop}% - 4px)` }}
          >
            <path
              d={`M0 ${4 + Number(jitter) / 4} Q 15 ${1} 30 ${4 + Number(jitter) / 5} T 60 4 T 100 ${3 + Number(jitter) / 6}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        ) : null}
        <div className="relative flex h-full flex-col justify-end p-4">
          <p className="text-sm text-muted-foreground">样卡</p>
          <p className="text-lg font-medium">Sample</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={() => nudge(0.25)}>
          抬高
        </button>
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={() => nudge(-0.25)}>
          降低
        </button>
        <label className="text-xs text-muted-foreground">
          填充
          <input
            aria-label="填充"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={shown}
            onChange={(event) => springTo(Number(event.currentTarget.value), false)}
            className="mt-1 block w-16"
          />
        </label>
      </div>
    </div>
  )
}
