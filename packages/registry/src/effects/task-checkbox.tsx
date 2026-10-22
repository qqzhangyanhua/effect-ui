"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，纸屑颜色改为 colors，减弱动效时立刻勾选、不爆开。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/task-checkbox/task-checkbox.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useCallback, useId, useState, type ReactNode } from "react"

export interface TaskCheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  colors?: string[]
  className?: string
}

const CHECK_PATH = "M5 12.5L10 17.5L19 7.5"
const SIZES = {
  sm: { gap: "gap-2.5", hit: "h-6 w-6", box: "h-4 w-4", boxPx: 16, label: "text-sm", description: "text-xs" },
  md: { gap: "gap-3", hit: "h-7 w-7", box: "h-5 w-5", boxPx: 20, label: "text-sm", description: "text-xs" },
  lg: { gap: "gap-3", hit: "h-8 w-8", box: "h-6 w-6", boxPx: 24, label: "text-base", description: "text-sm" },
} as const

export function TaskCheckbox({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  label,
  description,
  size = "md",
  disabled = false,
  colors = ["var(--muted-foreground)", "var(--primary)"],
  className,
}: TaskCheckboxProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const [burstKey, setBurstKey] = useState(0)
  const labelId = useId()
  const descriptionId = useId()
  const checked = checkedProp ?? internalChecked
  const sizes = SIZES[size]

  const toggle = useCallback(() => {
    if (disabled) return
    const next = !checked
    if (checkedProp === undefined) setInternalChecked(next)
    onCheckedChange?.(next)
    if (next && !prefersReducedMotion) setBurstKey((key) => key + 1)
  }, [checked, checkedProp, disabled, onCheckedChange, prefersReducedMotion])

  return (
    <div data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="task-checkbox" className={cn("flex select-none items-start", sizes.gap, disabled && "pointer-events-none opacity-50", className)}>
      <motion.button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={toggle}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
        className={cn("relative flex shrink-0 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", sizes.hit)}
      >
        <motion.span className={cn("relative flex items-center justify-center border bg-card", checked ? "border-foreground" : "border-border", sizes.box, "rounded-md")} animate={{ scale: checked && !prefersReducedMotion ? [1, 0.9, 1.05, 1] : 1 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.4 }}>
          <motion.span aria-hidden="true" className="absolute inset-0 rounded-md bg-foreground" initial={false} animate={{ scale: checked ? 1 : 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }} />
          <svg viewBox="0 0 24 24" className="relative h-full w-full p-[15%] text-background" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <motion.path d={CHECK_PATH} initial={false} animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: checked ? 0.2 : 0.1, delay: checked ? 0.06 : 0 }} />
          </svg>
          {burstKey > 0 && !prefersReducedMotion ? (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 6 }).map((_, index) => {
                const angle = (index / 6) * Math.PI * 2 - Math.PI / 2
                const distance = sizes.boxPx * (index % 2 === 0 ? 1.6 : 1.25)
                const color = colors[index % colors.length] ?? "var(--primary)"
                return (
                  <motion.span
                    key={`confetti-${burstKey}-${index}`}
                    className="absolute rounded-full"
                    style={{ width: 4, height: 4, backgroundColor: color }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, scale: [0, 1, 0.3], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    onAnimationComplete={index === 5 ? () => setBurstKey(0) : undefined}
                  />
                )
              })}
            </span>
          ) : null}
        </motion.span>
      </motion.button>
      <div onClick={toggle} className={cn("flex min-w-0 flex-col", !disabled && "cursor-pointer")}>
        <span id={labelId} className={cn("relative w-fit", checked ? "text-muted-foreground" : "text-foreground", sizes.label)}>
          {label}
          <motion.span aria-hidden="true" className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-muted-foreground" initial={false} animate={{ scaleX: checked ? 1 : 0 }} style={{ transformOrigin: checked ? "0% 50%" : "100% 50%" }} transition={prefersReducedMotion ? { duration: 0 } : { duration: checked ? 0.25 : 0.15 }} />
        </span>
        {description ? (
          <span id={descriptionId} className={cn("mt-0.5 text-muted-foreground", sizes.description)}>
            {description}
          </span>
        ) : null}
      </div>
    </div>
  )
}
