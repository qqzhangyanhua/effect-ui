"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SpringCheckProps
  extends Omit<
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    "checked" | "defaultChecked" | "onCheckedChange" | "color"
  > {
  checked?: boolean | "indeterminate"
  defaultChecked?: boolean | "indeterminate"
  onCheckedChange?: (checked: boolean | "indeterminate") => void
  indeterminate?: boolean
  strokeWidth?: number
  color?: string
  duration?: number
  intensity?: number
}

function SpringCheck({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  indeterminate = false,
  disabled,
  strokeWidth = 2,
  color,
  duration = 0.45,
  intensity,
  ref,
  ...props
}: SpringCheckProps) {
  const reduced = usePrefersReducedMotion()
  const [uncontrolled, setUncontrolled] = React.useState<boolean | "indeterminate">(defaultChecked)
  const visual: boolean | "indeterminate" = indeterminate
    ? "indeterminate"
    : checked !== undefined
      ? checked
      : uncontrolled

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="spring-check"
      checked={visual}
      disabled={disabled}
      onCheckedChange={(next) => {
        if (!indeterminate && checked === undefined) setUncontrolled(next)
        onCheckedChange?.(next)
      }}
      className={cn(
        "peer grid size-4 shrink-0 place-items-center rounded-[4px] border border-input text-primary-foreground shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        color
          ? "data-[state=checked]:border-(--spring-check) data-[state=checked]:bg-(--spring-check) data-[state=indeterminate]:border-(--spring-check) data-[state=indeterminate]:bg-(--spring-check)"
          : "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary",
        className,
      )}
      style={color ? ({ "--spring-check": color } as React.CSSProperties) : undefined}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="grid place-items-center text-current">
        <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden>
          {visual === "indeterminate" ? (
            <line
              x1="6"
              y1="12"
              x2="18"
              y2="12"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ) : (
            <motion.path
              d="M5 12.5 10 17.5 19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      duration,
                      bounce: intensity === undefined || intensity === 0.3 ? 0.3 : intensity,
                    }
              }
            />
          )}
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { SpringCheck }
