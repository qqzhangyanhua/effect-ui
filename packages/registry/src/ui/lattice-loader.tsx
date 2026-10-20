"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LatticeLoaderProps {
  rows?: number
  cols?: number
  speed?: number
  color?: string
  className?: string
  ref?: React.Ref<HTMLDivElement>
  "aria-label"?: string
}

function LatticeLoader({
  rows = 4,
  cols = 4,
  speed = 1,
  color,
  className,
  ref,
  "aria-label": ariaLabel = "加载中",
}: LatticeLoaderProps) {
  const reduced = usePrefersReducedMotion()
  const safeRows = Math.max(1, Math.round(rows))
  const safeCols = Math.max(1, Math.round(cols))
  const safeSpeed = Math.max(0.1, speed)

  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      data-slot="lattice-loader"
      data-reduced={reduced ? "true" : "false"}
      className={cn("inline-grid gap-1.5", className)}
      style={{
        gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
        color,
      }}
    >
      {Array.from({ length: safeRows * safeCols }, (_, index) => {
        const row = Math.floor(index / safeCols)
        const col = index % safeCols
        const delay = ((row + col) / (safeRows + safeCols)) * (1.2 / safeSpeed)
        return (
          <span
            key={index}
            aria-hidden
            className={cn("size-1.5 rounded-full bg-current", !reduced && "animate-pulse")}
            style={
              reduced
                ? undefined
                : { animationDelay: `${delay}s`, animationDuration: `${1.2 / safeSpeed}s` }
            }
          />
        )
      })}
    </div>
  )
}

export { LatticeLoader }
