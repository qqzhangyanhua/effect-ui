"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: framer-motion 改为 motion/react，五档颜色改为 colors，索引读取有回退，减弱动效时弹簧时长为 0 且不弹跳。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/app/registry/face-rating/face-rating.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { AnimatePresence, motion } from "motion/react"
import { useCallback, useRef, useState, type KeyboardEvent } from "react"

export interface FaceRatingProps {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  labels?: [string, string, string, string, string]
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  label?: string
  colors?: string[]
  className?: string
}

const LEVELS = [1, 2, 3, 4, 5] as const
const DEFAULT_LABELS: [string, string, string, string, string] = ["Terrible", "Bad", "Okay", "Good", "Amazing"]
const DEFAULT_COLORS = ["#f43f5e", "#f97316", "#fbbf24", "#84cc16", "#10b981"]
const MOUTH_CONTROL_Y = [34, 41, 47, 54, 61]
const MOUTH_CORNER_Y = [49.5, 48, 47, 46, 44.5]
const EYE_SCALE_Y = [0.45, 0.6, 0.9, 1, 1.25]
const SIZES = {
  sm: { face: 56, root: "gap-2", row: "gap-1.5", segment: "h-6 w-6 text-[10px]", labelBox: "h-4", labelText: "text-xs" },
  md: { face: 72, root: "gap-3", row: "gap-2", segment: "h-7 w-7 text-xs", labelBox: "h-5", labelText: "text-sm" },
  lg: { face: 96, root: "gap-4", row: "gap-2.5", segment: "h-9 w-9 text-sm", labelBox: "h-6", labelText: "text-base" },
} as const

function at(list: readonly number[], index: number, fallback: number) {
  return list[index] ?? fallback
}

function mouthPath(level: number) {
  const corner = at(MOUTH_CORNER_Y, level - 1, 47)
  const control = at(MOUTH_CONTROL_Y, level - 1, 47)
  return `M 22 ${corner} Q 36 ${control} 50 ${corner}`
}

export function FaceRating({
  value: valueProp,
  defaultValue = 0,
  onValueChange,
  labels = DEFAULT_LABELS,
  showLabel = true,
  size = "md",
  label = "How was your experience?",
  colors = DEFAULT_COLORS,
  className,
}: FaceRatingProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [hovered, setHovered] = useState(0)
  const [bouncing, setBouncing] = useState(false)
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([])
  const value = valueProp ?? internalValue
  const active = hovered || value
  const level = active || 3
  const faceColor = active ? (colors[active - 1] ?? "#a3a3a3") : "#a3a3a3"
  const sizes = SIZES[size]
  const spring = prefersReducedMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 22 }

  const commit = useCallback(
    (next: number) => {
      if (valueProp === undefined) setInternalValue(next)
      onValueChange?.(next)
      if (!prefersReducedMotion) setBouncing(true)
    },
    [onValueChange, prefersReducedMotion, valueProp],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next = value
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(5, value + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = value === 0 ? 1 : Math.max(1, value - 1)
    else return
    event.preventDefault()
    segmentRefs.current[next - 1]?.focus()
    if (next !== value) commit(next)
  }

  return (
    <div data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="face-rating" className={cn("flex flex-col items-center", sizes.root, className)}>
      <motion.div aria-hidden="true" initial={false} animate={bouncing && !prefersReducedMotion ? { y: [0, -6, 0], scale: [1, 1.08, 1] } : { y: 0, scale: 1 }} transition={bouncing && !prefersReducedMotion ? { duration: 0.45, times: [0, 0.4, 1], ease: "easeOut" } : { duration: 0 }} onAnimationComplete={() => setBouncing(false)}>
        <svg viewBox="0 0 72 72" width={sizes.face} height={sizes.face} fill="none" strokeLinecap="round">
          <motion.circle cx={36} cy={36} r={30} strokeWidth={4} initial={false} animate={{ stroke: faceColor }} transition={spring} />
          <motion.line x1={19} y1={19} x2={30} y2={23} strokeWidth={3} initial={false} animate={{ stroke: faceColor, opacity: level <= 2 ? 1 : 0 }} transition={spring} />
          <motion.line x1={42} y1={23} x2={53} y2={19} strokeWidth={3} initial={false} animate={{ stroke: faceColor, opacity: level <= 2 ? 1 : 0 }} transition={spring} />
          <motion.ellipse cx={25} cy={30} rx={3.5} ry={4} initial={false} animate={{ fill: faceColor, scaleY: at(EYE_SCALE_Y, level - 1, 1) }} transition={spring} />
          <motion.ellipse cx={47} cy={30} rx={3.5} ry={4} initial={false} animate={{ fill: faceColor, scaleY: at(EYE_SCALE_Y, level - 1, 1) }} transition={spring} />
          <motion.path strokeWidth={4} initial={false} animate={{ stroke: faceColor, d: mouthPath(level) }} transition={spring} />
        </svg>
      </motion.div>
      <div role="radiogroup" aria-label={label} className={cn("flex items-center", sizes.row)} onMouseLeave={() => setHovered(0)}>
        {LEVELS.map((segmentLevel) => {
          const isActive = value === segmentLevel
          const color = colors[segmentLevel - 1] ?? "#a3a3a3"
          const mood = labels[segmentLevel - 1] ?? ""
          return (
            <motion.button
              key={segmentLevel}
              ref={(node) => {
                segmentRefs.current[segmentLevel - 1] = node
              }}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`Rate ${segmentLevel} of 5 — ${mood}`}
              tabIndex={isActive || (value === 0 && segmentLevel === 1) ? 0 : -1}
              onClick={() => commit(segmentLevel)}
              onKeyDown={onKeyDown}
              onMouseEnter={() => setHovered(segmentLevel)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
              className={cn(
                "relative inline-flex touch-manipulation select-none items-center justify-center rounded-full border font-medium tabular-nums focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                sizes.segment,
                isActive ? "border-transparent" : "border-border bg-card text-muted-foreground",
              )}
              style={isActive ? { color } : undefined}
            >
              {isActive ? <span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ backgroundColor: `${color}1f`, boxShadow: `inset 0 0 0 1px ${color}` }} /> : null}
              <span className="relative">{segmentLevel}</span>
            </motion.button>
          )
        })}
      </div>
      {showLabel ? (
        <div className={cn("relative flex items-center justify-center overflow-hidden", sizes.labelBox)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {active > 0 ? (
              <motion.span key={active} className={cn("font-medium text-muted-foreground", sizes.labelText)} initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}>
                {labels[active - 1] ?? ""}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  )
}
