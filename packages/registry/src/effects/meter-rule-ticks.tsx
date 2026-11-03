"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Uvodo, Etsy, Calendly, and Upwork (via Mobbin), original implementation.
 * https://mobbin.com/screens/b4e5d7e5-a39f-4196-b41e-f859d737d3ab
 * https://mobbin.com/screens/1fca974a-bcca-4df7-8749-ae8fae282cf9
 * https://mobbin.com/screens/a9e0b1c0-e3f6-4533-a168-3e6a2b04b892
 * https://mobbin.com/screens/cf5dee34-134e-4f43-9a41-5d64a458d21a
 */

export interface MeterRuleTicksProps {
  pace?: number
  intensity?: number
  style?: MeterStyle
  rules?: number
  className?: string
  onValueChange?: (state: { band: StrengthBand; met: number }) => void
}

export type MeterStyle = "bar" | "segments"
export type StrengthBand = "empty" | "weak" | "fair" | "strong"
type SampleKind = "empty" | "weak" | "fair" | "strong"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "digit", label: "One number", test: (value: string) => /\d/.test(value) },
  { id: "case", label: "Upper and lower case", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "symbol", label: "One symbol", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function ruleWindow(rules: number) {
  if (!Number.isFinite(rules)) return 4
  return rules < 3.5 ? 3 : 4
}

export function bandOf(met: number, total: number): StrengthBand {
  if (total <= 0 || met <= 0) return "empty"
  const ratio = met / total
  if (ratio < 0.5) return "weak"
  if (ratio < 1) return "fair"
  return "strong"
}

export function bandLabel(band: StrengthBand) {
  if (band === "weak") return "Weak"
  if (band === "fair") return "Fair"
  if (band === "strong") return "Strong"
  return "Empty"
}

export function sampleFor(kind: SampleKind, rules: number) {
  const total = ruleWindow(rules)
  if (kind === "empty") return ""
  if (kind === "weak") return "abcdefgh"
  if (kind === "strong") return total < 4 ? "Abcdefg1" : "Abcdefg1!"
  return total < 4 ? "abcdefg1" : "Abcdefg1"
}

export function meterMs(pace: number) {
  return Math.round(clamp(260 / paceRate(pace), 140, 420))
}

function Tick({ met }: { met: boolean }) {
  if (met) {
    return (
      <svg data-icon="check" viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
        <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 8.2 l2.4 2.4 5.2-5.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg data-icon="box" viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true">
      <rect x="1.5" y="1.5" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
    </svg>
  )
}

export function MeterRuleTicks({
  pace = 1,
  intensity = 0.4,
  style = "bar",
  rules = 4,
  className,
  onValueChange,
}: MeterRuleTicksProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const onValueRef = useRef(onValueChange)
  const fieldId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [value, setValue] = useState("")
  const [shown, setShown] = useState(false)
  const total = ruleWindow(rules)
  const visible = RULES.slice(0, total).map((rule) => ({ ...rule, met: rule.test(value) }))
  const met = visible.filter((rule) => rule.met).length
  const band = bandOf(met, total)
  const motionOff = reduced || !live
  const tone =
    band === "weak" ? "text-destructive" : band === "strong" ? "text-primary" : band === "fair" ? "text-foreground" : "text-muted-foreground"

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ band, met })
  }, [band, met])

  return (
    <div
      ref={rootRef}
      data-slot="meter-rule-ticks"
      data-ritual="rule-ticks"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-rules={total}
      data-band={band}
      data-met={met}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          Passphrase
        </label>
        <p data-band-copy="" className={cn("text-sm font-medium", tone)}>
          Strength: {bandLabel(band)}
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          ref={fieldRef}
          id={fieldId}
          type={shown ? "text" : "password"}
          value={value}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          className={cn(focusRing, "w-full rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground")}
        />
        <button
          type="button"
          aria-pressed={shown}
          onClick={() => setShown((current) => !current)}
          className={cn("shrink-0 rounded-full border border-border px-3 py-2 text-sm", focusRing)}
        >
          {shown ? "Hide passphrase" : "Show passphrase"}
        </button>
      </div>
      <div
        data-meter=""
        aria-hidden="true"
        style={{ pointerEvents: "none", opacity: 0.45 + clamp(intensity, 0, 1) * 0.55 }}
        className={cn("pointer-events-none relative mt-3 h-6", tone)}
      >
        {style === "bar" ? (
          <div className="absolute top-3 right-0 left-0 h-1 rounded-full bg-muted">
            <motion.span
              initial={false}
              animate={{ width: `${(met / total) * 100}%` }}
              transition={{ duration: motionOff ? 0 : meterMs(pace) / 1000, ease: "easeOut" }}
              style={{ pointerEvents: "none" }}
              className="pointer-events-none block h-full rounded-full bg-current motion-reduce:transition-none"
            />
          </div>
        ) : (
          <div className="flex h-full items-end gap-2">
            {visible.map((rule) => (
              <span
                key={rule.id}
                data-meter-tick={rule.met ? "on" : "off"}
                className={cn("w-1 rounded-full", rule.met ? "h-5 bg-current" : "h-3 border border-dashed border-current bg-transparent")}
              />
            ))}
          </div>
        )}
      </div>
      <ul className="mt-3 space-y-1.5">
        {visible.map((rule) => (
          <li key={rule.id} data-rule={rule.id} data-met={rule.met ? "on" : "off"} className="flex items-center gap-2 text-sm">
            <span className={rule.met ? "text-primary" : "text-muted-foreground"}>
              <Tick met={rule.met} />
            </span>
            <span className="text-foreground">{rule.label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["empty", "weak", "fair", "strong"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => {
              setValue(sampleFor(kind, total))
              fieldRef.current?.focus()
            }}
            className={cn(
              "rounded-full px-3 py-2 text-sm",
              focusRing,
              kind === "strong" ? "bg-primary font-medium text-primary-foreground" : "border border-border",
            )}
          >
            {bandLabel(kind)}
          </button>
        ))}
      </div>
    </div>
  )
}
