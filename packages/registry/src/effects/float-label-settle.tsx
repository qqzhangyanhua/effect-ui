"use client"

import { useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Google, Disney+, PayPal, and Intercom (via Mobbin), original implementation.
 * https://mobbin.com/screens/b6cf69c6-5e40-4837-9257-b45710f822f0
 * https://mobbin.com/screens/3e16b612-738e-4c1a-9c4e-8d8dc3349e86
 * https://mobbin.com/screens/6769fb7b-5de2-4110-ae7e-8706083a7bee
 * https://mobbin.com/screens/014839ef-9b9e-46f1-88d0-3fa55adc9cb7
 */

export interface FloatLabelSettleProps {
  pace?: number
  intensity?: number
  style?: SettleStyle
  rest?: RestPlace
  className?: string
  onValueChange?: (state: { phase: "empty" | "filled"; raised: boolean }) => void
}

export type SettleStyle = "float" | "slide"
export type RestPlace = "above" | "aside"

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function settleMs(pace: number) {
  return Math.round(clamp(280 / paceRate(pace), 160, 460))
}

export function settleShift(raised: boolean, style: SettleStyle, rest: RestPlace, intensity: number) {
  const amp = clamp(intensity, 0, 1)
  if (!raised) return { x: style === "slide" ? 0 : 14, y: 30, scale: 1 }
  if (rest === "aside") return { x: 10, y: 30, scale: 0.82 }
  return { x: 12, y: Math.round(12 - amp * 8), scale: 0.78 }
}

export function FloatLabelSettle({
  pace = 1,
  intensity = 0.45,
  style = "float",
  rest = "above",
  className,
  onValueChange,
}: FloatLabelSettleProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const onValueRef = useRef(onValueChange)
  const labelId = useId()
  const fieldId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const raised = focused || value.trim().length > 0
  const phase = value.trim().length > 0 ? "filled" : "empty"
  const shift = settleShift(raised, style, rest, intensity)
  const motionOff = reduced || !live

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ phase, raised })
  }, [phase, raised])

  return (
    <div
      ref={rootRef}
      data-slot="float-label-settle"
      data-ritual="label-settle"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-rest={rest}
      data-raised={raised ? "on" : "off"}
      data-phase={phase}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-16">
        <motion.label
          id={labelId}
          htmlFor={fieldId}
          initial={false}
          animate={{ x: shift.x, y: shift.y, scale: shift.scale }}
          transition={{ duration: motionOff ? 0 : settleMs(pace) / 1000, ease: "easeOut" }}
          style={{ pointerEvents: raised ? "auto" : "none" }}
          className={cn(
            "absolute top-0 left-0 z-20 w-max origin-top-left text-sm motion-reduce:transition-none",
            raised ? "pointer-events-auto bg-card px-1 text-foreground" : "pointer-events-none text-muted-foreground",
          )}
        >
          Workspace
        </motion.label>
        <input
          ref={fieldRef}
          id={fieldId}
          aria-labelledby={labelId}
          value={value}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            focusRing,
            "absolute inset-x-0 bottom-0 h-11 rounded-xl border border-border bg-background pr-3 text-sm text-foreground",
            raised && rest === "aside" ? "pl-28" : "pl-3",
          )}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{phase === "filled" ? "Filled" : "Empty"}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setValue("North studio")
            fieldRef.current?.focus()
          }}
          className={cn("rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground", focusRing)}
        >
          Sample
        </button>
        <button
          type="button"
          onClick={() => {
            setValue("")
            fieldRef.current?.blur()
          }}
          className={cn("rounded-full border border-border px-3 py-2 text-sm", focusRing)}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
