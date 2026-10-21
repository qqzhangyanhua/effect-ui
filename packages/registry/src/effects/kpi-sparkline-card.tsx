"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { CountUp } from "./count-up"

export interface KpiSparklineCardProps {
  label?: string
  value?: number
  delta?: number
  series?: readonly number[]
  className?: string
  /** 折线颜色。不传则跟随 currentColor。 */
  color?: string
  /** 折线盒子高度，像素。不传或 80 仍是 h-20。坐标仍按 72 计算。 */
  size?: number
}

const SERIES = [18, 22, 19, 28, 26, 34, 31, 40, 38, 46] as const

function pointsOf(series: readonly number[], width: number, height: number) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  return series.map((value, index) => ({
    value,
    x: series.length === 1 ? width / 2 : (index / (series.length - 1)) * width,
    y: height - 6 - ((value - min) / span) * (height - 12),
  }))
}

function KpiSparklineCard({
  label = "本周访问",
  value = 12840,
  delta = 12.4,
  series = SERIES,
  className,
  color,
  size,
}: KpiSparklineCardProps) {
  const reduced = usePrefersReducedMotion()
  const width = 280
  const viewHeight = 72
  const fitted = size === undefined || size === 80
  const follow = color === undefined
  const points = pointsOf(series, width, viewHeight)
  const [index, setIndex] = React.useState<number | null>(null)
  const active = index === null ? null : points[index]
  const path = points
    .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ")
  const positive = delta >= 0

  const select = (next: number) => {
    setIndex(Math.min(points.length - 1, Math.max(0, next)))
  }

  return (
    <article
      data-slot="kpi-sparkline-card"
      className={cn("w-full max-w-sm rounded-xl border bg-background p-4", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-3xl tracking-tight">
            <CountUp value={value} />
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            positive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/15 text-rose-700 dark:text-rose-300",
          )}
        >
          {positive ? "+" : ""}
          {delta}%
        </span>
      </div>
      <svg
        viewBox={`0 0 ${width} ${viewHeight}`}
        className={cn("mt-4 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary", fitted && "h-20")}
        style={fitted ? undefined : { height: size }}
        role="img"
        aria-label={`${label}趋势，共 ${series.length} 个点`}
        tabIndex={0}
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const ratio = (event.clientX - rect.left) / rect.width
          select(Math.round(ratio * (points.length - 1)))
        }}
        onPointerLeave={() => setIndex(null)}
        onFocus={() => select(points.length - 1)}
        onBlur={() => setIndex(null)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
          event.preventDefault()
          const current = index ?? points.length - 1
          select(current + (event.key === "ArrowRight" ? 1 : -1))
        }}
      >
        <path
          d={path}
          fill="none"
          stroke={follow ? "currentColor" : color}
          strokeWidth={2}
          className={follow ? "text-primary" : undefined}
        />
        {active ? (
          <g>
            <line
              x1={active.x}
              x2={active.x}
              y1={4}
              y2={viewHeight - 2}
              stroke="currentColor"
              strokeOpacity={0.35}
            />
            <circle cx={active.x} cy={active.y} r={3.5} className="fill-primary" />
          </g>
        ) : null}
      </svg>
      <p className="h-5 text-xs text-muted-foreground" aria-live="polite">
        {active ? `第 ${((index ?? 0) + 1).toString()} 点 · ${active.value}` : reduced ? "聚焦折线查看数据点" : "悬停或聚焦折线"}
      </p>
    </article>
  )
}

export { KpiSparklineCard }
