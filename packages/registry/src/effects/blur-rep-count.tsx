"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BlurRepCountProps {
  pace?: number
  intensity?: number
  auto?: boolean
  digits?: number
  className?: string
  onValueChange?: (value: number) => void
}

type Phase = "idle" | "blurring"
type Direction = "up" | "down"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function placesOf(digits: number) {
  return clamp(Math.round(digits), 1, 2)
}

export function BlurRepCount({
  pace = 1,
  intensity = 0.65,
  auto = false,
  digits = 1,
  className,
  onValueChange,
}: BlurRepCountProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const valueRef = useRef(0)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const maxRef = useRef(9)
  const blurMaxRef = useRef(8)
  const shiftRef = useRef(24)
  const bumpRef = useRef<(delta: number) => void>(() => {})
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const places = placesOf(digits)
  const max = places === 1 ? 9 : 99
  const blurMax = Math.round(4 + gain * 14)
  const shift = Math.round(18 + gain * 36)
  const [value, setValue] = useState(0)
  const [from, setFrom] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const [dir, setDir] = useState<Direction>("up")
  const [blur, setBlur] = useState(0)
  const safe = clamp(value, 0, max)
  const display = places === 1 ? String(safe) : String(safe).padStart(2, "0")
  const outgoing = places === 1 ? String(clamp(from, 0, max)) : String(clamp(from, 0, max)).padStart(2, "0")
  const travel = dir === "up" ? -shift : shift
  const progress = phase === "blurring" && blurMax > 0 ? 1 - blur / blurMax : 1
  const outY = travel * progress
  const inY = -travel * (1 - progress)

  if (value !== safe) setValue(safe)

  useEffect(() => {
    valueRef.current = safe
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    maxRef.current = max
    blurMaxRef.current = blurMax
    shiftRef.current = shift
    onValueRef.current = onValueChange
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase("idle")
      setBlur(0)
    })
  }, [blurMax, live, max, onValueChange, rate, reduced, safe, shift])

  useEffect(() => {
    if (!auto || reduced || !live) return
    const id = window.setInterval(() => bumpRef.current(1), Math.max(240, Math.round(720 / rate)))
    return () => window.clearInterval(id)
  }, [auto, live, rate, reduced])

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(frame.current)
    }
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(next: number, previous: number, direction: Direction) {
    valueRef.current = next
    setFrom(previous)
    setValue(next)
    setDir(direction)
    onValueRef.current?.(next)
  }

  const bump = useCallback((delta: number) => {
    const next = clamp(valueRef.current + delta, 0, maxRef.current)
    if (next === valueRef.current) return
    stopFrame()
    const previous = valueRef.current
    const direction: Direction = delta > 0 ? "up" : "down"
    publish(next, previous, direction)
    if (reducedRef.current || !liveRef.current) {
      setPhase("idle")
      setBlur(0)
      return
    }
    setPhase("blurring")
    setBlur(blurMaxRef.current)
    let left = Math.max(4, Math.round(10 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        setBlur(0)
        frame.current = 0
        return
      }
      left -= 1
      const progress = 1 - Math.max(left, 0) / Math.max(4, Math.round(10 / rateRef.current))
      setBlur(Math.round(blurMaxRef.current * (1 - progress)))
      if (left <= 0) {
        setPhase("idle")
        setBlur(0)
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    bumpRef.current = bump
  }, [bump])

  function replay() {
    stopFrame()
    if (reducedRef.current || !liveRef.current) {
      const previous = valueRef.current
      publish(Math.min(2, maxRef.current), previous, "up")
      setPhase("idle")
      setBlur(0)
      return
    }
    const sequence = [0, 1, 2]
    let step = 0
    setPhase("blurring")
    setBlur(blurMaxRef.current)
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        setBlur(0)
        frame.current = 0
        return
      }
      if (step >= sequence.length) {
        setPhase("idle")
        setBlur(0)
        frame.current = 0
        return
      }
      const next = sequence[step] ?? 0
      step += 1
      const previous = valueRef.current
      if (next !== previous) publish(next, previous, "up")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp" || event.key === "+") {
      event.preventDefault()
      bump(1)
    } else if (event.key === "ArrowDown" || event.key === "-") {
      event.preventDefault()
      bump(-1)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="blur-rep-count"
      data-ritual="blur-rep"
      data-clay="off"
      data-pace={rate}
      data-intensity={gain}
      data-auto={auto ? "on" : "off"}
      data-digits={places}
      data-value={safe}
      data-from={from}
      data-dir={dir}
      data-state={phase}
      data-blur={blur}
      data-shift={shift}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="relative grid h-32 place-items-center overflow-hidden" aria-hidden>
        {phase === "blurring" && !reduced ? (
          <>
            <span
              data-role="out"
              className="absolute text-7xl font-semibold tabular-nums text-foreground"
              style={{ transform: `translateY(${outY}px)`, filter: `blur(${blurMax}px)` }}
            >
              {outgoing}
            </span>
            <span
              data-role="in"
              className="absolute text-7xl font-semibold tabular-nums text-foreground"
              style={{ transform: `translateY(${inY}px)`, filter: `blur(${blur}px)` }}
            >
              {display}
            </span>
          </>
        ) : (
          <span data-role="idle" className="text-7xl font-semibold tabular-nums text-foreground">
            {display}
          </span>
        )}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {display}
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={() => bump(-1)}>
          减
        </button>
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={() => bump(1)}>
          加
        </button>
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm" onClick={replay}>
          Replay
        </button>
      </div>
    </div>
  )
}
