"use client"

import { useEffect, useRef, useState, type ChangeEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface StrengthSegmentFillProps {
  pace?: number
  intensity?: number
  segments?: number
  rules?: number
  className?: string
  onScoreChange?: (score: number) => void
}

const RULES = [
  { id: "length", label: "长度", test: (value: string) => value.length >= 8 },
  { id: "case", label: "大小写", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "digit", label: "数字", test: (value: string) => /\d/.test(value) },
  { id: "symbol", label: "符号", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const

const PRESETS = [
  { label: "Weak", value: "abcdefgh" },
  { label: "Medium", value: "Abcdefg1" },
  { label: "Strong", value: "Abcdefg1!" },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function segmentCount(segments: number) {
  return clamp(Math.round(segments), 3, 4)
}

function ruleCount(rules: number) {
  return clamp(Math.round(rules), 2, 4)
}

export function strengthScore(value: string, rules: number) {
  const visible = RULES.slice(0, ruleCount(rules))
  const met = visible.filter((rule) => rule.test(value)).length
  return { met, total: visible.length }
}

export function strengthFill(met: number, total: number, segments: number) {
  const bars = segmentCount(segments)
  if (met <= 0 || total <= 0) return { tone: "none" as const, filled: 0, bars }
  const ratio = met / total
  const tone = ratio <= 0.34 ? "weak" : ratio <= 0.75 ? "mid" : "strong"
  const filled = Math.min(bars, Math.max(1, Math.round(ratio * bars)))
  return { tone: tone as "weak" | "mid" | "strong", filled, bars }
}

const toneClass = {
  none: "bg-muted",
  weak: "bg-destructive",
  mid: "bg-chart-4",
  strong: "bg-chart-2",
} as const

export function StrengthSegmentFill({
  pace = 1,
  intensity = 0.65,
  segments = 4,
  rules = 4,
  className,
  onScoreChange,
}: StrengthSegmentFillProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const onScoreRef = useRef(onScoreChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const bars = segmentCount(segments)
  const totalRules = ruleCount(rules)
  const ease = reduced ? 0 : Math.round(220 / rate)
  const [value, setValue] = useState("")
  const [phase, setPhase] = useState<"idle" | "updating">("idle")
  const visible = RULES.slice(0, totalRules)
  const met = visible.filter((rule) => rule.test(value)).length
  const fill = strengthFill(met, visible.length, bars)
  const height = Math.round(10 + gain * 14)

  useEffect(() => {
    onScoreRef.current = onScoreChange
  }, [onScoreChange])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "updating" ? "idle" : current))
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function commit(next: string) {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    setValue(next)
    const score = strengthScore(next, totalRules).met
    onScoreRef.current?.(score)
    if (reduced || !liveRef.current) {
      setPhase("idle")
      return
    }
    setPhase("updating")
    frame.current = window.requestAnimationFrame(() => {
      frame.current = 0
      setPhase("idle")
    })
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    commit(event.target.value)
  }

  return (
    <div
      ref={ref}
      data-slot="strength-segment-fill"
      data-ritual="segment-strength"
      data-pace={rate}
      data-intensity={gain}
      data-segments={bars}
      data-rules={totalRules}
      data-score={met}
      data-filled={fill.filled}
      data-tone={fill.tone}
      data-value={value}
      data-ease={ease}
      data-state={phase}
      data-morph={reduced ? "off" : "on"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <label className="block text-sm font-medium text-foreground">
        Passphrase
        <input
          type="text"
          aria-label="Passphrase"
          autoComplete="off"
          value={value}
          onChange={onChange}
          className="mt-2 w-full rounded-2xl border border-border bg-background px-3 py-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: bars }, (_, index) => {
          const on = index < fill.filled
          return (
            <span
              key={index}
              data-segment={index}
              data-on={on ? "yes" : "no"}
              className={cn(
                "flex-1 rounded-full transition-colors motion-reduce:transition-none",
                on ? toneClass[fill.tone] : "bg-muted",
              )}
              style={{ height, transitionDuration: `${ease}ms` }}
            />
          )
        })}
      </div>
      <ul className="mt-3 space-y-1 text-sm">
        {visible.map((rule) => {
          const passed = rule.test(value)
          return (
            <li key={rule.id} data-rule={rule.id} data-met={passed ? "yes" : "no"} className="flex items-center gap-2">
              <span
                data-icon={passed ? "check" : "cross"}
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full text-xs transition-transform motion-reduce:transition-none",
                  passed ? "bg-chart-2 text-background" : "bg-muted text-muted-foreground",
                )}
                style={{ transitionDuration: `${ease}ms` }}
              >
                {passed ? "✓" : "×"}
              </span>
              <span>{rule.label}</span>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => commit(preset.value)}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
