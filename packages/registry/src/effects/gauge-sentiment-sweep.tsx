"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GaugeSentimentSweepProps {
  pace?: number
  intensity?: number
  zones?: number
  snap?: boolean
  className?: string
  onValueChange?: (value: number) => void
}

export const SENTIMENT_5 = ["Strong down", "Down", "Neutral", "Up", "Strong up"] as const
export const SENTIMENT_3 = ["Down", "Neutral", "Up"] as const

const START = 0.5
const VIEW_W = 300
const VIEW_H = 168
const CX = 150
const CY = 142
const RADIUS = 104

type Phase = "idle" | "dragging" | "settle"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function zonesOf(zones: number): 3 | 5 {
  return zones === 3 ? 3 : 5
}

export function sentimentAt(value: number, zones: number) {
  const count = zonesOf(zones)
  const labels = count === 3 ? SENTIMENT_3 : SENTIMENT_5
  const safe = clamp(value, 0, 1)
  const index = safe >= 1 ? count - 1 : Math.min(count - 1, Math.floor(safe * count))
  const label = labels[index] ?? "Neutral"
  const center = Math.round(((index + 0.5) / count) * 100) / 100
  const theta = Math.round((1 - safe) * 180)
  return { index, label, center, theta, zones: count }
}

function needlePoint(value: number) {
  const deg = (1 - clamp(value, 0, 1)) * 180
  const rad = (deg * Math.PI) / 180
  return {
    x: CX + Math.cos(rad) * (RADIUS - 18),
    y: CY - Math.sin(rad) * (RADIUS - 18),
  }
}

function tallyOf(value: number) {
  const safe = clamp(value, 0, 1)
  return {
    down: Math.round((1 - safe) * 8 + 2),
    neutral: Math.round(6 + (0.5 - Math.abs(safe - 0.5)) * 8),
    up: Math.round(safe * 8 + 2),
  }
}

export function GaugeSentimentSweep({
  pace = 1,
  intensity = 0.7,
  zones = 5,
  snap = true,
  className,
  onValueChange,
}: GaugeSentimentSweepProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef(false)
  const valueRef = useRef(START)
  const onValueRef = useRef(onValueChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const snapRef = useRef(snap)
  const zonesRef = useRef(5)
  const rateRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const rawId = useId()
  const gradId = `sentiment-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const [value, setValue] = useState(START)
  const [phase, setPhase] = useState<Phase>("idle")
  const sentiment = sentimentAt(value, zones)
  const tally = tallyOf(value)
  const tip = needlePoint(value)
  const ease = reduced ? 0 : Math.round(180 / rate)
  const stroke = 8 + gain * 8
  const labels = sentiment.zones === 3 ? SENTIMENT_3 : SENTIMENT_5

  function publish(next: number, nextPhase: Phase) {
    const shown = quantize(next)
    valueRef.current = shown
    setValue(shown)
    setPhase(nextPhase)
    onValueRef.current?.(shown)
  }

  function stop() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    snapRef.current = snap
    zonesRef.current = zonesOf(zones)
    rateRef.current = rate
    if (live) return
    stop()
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
    })
  }, [onValueChange, live, reduced, snap, zones, rate])

  useEffect(() => {
    return () => stop()
  }, [])

  function settle(raw: number) {
    dragRef.current = false
    stop()
    const count = zonesRef.current === 3 ? 3 : 5
    const target = snapRef.current ? sentimentAt(raw, count).center : quantize(raw)
    if (reducedRef.current || !liveRef.current || Math.abs(target - valueRef.current) < 0.001) {
      publish(target, "idle")
      return
    }
    const from = valueRef.current
    setPhase("settle")
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        publish(target, "idle")
        frame.current = 0
        return
      }
      const next = quantize(from + (target - from) * (step / total))
      valueRef.current = next
      setValue(next)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function readValue(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : VIEW_W
    const height = rect.height > 0 ? rect.height : VIEW_H
    const x = ((event.clientX - rect.left) / width) * VIEW_W
    const y = ((event.clientY - rect.top) / height) * VIEW_H
    const deg = Math.atan2(CY - y, x - CX) * (180 / Math.PI)
    const bounded = clamp(deg, 0, 180)
    return quantize((180 - bounded) / 180)
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stop()
    dragRef.current = true
    publish(readValue(event), reducedRef.current ? "idle" : "dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    publish(readValue(event), reducedRef.current ? "idle" : "dragging")
  }

  function onPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return
    settle(readValue(event))
  }

  function stepZone(direction: number) {
    stop()
    const current = sentimentAt(valueRef.current, zonesRef.current)
    if (snapRef.current) {
      const next = clamp(current.index + direction, 0, current.zones - 1)
      publish(sentimentAt((next + 0.5) / current.zones, current.zones).center, "idle")
      return
    }
    publish(quantize(valueRef.current + direction * 0.04), "idle")
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      stepZone(1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      stepZone(-1)
    }
  }

  function jump(index: number) {
    stop()
    const count = zonesOf(zones)
    publish(sentimentAt((index + 0.5) / count, count).center, "idle")
  }

  return (
    <div
      ref={ref}
      data-slot="gauge-sentiment-sweep"
      data-ritual="sentiment-arc"
      data-pace={rate}
      data-intensity={gain}
      data-zones={sentiment.zones}
      data-snap={snap ? "on" : "off"}
      data-value={value.toFixed(2)}
      data-zone={sentiment.index}
      data-label={sentiment.label}
      data-theta={sentiment.theta}
      data-down={tally.down}
      data-neutral={tally.neutral}
      data-up={tally.up}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-1 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">Sentiment</p>
        <p className="text-lg font-semibold text-foreground" role="status">
          {sentiment.label}
        </p>
      </div>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="slider"
        aria-label="情绪指针"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={sentiment.label}
        tabIndex={0}
        data-part="arc"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="h-40 w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--destructive)" stopOpacity={0.45 + gain * 0.55} />
            <stop offset="0.5" stopColor="var(--muted-foreground)" stopOpacity={0.45 + gain * 0.4} />
            <stop offset="1" stopColor="var(--chart-2)" stopOpacity={0.45 + gain * 0.55} />
          </linearGradient>
        </defs>
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <motion.line
          data-needle
          x1={CX}
          y1={CY}
          x2={tip.x}
          y2={tip.y}
          stroke="var(--foreground)"
          strokeWidth={2 + gain * 2}
          strokeLinecap="round"
          className="motion-reduce:transition-none"
        />
        <circle cx={CX} cy={CY} r={6} fill="var(--foreground)" />
      </svg>
      <div className="flex flex-wrap justify-center gap-1">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            data-zone-label={label}
            data-active={index === sentiment.index ? "on" : "off"}
            onClick={() => jump(index)}
            className={cn(
              "rounded-full px-2 py-1 text-xs",
              index === sentiment.index ? "bg-foreground font-semibold text-background" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
        <p>
          Down <span className="block text-base text-foreground">{tally.down}</span>
        </p>
        <p>
          Neutral <span className="block text-base text-foreground">{tally.neutral}</span>
        </p>
        <p>
          Up <span className="block text-base text-foreground">{tally.up}</span>
        </p>
      </div>
    </div>
  )
}
