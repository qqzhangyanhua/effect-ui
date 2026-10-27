"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface LatticeLoaderProps {
  rows?: number
  cols?: number
  speed?: number
  color?: string
  size?: number
  gap?: number
  className?: string
  ref?: React.Ref<HTMLDivElement>
  "aria-label"?: string
}

function LatticeLoader({
  rows = 4,
  cols = 4,
  speed = 1,
  color,
  size,
  gap,
  className,
  ref,
  "aria-label": ariaLabel = "加载中",
}: LatticeLoaderProps) {
  const reduced = usePrefersReducedMotion()
  const safeRows = Math.max(1, Math.round(rows))
  const safeCols = Math.max(1, Math.round(cols))
  const safeSpeed = Math.max(0.1, speed)
  const dot = size === undefined || size === 6 ? undefined : size
  const gridGap = gap === undefined || gap === 6 ? undefined : gap

  return (
    <div
      ref={ref}
      role="status"
      aria-label={ariaLabel}
      data-slot="lattice-loader"
      data-reduced={reduced ? "true" : "false"}
      className={cn(gridGap === undefined ? "inline-grid gap-1.5" : "inline-grid", className)}
      style={{
        gridTemplateColumns: `repeat(${safeCols}, minmax(0, 1fr))`,
        color,
        ...(gridGap === undefined ? {} : { gap: gridGap }),
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
            className={cn(
              dot === undefined ? "size-1.5 rounded-full bg-current" : "rounded-full bg-current",
              !reduced && "animate-pulse",
            )}
            style={
              reduced
                ? dot === undefined
                  ? undefined
                  : { width: dot, height: dot }
                : {
                    animationDelay: `${delay}s`,
                    animationDuration: `${1.2 / safeSpeed}s`,
                    ...(dot === undefined ? {} : { width: dot, height: dot }),
                  }
            }
          />
        )
      })}
    </div>
  )
}

export { LatticeLoader }
