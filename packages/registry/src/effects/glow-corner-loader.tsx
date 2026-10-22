"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author NlghtM4re）— https://github.com/uiverse-io/galaxy/blob/main/loaders/NlghtM4re_popular-crab-99.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const REST = [
  { x: -30, y: -30 },
  { x: 30, y: -30 },
  { x: 30, y: 30 },
  { x: -30, y: 30 },
] as const

export interface GlowCornerLoaderProps extends HTMLAttributes<HTMLDivElement> {
  colors?: string[]
  duration?: number
}

export function GlowCornerLoader({
  colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"],
  duration = 4,
  className,
  ...props
}: GlowCornerLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const cycle = Math.max(0.4, duration)

  return (
    <div {...props} ref={ref} aria-label="加载中" className={cn("relative inline-flex size-28 items-center justify-center", className)} data-reduced={reduced ? "true" : "false"} data-slot="glow-corner-loader" role="status">
      <style>{`
        @keyframes glow-corner-loader-move {
          0% { transform: translate(-30px, -30px); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(30px, 30px); }
          75% { transform: translate(-30px, 30px); }
          100% { transform: translate(-30px, -30px); }
        }
      `}</style>
      {REST.map((corner, index) => {
        const color = colors[index % Math.max(colors.length, 1)] ?? "var(--primary)"
        return (
          <span
            key={corner.x + corner.y}
            aria-hidden
            className="absolute size-7"
            style={{
              backgroundColor: color,
              boxShadow: `0 7px 29px ${color}`,
              transform: active ? undefined : `translate(${corner.x}px, ${corner.y}px)`,
              animation: active ? `glow-corner-loader-move ${cycle}s infinite ${-index - 1}s` : "none",
            }}
          />
        )
      })}
    </div>
  )
}
