"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/tactile-button.tsx

import { useState, type ReactNode } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type Bulk = "sm" | "default" | "lg"
type Led = "blue" | "green" | "amber" | "red" | "slate"

const ledColor: Record<Led, string> = {
  blue: "var(--primary)",
  green: "var(--primary)",
  amber: "var(--accent)",
  red: "var(--destructive)",
  slate: "var(--muted-foreground)",
}

const bulkClass: Record<Bulk, { box: string; y: number; rotate: number }> = {
  sm: { box: "min-h-11 min-w-[130px] px-3.5 py-1.5 text-sm", y: -8, rotate: -7.5 },
  default: { box: "min-h-14 min-w-[176px] px-5 py-2 text-lg", y: -12, rotate: -8.5 },
  lg: { box: "min-h-[72px] min-w-[210px] px-7 py-3 text-2xl", y: -15, rotate: -8.8 },
}

export interface TactileRockerProps {
  children?: ReactNode
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  showIndicator?: boolean
  indicatorColor?: Led
  bulk?: Bulk
  fullWidth?: boolean
  className?: string
}

export function TactileRocker({
  children = "Get Started",
  pressed,
  defaultPressed = false,
  onPressedChange,
  showIndicator = true,
  indicatorColor = "blue",
  bulk = "default",
  fullWidth = false,
  className,
}: TactileRockerProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = useState(defaultPressed)
  const [holding, setHolding] = useState(false)
  const on = pressed ?? internal
  const down = on || holding
  const metrics = bulkClass[bulk]
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, bounce: 0.45, duration: 0.55 }

  const toggle = () => {
    const next = !on
    if (pressed === undefined) setInternal(next)
    onPressedChange?.(next)
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", fullWidth && "w-full", className)}>
      <motion.span
        aria-hidden="true"
        className="absolute inset-1 rounded-2xl bg-[var(--muted)]"
        animate={{
          boxShadow: down
            ? "inset 0 2px 4px color-mix(in srgb, var(--foreground) 35%, transparent)"
            : "inset 0 1px 2px color-mix(in srgb, var(--foreground) 20%, transparent)",
        }}
        transition={spring}
      />
      <motion.button
        type="button"
        aria-pressed={on}
        data-pressed={on ? "true" : "false"}
        onPointerDown={() => setHolding(true)}
        onPointerUp={() => setHolding(false)}
        onPointerCancel={() => setHolding(false)}
        onPointerLeave={() => setHolding(false)}
        onClick={toggle}
        className={cn(
          "relative z-10 flex items-center justify-center gap-3 rounded-2xl border border-[var(--background)] bg-[var(--card)] font-medium text-[var(--foreground)] shadow-md focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none motion-reduce:transform-none",
          metrics.box,
          fullWidth && "w-full",
        )}
        animate={{
          rotate: reduced ? 0 : down ? metrics.rotate : 0,
          y: reduced ? 0 : down ? metrics.y : 0,
          x: reduced ? 0 : down ? 3 : 0,
        }}
        transition={spring}
      >
        {showIndicator ? (
          <motion.span
            aria-hidden="true"
            className="size-3 rounded-full"
            animate={{ backgroundColor: down ? ledColor[indicatorColor] : "var(--muted)" }}
            transition={spring}
          />
        ) : null}
        <span>{children}</span>
      </motion.button>
    </div>
  )
}

export default TactileRocker
