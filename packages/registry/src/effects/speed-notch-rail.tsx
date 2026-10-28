"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SpeedNotchRailProps {
  pace?: number
  intensity?: number
  preview?: boolean
  notches?: number
  className?: string
  onValueChange?: (rate: number) => void
}

export const SPEED_NOTCHES = {
  3: [0.5, 1, 2],
  5: [0.3, 0.5, 1, 2, 3],
  7: [0.3, 0.5, 0.75, 1, 1.5, 2, 3],
} as const

const RAIL = 280

type SpeedPhase = "idle" | "dragging" | "snapped"
type NotchCount = 3 | 5 | 7

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function speedCount(value: number): NotchCount {
  const rounded = Math.round(Number.isFinite(value) ? value : 5)
  if (rounded === 3) return 3
  if (rounded === 7) return 7
  return 5
}

export function speedNotches(count: number): readonly number[] {
  return SPEED_NOTCHES[speedCount(count)]
}

export function speedIndexFromPointer(clientX: number, rect: { left: number; width: number }, count: number) {
  const width = rect.width > 0 ? rect.width : RAIL
  const left = rect.width > 0 ? rect.left : 0
  const span = Math.max(1, count - 1)
  const t = clamp((clientX - left) / width, 0, 1)
  return Math.round(t * span)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

function formatRate(value: number) {
  return `${value}x`
}

export function SpeedNotchRail({
  pace = 1,
  intensity = 0.7,
  preview = true,
  notches = 5,
  className,
  onValueChange,
}: SpeedNotchRailProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const rateRef = useRef(1)
  const dragRef = useRef(false)
  const count = speedCount(notches)
  const list = speedNotches(count)
  const [index, setIndex] = useState(() => Math.max(0, list.indexOf(1)))
  const [phase, setPhase] = useState<SpeedPhase>("idle")
  const [playhead, setPlayhead] = useState(0)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const safe = clamp(index, 0, list.length - 1)
  const playback = list[safe] ?? 1
  const playing = preview && live && !reduced

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    rateRef.current = playback
  }, [playback])

  useEffect(() => {
    const nextList = speedNotches(count)
    const found = nextList.indexOf(rateRef.current)
    const next = found >= 0 ? found : Math.max(0, nextList.indexOf(1))
    const nextRate = nextList[next] ?? 1
    setIndex(next)
    if (nextRate === rateRef.current) return
    rateRef.current = nextRate
    onValueRef.current?.(nextRate)
  }, [count])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setPlayhead((value) => (value + dt * rateRef.current * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function apply(next: number, nextPhase: SpeedPhase) {
    const nextIndex = clamp(Math.round(next), 0, list.length - 1)
    const nextRate = list[nextIndex] ?? 1
    setPhase(reduced ? "snapped" : nextPhase)
    if (nextIndex === safe && nextRate === playback) return
    setIndex(nextIndex)
    rateRef.current = nextRate
    onValueRef.current?.(nextRate)
  }

  function readIndex(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    return speedIndexFromPointer(event.clientX, rect, list.length)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    apply(readIndex(event), "dragging")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    apply(readIndex(event), "dragging")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    apply(readIndex(event), "snapped")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") apply(safe + 1, "snapped")
    else if (event.key === "ArrowLeft") apply(safe - 1, "snapped")
    else if (event.key === "Home") apply(0, "snapped")
    else if (event.key === "End") apply(list.length - 1, "snapped")
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="speed-notch-rail"
      data-ritual="speed-notch"
      data-pace={paceRate}
      data-intensity={gain}
      data-preview={preview ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      data-notches={list.length}
      data-index={safe}
      data-rate={String(playback)}
      data-preview-t={playhead.toFixed(2)}
      data-state={phase}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">Speed</p>
        <p data-part="rate" className="text-2xl font-semibold text-foreground">
          {formatRate(playback)}
        </p>
      </div>
      {preview ? (
        <div data-part="preview" className="relative mb-3 h-16 overflow-hidden rounded-2xl bg-muted">
          <motion.span
            data-part="runner"
            className="absolute top-1/2 size-8 -translate-y-1/2 rounded-md bg-primary motion-reduce:transition-none"
            style={{
              left: `${8 + playhead * 78}%`,
              opacity: 0.45 + gain * 0.55,
            }}
          />
        </div>
      ) : null}
      <div
        role="slider"
        aria-label="Playback speed"
        aria-valuemin={list[0]}
        aria-valuemax={list[list.length - 1]}
        aria-valuenow={playback}
        aria-valuetext={formatRate(playback)}
        tabIndex={0}
        data-part="rail"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-12 touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
        <motion.span
          data-part="thumb"
          className="pointer-events-none absolute top-1/2 z-10 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background motion-reduce:transition-none"
          style={{
            left: `${(safe / Math.max(1, list.length - 1)) * 100}%`,
            boxShadow: `0 0 ${6 + gain * 14}px color-mix(in srgb, var(--primary) ${Math.round(30 + gain * 50)}%, transparent)`,
            transition: reduced ? "none" : `left ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between">
        {list.map((notch, notchIndex) => {
          const on = notchIndex === safe
          return (
            <div
              key={notch}
              role="button"
              tabIndex={-1}
              data-notch={notch}
              aria-label={formatRate(notch)}
              onClick={() => apply(notchIndex, "snapped")}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.preventDefault()
                apply(notchIndex, "snapped")
              }}
              className={cn(
                "cursor-pointer px-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                on ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {formatRate(notch)}
            </div>
          )
        })}
      </div>
      <p role="status" className="sr-only">
        {formatRate(playback)}
      </p>
    </div>
  )
}
