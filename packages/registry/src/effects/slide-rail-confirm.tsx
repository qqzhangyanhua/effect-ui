"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SlideRailConfirmProps {
  pace?: number
  intensity?: number
  threshold?: number
  className?: string
  onConfirm?: () => void
}

const SPAN = 280

type Phase = "idle" | "dragging" | "settle-back" | "success"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function SlideRailConfirm({
  pace = 1,
  intensity = 0.65,
  threshold = 0.9,
  className,
  onConfirm,
}: SlideRailConfirmProps) {
  const ref = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const drag = useRef(false)
  const progressRef = useRef(0)
  const phaseRef = useRef<Phase>("idle")
  const liveRef = useRef(false)
  const onConfirmRef = useRef(onConfirm)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const limit = clamp(threshold, 0.7, 1)
  const thumb = Math.round(36 + gain * 28)
  const height = Math.round(48 + gain * 20)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")

  useEffect(() => {
    onConfirmRef.current = onConfirm
  }, [onConfirm])

  useEffect(() => {
    liveRef.current = live
    progressRef.current = progress
    phaseRef.current = phase
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    drag.current = false
    if (phaseRef.current !== "settle-back") return
    progressRef.current = 0
    phaseRef.current = "idle"
    setProgress(0)
    setPhase("idle")
  }, [live, progress, phase])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function publish(next: number, nextPhase: Phase) {
    const clamped = clamp(next, 0, 1)
    progressRef.current = clamped
    phaseRef.current = nextPhase
    setProgress(clamped)
    setPhase(nextPhase)
  }

  function succeed() {
    if (phaseRef.current === "success") return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    drag.current = false
    publish(1, "success")
    onConfirmRef.current?.()
  }

  function settleBack() {
    const start = progressRef.current
    if (reduced || !liveRef.current || start <= 0) {
      publish(0, "idle")
      return
    }
    phaseRef.current = "settle-back"
    setPhase("settle-back")
    let step = 0
    const total = Math.max(4, Math.round(8 / rate))
    const tick = () => {
      if (!liveRef.current || phaseRef.current !== "settle-back") {
        publish(0, "idle")
        return
      }
      step += 1
      if (step >= total) {
        publish(0, "idle")
        frame.current = 0
        return
      }
      const eased = 1 - (1 - step / total) ** 2
      publish(start * (1 - eased), "settle-back")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function read(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect()
    const width = rect && rect.width > 0 ? rect.width : SPAN
    const left = rect?.left ?? 0
    const travel = Math.max(1, width - thumb)
    return clamp((clientX - left - thumb / 2) / travel, 0, 1)
  }

  function finish() {
    drag.current = false
    if (phaseRef.current === "success") return
    if (progressRef.current + 0.0001 >= limit) succeed()
    else settleBack()
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || phaseRef.current === "success" || (event.button !== undefined && event.button !== 0)) return
    drag.current = true
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    publish(read(event.clientX), "dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced || !drag.current || phaseRef.current === "success") return
    publish(read(event.clientX), "dragging")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (reduced || phaseRef.current === "success") return
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault()
      const delta = event.key === "ArrowRight" ? 0.1 : -0.1
      const next = Math.round((progressRef.current + delta) * 10) / 10
      publish(next, "dragging")
      return
    }
    if (event.key !== "Enter") return
    event.preventDefault()
    if (progressRef.current + 1e-6 >= limit) succeed()
  }

  function reset() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    drag.current = false
    publish(0, "idle")
  }

  const travel = Math.max(1, SPAN - thumb)
  const note = phase === "success" ? "已确认" : phase === "settle-back" ? "回弹" : phase === "dragging" ? "拖动中" : "未确认"

  return (
    <div
      ref={ref}
      data-slot="slide-rail-confirm"
      data-ritual="slide-rail"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-threshold={limit.toFixed(2)}
      data-span={SPAN}
      data-thumb={thumb}
      data-height={height}
      data-progress={progress.toFixed(3)}
      data-state={phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      {reduced ? (
        <button
          type="button"
          disabled={phase === "success"}
          onClick={succeed}
          className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-70"
        >
          Confirm
        </button>
      ) : (
        <div
          ref={trackRef}
          role="slider"
          aria-label="Slide to confirm"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-valuetext={phase === "success" ? "已确认" : undefined}
          aria-disabled={phase === "success" || undefined}
          tabIndex={phase === "success" ? -1 : 0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finish}
          onPointerCancel={finish}
          onKeyDown={onKeyDown}
          style={{ height }}
          className="relative touch-none overflow-hidden rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span data-fill aria-hidden className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${progress * 100}%` }} />
          <span
            data-label
            aria-hidden
            data-fade={(1 - progress).toFixed(2)}
            style={{ opacity: phase === "success" ? 0 : 1 - progress }}
            className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground"
          >
            Slide to confirm
          </span>
          <span
            data-thumb
            aria-hidden
            style={{ width: thumb, height: thumb - 8, transform: `translateX(${Math.round(progress * travel)}px)` }}
            className="pointer-events-none absolute top-1 left-1 grid place-items-center rounded-full bg-background text-foreground shadow-sm"
          >
            {phase === "success" ? "✓" : "→"}
          </span>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {note}
        </p>
        <button type="button" onClick={reset} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
          Reset
        </button>
      </div>
      {phase === "success" ? (
        <p data-check className="sr-only">
          已确认
        </p>
      ) : null}
    </div>
  )
}
