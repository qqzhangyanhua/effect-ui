"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface StemFaderMixProps {
  pace?: number
  intensity?: number
  count?: number
  link?: boolean
  className?: string
  onValuesChange?: (values: number[]) => void
}

export const STEM_LABELS = ["Lead", "Knock", "Low", "Air", "Room"] as const
const STEM_START = [0.72, 0.48, 0.84, 0.6, 0.55] as const
const TRACK = 160

interface Box {
  top: number
  height: number
}

type StemPhase = "idle" | "adjusting" | "mixed"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function q01(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function stemCount(count: number) {
  const rounded = Math.round(count)
  if (!Number.isFinite(rounded) || rounded <= 3) return 3
  if (rounded >= 5) return 5
  return 4
}

export function stemDefaults(count: number): number[] {
  return STEM_START.slice(0, stemCount(count)).map((value) => value)
}

export function stemLevel(values: readonly number[]) {
  if (values.length === 0) return 0
  const sum = values.reduce((total, value) => total + value, 0)
  return Math.round((sum / values.length) * 100) / 100
}

export function applyStem(values: readonly number[], index: number, next: number, link: boolean) {
  const target = q01(next)
  const safe = clamp(Math.round(index), 0, Math.max(0, values.length - 1))
  if (!link) return values.map((value, i) => (i === safe ? target : q01(value)))
  const sum = values.reduce((total, value) => total + value, 0)
  const others = sum - (values[safe] ?? 0)
  const rest = Math.max(0, sum - target)
  if (others <= 0.001) return values.map((value, i) => (i === safe ? target : q01(value)))
  const scale = rest / others
  return values.map((value, i) => (i === safe ? target : q01(value * scale)))
}

export function stemFromPointer(clientY: number, rect: Box) {
  const height = rect.height > 0 ? rect.height : TRACK
  const top = rect.height > 0 ? rect.top : 0
  return q01(1 - (clientY - top) / height)
}

function bars(level: number, shift: number) {
  return Array.from({ length: 16 }, (_, index) => {
    const shape = 0.35 + 0.65 * Math.abs(Math.sin(index * 0.65 + shift))
    return Math.max(8, Math.round(level * shape * 100))
  })
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function StemFaderMix({
  pace = 1,
  intensity = 0.7,
  count = 4,
  link = false,
  className,
  onValuesChange,
}: StemFaderMixProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef<number | null>(null)
  const valuesRef = useRef(stemDefaults(count))
  const onValuesRef = useRef(onValuesChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const linkRef = useRef(link)
  const rateRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const shown = stemCount(count)
  const ease = reduced ? 0 : Math.round(160 / rate)
  const [countKey, setCountKey] = useState(shown)
  const [values, setValues] = useState(() => stemDefaults(shown))
  const [active, setActive] = useState(0)
  const [adjust, setAdjust] = useState("none")
  const [phase, setPhase] = useState<StemPhase>("idle")
  const [shift, setShift] = useState(0)
  if (countKey !== shown) {
    const next = stemDefaults(shown)
    setCountKey(shown)
    setValues(next)
    setActive(0)
  }
  const level = stemLevel(values)
  const columns = STEM_LABELS.slice(0, values.length)
  const activeIndex = Math.min(active, Math.max(0, values.length - 1))

  useEffect(() => {
    valuesRef.current = values
    onValuesRef.current = onValuesChange
    liveRef.current = live
    reducedRef.current = reduced
    linkRef.current = link
    rateRef.current = rate
  }, [values, onValuesChange, live, reduced, link, rate])

  function commit(next: number[], nextPhase: StemPhase, name: string) {
    const rounded = next.map((value) => q01(value))
    valuesRef.current = rounded
    setValues(rounded)
    setPhase(nextPhase)
    setAdjust(name)
    onValuesRef.current?.(rounded)
  }

  useEffect(() => {
    if (reduced || !live) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        frame.current = 0
        return
      }
      setShift((value) => value + 0.18 * rateRef.current)
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live])

  function write(index: number, next: number, nextPhase: StemPhase) {
    const label = columns[index] ?? "Lead"
    commit(applyStem(valuesRef.current, index, next, linkRef.current), nextPhase, nextPhase === "adjusting" ? label : "none")
  }

  function onPointerDown(index: number) {
    return (event: PointerEvent<HTMLDivElement>) => {
      if (event.button !== undefined && event.button !== 0) return
      dragRef.current = index
      setActive(index)
      const rect = event.currentTarget.getBoundingClientRect()
      write(index, stemFromPointer(event.clientY, rect), reducedRef.current ? "idle" : "adjusting")
      capture(event)
    }
  }

  function onPointerMove(index: number) {
    return (event: PointerEvent<HTMLDivElement>) => {
      if (dragRef.current !== index) return
      const rect = event.currentTarget.getBoundingClientRect()
      write(index, stemFromPointer(event.clientY, rect), reducedRef.current ? "idle" : "adjusting")
    }
  }

  function onPointerUp(index: number) {
    return (event: PointerEvent<HTMLDivElement>) => {
      if (dragRef.current !== index) return
      dragRef.current = null
      const rect = event.currentTarget.getBoundingClientRect()
      write(index, stemFromPointer(event.clientY, rect), reducedRef.current ? "idle" : "mixed")
    }
  }

  function onKeyDown(index: number) {
    return (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
      event.preventDefault()
      const direction = event.key === "ArrowUp" ? 0.05 : -0.05
      const current = valuesRef.current[index] ?? 0
      write(index, current + direction, reducedRef.current ? "idle" : "mixed")
    }
  }

  function reset() {
    dragRef.current = null
    commit(columns.map(() => 1), reduced ? "idle" : "mixed", "none")
  }

  const wave = bars(level, reduced ? 0 : shift)

  return (
    <div
      ref={ref}
      data-slot="stem-fader-mix"
      data-ritual="stem-mix"
      data-pace={rate}
      data-intensity={gain}
      data-count={columns.length}
      data-link={link ? "on" : "off"}
      data-values={values.map((value) => value.toFixed(2)).join(",")}
      data-level={level.toFixed(2)}
      data-active={columns[activeIndex] ?? "Lead"}
      data-adjust={adjust}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Mix</p>
        <p role="status" className="text-sm font-semibold text-foreground">
          Level {Math.round(level * 100)}
        </p>
      </div>
      <div data-part="wave" className="flex h-14 items-end gap-1 rounded-2xl bg-muted/50 px-2 py-2" aria-hidden>
        {wave.map((height, index) => (
          <motion.span
            key={index}
            data-bar
            className="flex-1 rounded-full bg-chart-2 motion-reduce:transition-none"
            style={{
              height: `${height}%`,
              opacity: 0.35 + gain * 0.65,
              transition: reduced ? "none" : `height ${ease}ms linear`,
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {columns.map((label, index) => {
          const value = values[index] ?? 0
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{Math.round(value * 100)}</span>
              <div
                role="slider"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(value * 100)}
                aria-valuetext={`${label} ${Math.round(value * 100)}`}
                tabIndex={0}
                data-stem={label}
                onFocus={() => setActive(index)}
                onKeyDown={onKeyDown(index)}
                onPointerDown={onPointerDown(index)}
                onPointerMove={onPointerMove(index)}
                onPointerUp={onPointerUp(index)}
                onPointerCancel={onPointerUp(index)}
                className={cn(
                  "relative h-40 w-full touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeIndex === index && "ring-2 ring-ring",
                )}
              >
                {[0.25, 0.5, 0.75].map((notch) => (
                  <span
                    key={notch}
                    data-notch
                    className="absolute inset-x-2 h-px bg-border"
                    style={{ bottom: `${notch * 100}%` }}
                  />
                ))}
                <span
                  data-fill
                  className="absolute inset-x-2 bottom-1 rounded-full bg-foreground"
                  style={{ height: `${value * 100}%`, opacity: 0.45 + gain * 0.55 }}
                />
                <span
                  data-thumb
                  className="absolute left-1/2 h-2 w-5 -translate-x-1/2 rounded-sm border border-border bg-background"
                  style={{ bottom: `calc(${value * 100}% - 4px)` }}
                />
              </div>
              <span className="text-xs text-foreground">{label}</span>
            </div>
          )
        })}
      </div>
      <button type="button" onClick={reset} className="mt-3 rounded-full border border-border px-3 py-1.5 text-sm text-foreground">
        Reset
      </button>
    </div>
  )
}
