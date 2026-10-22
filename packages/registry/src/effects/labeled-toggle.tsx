"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/toggle/LabeledToggle.tsx

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"

export interface LabeledToggleProps {
  checked?: boolean
  initialToggleOn?: boolean
  onCheckedChange?: (checked: boolean) => void
  onToggle?: (toggled: boolean) => void
  disableText?: boolean
  className?: string
}

export function LabeledToggle({
  checked,
  initialToggleOn = true,
  onCheckedChange,
  onToggle,
  disableText = false,
  className,
}: LabeledToggleProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: initialToggleOn,
    onChange: (next) => {
      onToggle?.(next)
      onCheckedChange?.(next)
    },
  })

  return (
    <button
      aria-checked={on}
      className={cn(
        "relative h-7 w-12 rounded-full outline-offset-2",
        on ? "bg-primary" : "bg-muted",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="labeled-toggle"
      onClick={() => setOn(!on)}
      role="switch"
      type="button"
    >
      <motion.span
        animate={{ x: on ? 18 : 2, scale: on ? 0.86 : 0.72, opacity: on ? 1 : 0.85 }}
        className="absolute top-1 left-0 size-5 rounded-full bg-white shadow"
        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
      />
      {disableText ? null : (
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 flex items-center text-[10px] font-semibold",
            on ? "left-1.5 text-primary-foreground" : "right-1.5 text-muted-foreground",
          )}
        >
          {on ? "ON" : "OFF"}
        </span>
      )}
    </button>
  )
}
