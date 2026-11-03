"use client"

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Coinbase, Vercel, Melio, and Family (via Mobbin), original implementation.
 * https://mobbin.com/screens/cfdf8235-6a71-4857-ac58-5dace902f6d3
 * https://mobbin.com/screens/ee4aff22-a01f-44eb-bb6b-157eab9ed677
 * https://mobbin.com/screens/b542daad-cc71-4d22-8622-ffe080d82e31
 * https://mobbin.com/screens/588df407-0e4e-4f4a-91e8-2d75bcb3f572
 */

export interface OtpCellCascadeProps {
  pace?: number
  intensity?: number
  cells?: number
  style?: CellStyle
  className?: string
  onValueChange?: (state: { filled: number; verdict: OtpVerdict }) => void
}

export type CellStyle = "box" | "underline"
export type OtpVerdict = "pending" | "match" | "miss"

interface Cascade {
  from: number
  to: number
  progress: number
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const EMPTY: string[] = ["", "", "", "", "", ""]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function cellCount(cells: number): 4 | 6 {
  if (!Number.isFinite(cells)) return 6
  return cells < 5 ? 4 : 6
}

export function cascadeStep(pace: number) {
  const frames = clamp(16 / paceRate(pace), 8, 24)
  return Math.round((1 / frames) * 1000) / 1000
}

export function otpSample(cells: number) {
  return cellCount(cells) === 4 ? "2468" : "246810"
}

export function otpVerdict(code: string, sample: string): OtpVerdict {
  if (code.length < sample.length) return "pending"
  return code === sample ? "match" : "miss"
}

export function writeDigits(current: readonly string[], index: number, incoming: string, count: number) {
  const next = Array.from({ length: Math.max(current.length, count, 6) }, (_, slot) => current[slot] ?? "")
  const clean = incoming.replace(/\D/g, "")
  let cursor = Math.min(Math.max(index, 0), Math.max(count - 1, 0))
  for (const digit of clean) {
    if (cursor >= count) break
    next[cursor] = digit
    cursor += 1
  }
  const focus = clean.length === 0 ? index : Math.min(cursor, count - 1)
  return { slots: next, focus, steps: clean.length === 0 ? 0 : cursor - index }
}

export function beadShift(from: number, to: number, progress: number) {
  return from + (to - from) * clamp(progress, 0, 1)
}

function Mark({ kind }: { kind: "hollow" | "alert" | "check" }) {
  if (kind === "check") {
    return (
      <svg data-icon="check" viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M5 10.2 l3 3 7-7.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    )
  }
  if (kind === "alert") {
    return (
      <svg data-icon="alert" viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 5.6 v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="10" cy="14" r="0.9" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg data-icon="hollow" viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  )
}

export function OtpCellCascade({
  pace = 1,
  intensity = 0.4,
  cells = 6,
  style = "box",
  className,
  onValueChange,
}: OtpCellCascadeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Array<HTMLInputElement | null>>([])
  const raf = useRef(0)
  const gen = useRef(0)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const count = cellCount(cells)
  const sample = otpSample(count)
  const [slots, setSlots] = useState<string[]>(EMPTY)
  const [active, setActive] = useState(0)
  const [cascade, setCascade] = useState<Cascade | null>(null)
  const [completeTick, setCompleteTick] = useState(0)
  const visible = Array.from({ length: count }, (_, index) => slots[index] ?? "")
  const code = visible.join("")
  const filled = visible.every((slot) => slot !== "")
  const verdict = otpVerdict(code, sample)

  if ((!live || reduced) && cascade) setCascade(null)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  const filledCount = code.length

  useEffect(() => {
    onValueRef.current?.({ filled: filledCount, verdict })
  }, [filledCount, verdict])

  useEffect(() => {
    return () => {
      gen.current += 1
      cancelAnimationFrame(raf.current)
    }
  }, [])

  useEffect(() => {
    if (live && !reduced) return
    gen.current += 1
    cancelAnimationFrame(raf.current)
  }, [live, reduced])

  function focusCell(index: number) {
    cellRefs.current[index]?.focus()
    setActive(index)
  }

  function playCascade(from: number, to: number) {
    gen.current += 1
    cancelAnimationFrame(raf.current)
    if (!live || reduced || to === from) return
    const token = gen.current
    const step = cascadeStep(pace)
    let progress = 0
    setCascade({ from, to, progress: 0 })
    const tick = () => {
      if (token !== gen.current) return
      progress = Math.min(1, Math.round((progress + step) * 1000) / 1000)
      if (progress >= 1) {
        setCascade(null)
        return
      }
      setCascade({ from, to, progress })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function commit(index: number, incoming: string) {
    const result = writeDigits(slots, index, incoming, count)
    setSlots(result.slots)
    const nextVisible = result.slots.slice(0, count)
    if (nextVisible.every((slot) => slot !== "")) setCompleteTick((tick) => tick + 1)
    if (result.steps === 1 && result.focus === index + 1) playCascade(index, result.focus)
    if (result.focus !== index) focusCell(result.focus)
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
    const text = event.clipboardData.getData("text")
    if (!text) return
    event.preventDefault()
    commit(index, text)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault()
      focusCell(index - 1)
      return
    }
    if (event.key === "ArrowRight" && index < count - 1) {
      event.preventDefault()
      focusCell(index + 1)
      return
    }
    if (event.key !== "Backspace") return
    event.preventDefault()
    const next = slots.slice()
    if (visible[index]) {
      next[index] = ""
      setSlots(next)
      return
    }
    if (index === 0) return
    next[index - 1] = ""
    setSlots(next)
    focusCell(index - 1)
  }

  const bead = cascade && live && !reduced ? beadShift(cascade.from, cascade.to, cascade.progress) : null
  const copy = verdict === "match" ? "Code matches." : verdict === "miss" ? "That code does not match the sample." : "Enter every cell."
  const mark = verdict === "match" ? "check" : verdict === "miss" ? "alert" : "hollow"

  return (
    <div
      ref={rootRef}
      data-slot="otp-cell-cascade"
      data-ritual="cell-cascade"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-cells={count}
      data-cascade={bead === null ? "off" : "on"}
      data-complete={filled ? "on" : "off"}
      data-verdict={verdict}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">Verification code</p>
      <p className="mt-1 text-sm text-muted-foreground">Sample {sample}</p>
      <div role="group" aria-label="Verification code" className="relative mt-3">
        <div className="flex gap-2">
          {visible.map((slot, index) => (
            <input
              key={`cell-${index}`}
              ref={(node) => {
                cellRefs.current[index] = node
              }}
              value={slot}
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${index + 1} of ${count}`}
              aria-invalid={verdict === "miss"}
              aria-current={active === index ? "true" : undefined}
              maxLength={1}
              onFocus={() => setActive(index)}
              onChange={(event) => {
                const digit = event.target.value.replace(/\D/g, "").slice(-1)
                if (!digit) return
                commit(index, digit)
              }}
              onKeyDown={(event) => onKeyDown(event, index)}
              onPaste={(event) => onPaste(event, index)}
              style={{ width: "2.5rem" }}
              className={cn(
                focusRing,
                "h-12 bg-background text-center text-base text-foreground",
                style === "underline" ? "border-b-2 border-border" : "rounded-lg border border-border",
                active === index && "border-primary",
              )}
            />
          ))}
        </div>
        {bead !== null ? (
          <motion.span
            data-bead=""
            aria-hidden="true"
            style={{
              pointerEvents: "none",
              left: `calc(${bead} * (2.5rem + 0.5rem) + 1.25rem)`,
              opacity: 0.25 + clamp(intensity, 0, 1) * 0.55,
            }}
            className="pointer-events-none absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary motion-reduce:transition-none"
          />
        ) : null}
        {filled ? (
          <span
            aria-hidden="true"
            data-complete-frame=""
            style={{ pointerEvents: "none" }}
            className="pointer-events-none absolute inset-0 rounded-lg border border-primary"
          />
        ) : null}
        {filled && live && !reduced ? (
          <motion.span
            key={completeTick}
            aria-hidden="true"
            data-complete-flare=""
            initial={{ opacity: 0.65 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.36 / paceRate(pace) }}
            style={{ pointerEvents: "none" }}
            className="pointer-events-none absolute -inset-1 rounded-xl border border-primary motion-reduce:transition-none"
          />
        ) : null}
      </div>
      <p role={verdict === "miss" ? "alert" : "status"} className="mt-3 flex items-start gap-2 text-sm">
        <span className={verdict === "miss" ? "text-destructive" : verdict === "match" ? "text-primary" : "text-muted-foreground"}>
          <Mark kind={mark} />
        </span>
        <span className={verdict === "miss" ? "text-destructive" : "text-foreground"}>{copy}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => commit(0, sample)} className={cn("rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground", focusRing)}>
          Fill sample
        </button>
        <button
          type="button"
          onClick={() => commit(0, count === 4 ? "0000" : "000000")}
          className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}
        >
          Fill other
        </button>
        <button
          type="button"
          onClick={() => {
            gen.current += 1
            cancelAnimationFrame(raf.current)
            setSlots(EMPTY)
            focusCell(0)
          }}
          className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
