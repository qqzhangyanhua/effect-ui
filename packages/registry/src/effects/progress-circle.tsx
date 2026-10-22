"use client"

// Copyright 2025 Tremor
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: replaced tailwind-variants tv() with cva, and cx with cn.
// Ported from Tremor Raw（Apache-2.0，(c) 2025 Tremor）— https://github.com/tremorlabs/tremor/blob/main/src/components/ProgressCircle/ProgressCircle.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { cva } from "class-variance-authority"
import { type HTMLAttributes, type ReactNode } from "react"

export type ProgressCircleVariant = "default" | "neutral" | "warning" | "error" | "success"

const progressCircleVariants = cva("", {
  variants: {
    variant: {
      default: "",
      neutral: "",
      warning: "",
      error: "",
      success: "",
    },
    part: {
      background: "",
      circle: "",
    },
  },
  compoundVariants: [
    { variant: "default", part: "background", class: "stroke-primary/30" },
    { variant: "default", part: "circle", class: "stroke-primary" },
    { variant: "neutral", part: "background", class: "stroke-muted-foreground/30" },
    { variant: "neutral", part: "circle", class: "stroke-muted-foreground" },
    { variant: "warning", part: "background", class: "stroke-amber-500/30" },
    { variant: "warning", part: "circle", class: "stroke-amber-500" },
    { variant: "error", part: "background", class: "stroke-destructive/30" },
    { variant: "error", part: "circle", class: "stroke-destructive" },
    { variant: "success", part: "background", class: "stroke-emerald-500/30" },
    { variant: "success", part: "circle", class: "stroke-emerald-500" },
  ],
  defaultVariants: { variant: "default" },
})

export interface ProgressCircleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value?: number
  max?: number
  radius?: number
  strokeWidth?: number
  variant?: ProgressCircleVariant
  showAnimation?: boolean
  children?: ReactNode
}

export function ProgressCircle({
  value = 0,
  max = 100,
  radius = 32,
  strokeWidth = 6,
  variant = "default",
  showAnimation = true,
  className,
  children,
  ...props
}: ProgressCircleProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const safeMax = max > 0 ? max : 1
  const safeValue = Math.min(safeMax, Math.max(value, 0))
  const normalizedRadius = Math.max(radius - strokeWidth / 2, 0)
  const circumference = normalizedRadius * 2 * Math.PI
  const offset = circumference - (safeValue / safeMax) * circumference
  const motion = showAnimation && !prefersReducedMotion

  return (
    <div
      {...props}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      className={cn("relative inline-flex", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="progress-circle"
      role="progressbar"
    >
      <svg className="-rotate-90" height={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`} width={radius * 2}>
        <circle
          className={cn("fill-transparent", progressCircleVariants({ variant, part: "background" }))}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn(
            "fill-transparent",
            progressCircleVariants({ variant, part: "circle" }),
            motion && "transition-[stroke-dashoffset] duration-300 ease-in-out",
          )}
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm">{children}</div>
    </div>
  )
}
