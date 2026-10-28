"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface KnurlScrubDialProps {
  pace?: number
  intensity?: number
  step?: number
  axis?: "x" | "y"
  className?: string
  onValueChange?: (value: number) => void
}

type Phase = "idle" | "dragging" | "coast" | "settle"
type Axis = "x" | "y"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function stepOf(step: number) {
  return clamp(Math.round(step), 0, 10)
}

function axisOf(axis: string): Axis {
  return axis === "y" ? "y" : "x"
}

function sensitivity(gain: number) {
  return 0.2 + gain * 0.4
}

function quantize(value: number, step: number) {
  const clamped = clamp(value, 0, 100)
  if (step <= 0) return Math.round(clamped * 10) / 10
  return clamp(Math.round(clamped / step) * step, 0, 100)
}

function valueText(value: number, step: number) {
  if (step >= 1) return String(Math.round(value))
  return value.toFixed(1)
}

function rollOf(value: number, gain: number) {
  return Math.round(value * (1.5 + gain * 2))
}

export function KnurlScrubDial({
  pace = 1,
  intensity = 0.7,
  step = 1,
  axis = "x",
  className,
  onValueChange,
}: KnurlScrubDialProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const valueRef = useRef(50)
  const dragRef = useRef(false)
  const originRef = useRef({ pos: 0, value: 50 })
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const reducedRef = useRef(reduced)
  const liveRef = useRef(live)
  const rateRef = useRef(1)
  const stepRef = useRef(1)
  const axisRef = useRef<Axis>("x")
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const stride = stepOf(step)
  const direction = axisOf(axis)
  const [value, setValue] = useState(50)
  const [phase, setPhase] = useState<Phase>("idle")
  const shown = quantize(value, stride)
  const ease = reduced ? 0 : Math.round(180 / rate)
  const roll = rollOf(shown, gain)
  const vertical = direction === "y"

  useEffect(() => {
    reducedRef.current = reduced
    liveRef.current = live
    rateRef.current = rate
    stepRef.current = stride
    axisRef.current = direction
    onValueRef.current = onValueChange
    const next = quantize(valueRef.current, stride)
    if (next !== valueRef.current) {
      valueRef.current = next
      setValue(next)
    }
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase("idle")
    })
  }, [reduced, live, rate, stride, direction, onValueChange])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(next: number, nextPhase: Phase) {
    const quantized = quantize(next, stepRef.current)
    const changed = quantized !== valueRef.current
    valueRef.current = quantized
    setValue(quantized)
    setPhase(nextPhase)
    if (changed) onValueRef.current?.(quantized)
  }

  function runSettle() {
    stopFrame()
    if (reducedRef.current || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("settle")
    let left = Math.max(3, Math.round(5 / rateRef.current))
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

  function runCoast(sign: number) {
    stopFrame()
    if (reducedRef.current || !liveRef.current || sign === 0) {
      setPhase("idle")
      return
    }
    setPhase("coast")
    let left = Math.max(3, Math.round(5 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      const next = valueRef.current + sign * 0.4
      const done = left <= 1 || next <= 0 || next >= 100
      publish(next, done ? "idle" : "coast")
      left -= 1
      if (done) {
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function nudge(sign: number) {
    const delta = stepRef.current > 0 ? stepRef.current : 1
    const next = quantize(valueRef.current + sign * delta, stepRef.current)
    if (next === valueRef.current) return
    valueRef.current = next
    setValue(next)
    onValueRef.current?.(next)
    if (reducedRef.current || !liveRef.current) setPhase("idle")
    else runSettle()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const up = event.key === "ArrowRight" || event.key === "ArrowUp"
    const down = event.key === "ArrowLeft" || event.key === "ArrowDown"
    if (!up && !down) return
    event.preventDefault()
    nudge(up ? 1 : -1)
  }

  function pointerDelta(event: PointerEvent<HTMLDivElement>) {
    if (axisRef.current === "y") return originRef.current.pos - event.clientY
    return event.clientX - originRef.current.pos
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    originRef.current = {
      pos: axisRef.current === "y" ? event.clientY : event.clientX,
      value: valueRef.current,
    }
    stopFrame()
    if (!reducedRef.current && liveRef.current) setPhase("dragging")
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // jsdom 没有指针捕获。
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const next = originRef.current.value + pointerDelta(event) * sensitivity(gain)
    publish(next, reducedRef.current || !liveRef.current ? "idle" : "dragging")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const delta = pointerDelta(event)
    if (stepRef.current <= 0 && Math.abs(delta) > 18 && !reducedRef.current && liveRef.current) {
      runCoast(Math.sign(delta))
      return
    }
    if (reducedRef.current || !liveRef.current) setPhase("idle")
    else runSettle()
  }

  function onSlider(next: number) {
    publish(next, "idle")
  }

  const ridges = vertical
    ? `repeating-linear-gradient(180deg, color-mix(in oklab, var(--foreground) ${18 + gain * 55}%, var(--background)) 0 2px, var(--muted) 2px 7px)`
    : `repeating-linear-gradient(90deg, color-mix(in oklab, var(--foreground) ${18 + gain * 55}%, var(--background)) 0 2px, var(--muted) 2px 7px)`

  return (
    <div
      ref={ref}
      data-slot="knurl-scrub-dial"
      data-ritual="knurl"
      data-layout="cylinder"
      data-pace={rate}
      data-intensity={gain}
      data-step={stride}
      data-axis={direction}
      data-value={valueText(shown, stride)}
      data-roll={roll}
      data-state={phase}
      data-ease={ease}
      data-rolling={reduced ? "off" : "on"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "grid w-full max-w-sm justify-items-center gap-4 rounded-3xl border border-border bg-card p-5 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p data-part="readout" className="font-sans text-5xl font-semibold tabular-nums tracking-tight text-foreground">
        {valueText(shown, stride)}
      </p>
      <div
        role="slider"
        aria-label="滚花拨盘"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={shown}
        aria-valuetext={valueText(shown, stride)}
        tabIndex={0}
        data-part="cylinder"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={cn(
          "relative touch-none overflow-hidden rounded-full border border-border bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring",
          vertical ? "h-40 w-16" : "h-16 w-56",
        )}
        style={{
          backgroundImage: ridges,
          backgroundPosition: vertical ? `0 ${roll}px` : `${roll}px 0`,
          transition: reduced ? "none" : `background-position ${ease}ms linear`,
        }}
      >
        <motion.div
          aria-hidden
          data-part="sheen"
          initial={false}
          animate={{
            x: reduced || vertical ? 0 : (roll % 24) - 12,
            y: reduced || !vertical ? 0 : (roll % 24) - 12,
          }}
          transition={reduced ? { duration: 0 } : { duration: 0.12 / rate, ease: "linear" }}
          className={cn(
            "pointer-events-none absolute bg-background/50",
            vertical ? "inset-x-1 h-6" : "inset-y-1 w-8",
          )}
        />
      </div>
      <div className="flex gap-2">
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm text-foreground" onClick={() => nudge(-1)}>
          减小
        </button>
        <button type="button" className="rounded-full border border-border px-3 py-1 text-sm text-foreground" onClick={() => nudge(1)}>
          增大
        </button>
      </div>
      {reduced ? (
        <input
          type="range"
          aria-label="数值"
          min={0}
          max={100}
          step={stride > 0 ? stride : 0.1}
          value={shown}
          onChange={(event) => onSlider(Number(event.target.value))}
          className="w-full accent-primary"
        />
      ) : null}
    </div>
  )
}
