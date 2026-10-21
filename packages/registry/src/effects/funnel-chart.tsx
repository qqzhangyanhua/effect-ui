"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FunnelStage {
  label: string
  value: number
}

export interface FunnelChartProps {
  stages?: FunnelStage[]
  className?: string
}

const DEFAULTS: FunnelStage[] = [
  { label: "访问", value: 1000 },
  { label: "注册", value: 640 },
  { label: "试用", value: 280 },
  { label: "付费", value: 120 },
]

function FunnelChart({ stages = DEFAULTS, className }: FunnelChartProps) {
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = React.useState<number | null>(null)
  const max = Math.max(...stages.map((stage) => stage.value), 1)
  const width = 320
  const row = 56

  return (
    <div data-slot="funnel-chart" className={cn("w-full max-w-md", className)}>
      <svg viewBox={`0 0 ${width} ${stages.length * row}`} className="w-full" role="img" aria-label="漏斗">
        {stages.map((stage, index) => {
          const previous = stages[index - 1]
          const bar = Math.max(24, (stage.value / max) * (width - 80))
          const x = (width - bar) / 2
          const conversion = previous && previous.value > 0 ? stage.value / previous.value : 1
          const y = index * row + 8
          return (
            <g key={stage.label} onMouseEnter={() => setActive(index)} onMouseLeave={() => setActive(null)}>
              <motion.rect
                x={x}
                y={y}
                height={32}
                rx={8}
                initial={reduced ? false : { width: 0 }}
                animate={{ width: bar }}
                transition={reduced ? { duration: 0 } : { delay: index * 0.12, type: "spring", stiffness: 160, damping: 20 }}
                fill={active === index ? "#0284c7" : "#38bdf8"}
              />
              <text x={width / 2} y={y + 21} textAnchor="middle" fontSize="12" fill="#0f172a">
                {bar > 88 ? `${stage.label} ${stage.value}` : stage.label}
              </text>
              {previous ? (
                <text x={width - 4} y={y + 21} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.7">
                  {Math.round(conversion * 100)}%
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
      <ul className="mt-2 space-y-1 text-sm">
        {stages.slice(1).map((stage, index) => {
          const previous = stages[index]
          const conversion = previous && previous.value > 0 ? Math.round((stage.value / previous.value) * 100) : 0
          return <li key={stage.label}>{stage.label} 转化 {conversion}% · 流失 {100 - conversion}%</li>
        })}
      </ul>
      {active !== null && stages[active] ? (
        <p role="tooltip" className="text-sm text-muted-foreground">
          {stages[active].label}：{stages[active].value}
          {stages[active - 1] ? `，上一步转化 ${Math.round((stages[active].value / Math.max(stages[active - 1]?.value ?? 1, 1)) * 100)}%` : ""}
        </p>
      ) : null}
    </div>
  )
}

export { FunnelChart }
