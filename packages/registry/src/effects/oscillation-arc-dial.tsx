"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface OscillationArcDialProps {
  pace?: number
  intensity?: number
  step?: number
  span?: number
  className?: string
  onValueChange?: (value: number) => void
}

const viewW = 280
const viewH = 180
const cx = 140
const cy = 150
const radius = 108

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function stepOf(step: number) {
  return clamp(Math.round(step), 1, 10)
}

function spanOf(span: number) {
  return clamp(span, 120, 240)
}

function snapTo(raw: number, step: number) {
  return clamp(Math.round(raw / step) * step, 0, 100)
}

function angles(span: number) {
  const rad = (span * Math.PI) / 180
  return { start: Math.PI / 2 + rad / 2, end: Math.PI / 2 - rad / 2 }
}

function pointAt(angle: number, distance = radius) {
  return { x: cx + Math.cos(angle) * distance, y: cy - Math.sin(angle) * distance }
}

function angleFor(value: number, span: number) {
  const { start, end } = angles(span)
  return start + (end - start) * (clamp(value, 0, 100) / 100)
}

function valueFor(angle: number, span: number) {
  const { start, end } = angles(span)
  return clamp((start - angle) / (start - end), 0, 1) * 100
}

export function OscillationArcDial({
  pace = 1,
  intensity = 0.65,
  step = 1,
  span = 180,
  className,
  onValueChange,
}: OscillationArcDialProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const liveRef = useRef(false)
  const dragRef = useRef(false)
  const onValueRef = useRef(onValueChange)
  const valueRef = useRef(40)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const unit = stepOf(step)
  const arc = spanOf(span)
  const { start, end } = angles(arc)
  const [value, setValue] = useState(40)
  const [phase, setPhase] = useState<"rest" | "dragging" | "oscillating">("rest")
  const [wobble, setWobble] = useState(false)
  const display = Math.round(value)
  const thumb = pointAt(angleFor(value, arc))
  const stroke = 6 + gain * 10

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    const stepNow = unit
    queueMicrotask(() => {
      if (liveRef.current) return
      setWobble(false)
      setPhase("rest")
      setValue((current) => snapTo(current, stepNow))
    })
  }, [live, unit])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function publish(next: number, nextPhase: "rest" | "dragging" | "oscillating", oscillating: boolean) {
    valueRef.current = next
    setValue(next)
    setPhase(nextPhase)
    setWobble(oscillating)
  }

  function settle(raw: number) {
    const snapped = snapTo(raw, unit)
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    if (reduced || !liveRef.current) {
      publish(snapped, "rest", false)
      onValueRef.current?.(snapped)
      return
    }
    const amp = 4 + gain * 14
    let count = 0
    const total = Math.max(8, Math.round(14 / rate))
    const tick = () => {
      if (!liveRef.current) {
        publish(snapped, "rest", false)
        onValueRef.current?.(snapped)
        return
      }
      count += 1
      if (count >= total) {
        publish(snapped, "rest", false)
        onValueRef.current?.(snapped)
        frame.current = 0
        return
      }
      const decay = Math.exp(-count * (0.18 + rate * 0.05))
      const offset = Math.sin(count * 1.2) * amp * decay
      publish(clamp(snapped + offset, 0, 100), "oscillating", Math.abs(offset) > 0.4)
      frame.current = window.requestAnimationFrame(tick)
    }
    const first = Math.sin(1.2) * amp * Math.exp(-(0.18 + rate * 0.05))
    publish(clamp(snapped + first, 0, 100), "oscillating", true)
    frame.current = window.requestAnimationFrame(tick)
  }

  function read(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : viewW
    const height = rect.height > 0 ? rect.height : viewH
    const x = ((event.clientX - rect.left) / width) * viewW
    const y = ((event.clientY - rect.top) / height) * viewH
    let angle = Math.atan2(cy - y, x - cx)
    if (angle < end || angle > start) {
      angle = Math.abs(angle - start) < Math.abs(angle - end) ? start : end
    }
    return valueFor(angle, arc)
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== undefined && event.button !== 0) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    dragRef.current = true
    publish(read(event), "dragging", false)
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    publish(read(event), "dragging", false)
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    settle(read(event))
  }

  function stepBy(direction: number) {
    const next = snapTo(valueRef.current + direction * unit, unit)
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    publish(next, "rest", false)
    onValueRef.current?.(next)
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      stepBy(1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      stepBy(-1)
    }
  }

  const ticks: number[] = []
  for (let mark = 0; mark <= 100; mark += unit) ticks.push(mark)
  const from = pointAt(start)
  const to = pointAt(end)
  const d = `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} A ${radius} ${radius} 0 ${arc > 180 ? 1 : 0} 0 ${to.x.toFixed(2)} ${to.y.toFixed(2)}`

  return (
    <div
      ref={ref}
      data-slot="oscillation-arc-dial"
      data-ritual="arc-dial"
      data-pace={rate}
      data-intensity={gain}
      data-step={unit}
      data-span={arc}
      data-value={value.toFixed(1)}
      data-state={phase}
      data-wobble={wobble ? "on" : "off"}
      data-oscillation={reduced ? "off" : "on"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-stroke={stroke.toFixed(1)}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">强度</p>
        <p className="font-display text-4xl leading-none text-foreground" data-readout>
          {display}
        </p>
      </div>
      <svg
        data-arc
        viewBox={`0 0 ${viewW} ${viewH}`}
        role="slider"
        aria-label="弧度拨盘"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={display}
        aria-valuetext={String(display)}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="h-44 w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <path d={d} fill="none" stroke="var(--border)" strokeWidth={stroke} strokeLinecap="round" />
        {ticks.map((mark) => {
          const angle = angleFor(mark, arc)
          const outer = pointAt(angle)
          const inner = pointAt(angle, radius - (mark % 10 === 0 ? 18 : 9))
          return (
            <line
              key={mark}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--muted-foreground)"
              strokeWidth={mark % 10 === 0 ? 2 : 1}
            />
          )
        })}
        <circle cx={thumb.x} cy={thumb.y} r={12 + gain * 4} fill="var(--primary)" stroke="var(--background)" strokeWidth={3} data-thumb />
      </svg>
      {reduced ? (
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => stepBy(-1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            减一档
          </button>
          <button type="button" onClick={() => stepBy(1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            加一档
          </button>
        </div>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">
        {display}
      </p>
    </div>
  )
}
