"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ClayDigitMorphProps {
  pace?: number
  intensity?: number
  digits?: number
  softness?: number
  className?: string
  onValueChange?: (value: number) => void
}

const SEQUENCE = [0, 7, 3] as const

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

export function ClayDigitMorph({
  pace = 1,
  intensity = 0.7,
  digits = 1,
  softness = 0.55,
  className,
  onValueChange,
}: ClayDigitMorphProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const valueRef = useRef(0)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const places = placesOf(digits)
  const soft = clamp(softness, 0, 1)
  const max = places === 1 ? 9 : 99
  const [value, setValue] = useState(0)
  const [from, setFrom] = useState(0)
  const [phase, setPhase] = useState<"idle" | "morphing">("idle")
  const safe = Math.min(Math.max(0, value), max)
  const display = places === 1 ? String(safe) : String(safe).padStart(2, "0")
  const squash = phase === "morphing" && !reduced ? Math.round((1 - gain * 0.55) * 100) / 100 : 1
  const depth = Math.round(6 + gain * 10 + soft * 8)

  if (value !== safe) setValue(safe)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    valueRef.current = safe
  }, [safe])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "morphing" ? "idle" : current))
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(next: number, previous: number) {
    valueRef.current = next
    setFrom(previous)
    setValue(next)
    onValueRef.current?.(next)
  }

  function morphTo(next: number) {
    const clamped = clamp(Math.round(next), 0, max)
    if (clamped === valueRef.current) return
    stopFrame()
    const previous = valueRef.current
    publish(clamped, previous)
    if (reduced || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("morphing")
    let left = Math.max(4, Math.round(8 / rate))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      left -= 1
      if (left <= 0) {
        setPhase("idle")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function pressDigit(digit: number) {
    if (places === 1) morphTo(digit)
    else morphTo((valueRef.current * 10 + digit) % 100)
  }

  function replay() {
    stopFrame()
    if (reduced || !liveRef.current) {
      const previous = valueRef.current
      publish(3, previous)
      setPhase("idle")
      return
    }
    let step = 0
    setPhase("morphing")
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      if (step >= SEQUENCE.length) {
        setPhase("idle")
        frame.current = 0
        return
      }
      const next = SEQUENCE[step] ?? 0
      step += 1
      const previous = valueRef.current
      publish(next, previous)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!/^[0-9]$/.test(event.key)) return
    event.preventDefault()
    pressDigit(Number(event.key))
  }

  return (
    <div
      ref={ref}
      data-slot="clay-digit-morph"
      data-ritual="clay-digit"
      data-pace={rate}
      data-intensity={gain}
      data-digits={places}
      data-places={places}
      data-softness={soft}
      data-value={safe}
      data-from={from}
      data-squash={squash}
      data-state={phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      aria-label="黏土数字"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <p
        aria-hidden
        className="grid h-36 place-items-center text-7xl font-semibold tabular-nums transition-transform motion-reduce:transition-none"
        style={{
          transform: `scaleY(${squash})`,
          filter: phase === "morphing" && !reduced ? "blur(0.4px)" : undefined,
          textShadow: `0 ${depth}px ${depth + 4}px color-mix(in oklab, var(--foreground) ${Math.round(18 + soft * 20)}%, transparent)`,
          boxShadow: `inset 0 ${Math.round(depth / 2)}px ${depth}px color-mix(in oklab, var(--foreground) 12%, transparent), 0 ${depth}px ${depth * 2}px color-mix(in oklab, var(--foreground) 16%, transparent)`,
        }}
      >
        {display}
      </p>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }, (_, digit) => (
          <button
            key={digit}
            type="button"
            aria-label={`数字 ${digit}`}
            onClick={() => pressDigit(digit)}
            className="rounded-full border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" aria-label="减一" onClick={() => morphTo(safe - 1 < 0 ? max : safe - 1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
          −
        </button>
        <button type="button" aria-label="加一" onClick={() => morphTo(safe + 1 > max ? 0 : safe + 1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
          +
        </button>
        <button type="button" onClick={replay} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Replay
        </button>
      </div>
    </div>
  )
}
