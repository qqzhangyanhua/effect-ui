"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type StressScale = "2" | "3" | "5"
export type StressLevel = "low" | "medium" | "high"

export interface StressBandMeterProps {
  pace?: number
  intensity?: number
  scaleMax?: StressScale
  breathe?: boolean
  className?: string
  onValueChange?: (value: number) => void
}

const START = 1.2
const LEVELS: readonly StressLevel[] = ["low", "medium", "high"]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(value * 10) / 10
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function scaleMaxOf(scaleMax: string) {
  if (scaleMax === "2" || scaleMax === "5" || scaleMax === "3") return Number(scaleMax)
  return 3
}

export function stressLevel(value: number, scaleMax: number): StressLevel {
  const max = scaleMax === 2 || scaleMax === 5 ? scaleMax : 3
  const u = clamp(value, 0, max) / max
  if (u < 1 / 3) return "low"
  if (u < 2 / 3) return "medium"
  return "high"
}

export function levelWord(level: StressLevel) {
  if (level === "low") return "LOW"
  if (level === "medium") return "MEDIUM"
  return "HIGH"
}

function bandValue(level: StressLevel, max: number) {
  if (level === "low") return quantize(max / 6)
  if (level === "medium") return quantize(max / 2)
  return quantize((max * 5) / 6)
}

function blobPath(index: number, sway: number, amp: number) {
  const a = Math.sin(sway + index) * amp
  const b = Math.cos(sway * 0.8 + index * 1.7) * amp
  const y = 30 + index * 40
  return `M 18 ${y + 8 + a} C ${52 + b} ${y - 18 - a}, ${118 - b} ${y - 10 + a}, ${176} ${y + 4} C ${214 + a} ${y + 26 - b}, ${132 - a} ${y + 42 + b}, ${74} ${y + 34} C ${30 - b} ${y + 24}, ${8} ${y + 16}, 18 ${y + 8 + a} Z`
}

const FILLS: Record<StressLevel, string> = {
  low: "var(--chart-2)",
  medium: "var(--chart-4)",
  high: "var(--chart-5)",
}

export function StressBandMeter({
  pace = 1,
  intensity = 0.6,
  scaleMax = "3",
  breathe = true,
  className,
  onValueChange,
}: StressBandMeterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const onValueRef = useRef(onValueChange)
  const rateRef = useRef(1)
  const breatheRef = useRef(breathe)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const max = scaleMaxOf(scaleMax)
  const [value, setValue] = useState(START)
  const [sway, setSway] = useState(0)
  const [phase, setPhase] = useState<"idle" | "adjusting" | "labeled">("idle")
  const shown = quantize(clamp(Math.min(value, max), 0, max))
  const level = stressLevel(shown, max)
  const ease = reduced ? 0 : Math.round(240 / rate)
  const amp = reduced || !breathe ? 0 : 3 + gain * 5

  function commit(next: number, nextPhase: "idle" | "adjusting" | "labeled") {
    const bounded = quantize(clamp(next, 0, max))
    setValue(bounded)
    setPhase(nextPhase)
    onValueRef.current?.(bounded)
  }

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    breatheRef.current = breathe
  }, [onValueChange, live, reduced, rate, breathe])

  useEffect(() => {
    if (!breathe || reduced || !live) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current || !breatheRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      last = now > 0 ? now : last
      setSway((current) => current + dt * rateRef.current)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [breathe, reduced, live])

  function step(direction: number) {
    commit(shown + direction * 0.1, "labeled")
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault()
      step(1)
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault()
      step(-1)
    } else if (event.key === "Home") {
      event.preventDefault()
      commit(0, "labeled")
    } else if (event.key === "End") {
      event.preventDefault()
      commit(max, "labeled")
    }
  }

  return (
    <div
      ref={ref}
      data-slot="stress-band-meter"
      data-ritual="stress-band"
      data-pace={rate}
      data-intensity={gain}
      data-max={max}
      data-breathe={breathe ? "on" : "off"}
      data-value={shown.toFixed(1)}
      data-level={level}
      data-label={levelWord(level)}
      data-sway={sway.toFixed(2)}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="flex gap-3">
        <div className="flex h-48 w-10 flex-col items-center">
          <span className="text-[10px] text-muted-foreground">{max}</span>
          <div
            className="relative my-1 w-2 flex-1 rounded-full"
            style={{ background: "linear-gradient(to top, var(--chart-2), var(--chart-4), var(--chart-5))" }}
            aria-hidden
          >
            <span
              data-part="tick"
              className="absolute left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-background bg-foreground"
              style={{ bottom: `${(shown / max) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">0</span>
        </div>
        <div className="relative min-w-0 flex-1">
          <svg viewBox="0 0 230 150" className="h-48 w-full" aria-hidden>
            {LEVELS.map((band, index) => {
              const active = band === level
              const cy = 48 + index * 40
              const scale = active ? 1 + gain * 0.08 : 0.92
              return (
                <g key={band} transform={`translate(110 ${cy}) scale(${scale}) translate(-110 ${-cy})`}>
                  <path
                    data-blob={band}
                    data-hot={active ? "on" : "off"}
                    d={blobPath(index, amp === 0 ? 0 : sway, amp)}
                    fill={FILLS[band]}
                    opacity={active ? 0.4 + gain * 0.55 : 0.14 + gain * 0.08}
                    style={{ transition: reduced ? "none" : `opacity ${ease}ms linear` }}
                  />
                </g>
              )
            })}
          </svg>
          {LEVELS.map((band) => (
            <button
              key={band}
              type="button"
              aria-label={levelWord(band)}
              aria-pressed={band === level}
              data-band={band}
              onClick={() => commit(bandValue(band, max), "labeled")}
              className="absolute inset-x-0 h-1/3"
              style={{ top: band === "low" ? "0%" : band === "medium" ? "33.33%" : "66.66%" }}
            >
              <span className="sr-only">{levelWord(band)}</span>
            </button>
          ))}
        </div>
        <div className="flex w-24 flex-col justify-center">
          <motion.p className="text-4xl font-semibold leading-none text-foreground motion-reduce:transition-none">
            {shown.toFixed(1)}
          </motion.p>
          <p role="status" className="mt-2 text-sm tracking-wide text-muted-foreground">
            {levelWord(level)}
          </p>
        </div>
      </div>
      <input
        type="range"
        aria-label="应力"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={shown}
        aria-valuetext={`${shown.toFixed(1)} ${levelWord(level)}`}
        min={0}
        max={max}
        step={0.1}
        value={shown}
        onChange={(event) => commit(Number(event.target.value), "labeled")}
        onPointerDown={() => setPhase("adjusting")}
        onPointerUp={() => setPhase("labeled")}
        onKeyDown={onKeyDown}
        className="mt-3 w-full touch-none"
      />
    </div>
  )
}
