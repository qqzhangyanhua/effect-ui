"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/squiggle-arrow.tsx. Modified for effect-ui.

import { useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const paths = {
  wavy: {
    body: "M 15 50 Q 35 35, 55 48 T 95 52 Q 115 48, 135 50 Q 145 52, 155 48",
    head: "M 155 48 Q 147 44, 143 42 M 155 48 Q 148 53, 144 56",
  },
  bouncy: {
    body: "M 15 50 Q 45 32, 65 50 Q 85 68, 105 50 Q 125 32, 145 50 Q 152 54, 158 50",
    head: "M 158 50 Q 149 45, 145 43 M 158 50 Q 150 56, 146 59",
  },
  smooth: {
    body: "M 15 50 Q 60 38, 100 48 Q 135 56, 158 50",
    head: "M 158 50 Q 149 45, 145 43 M 158 50 Q 150 56, 146 59",
  },
} as const

const rotations = {
  right: "rotate(0)",
  left: "rotate(180 100 50)",
  down: "rotate(90 100 50)",
  up: "rotate(-90 100 50)",
} as const

export interface SquiggleArrowProps {
  width?: number
  height?: number
  strokeWidth?: number
  className?: string
  direction?: "right" | "left" | "up" | "down"
  variant?: "wavy" | "bouncy" | "smooth"
  label?: string
}

export function SquiggleArrow({
  width = 200,
  height = 100,
  strokeWidth = 2.5,
  className,
  direction = "right",
  variant = "wavy",
  label = "波浪箭头",
}: SquiggleArrowProps) {
  const ref = useRef<SVGSVGElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const path = paths[variant]
  return (
    <svg
      ref={ref}
      aria-label={label}
      className={cn("text-foreground", className)}
      data-direction={direction}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="squiggle-arrow"
      data-variant={variant}
      fill="none"
      height={height}
      role="img"
      viewBox="-10 -10 220 120"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{label}</title>
      <g transform={rotations[direction]}>
        <path d={path.body} fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={strokeWidth} />
        <path d={path.head} stroke="currentColor" strokeLinecap="round" strokeWidth={strokeWidth} />
      </g>
    </svg>
  )
}
