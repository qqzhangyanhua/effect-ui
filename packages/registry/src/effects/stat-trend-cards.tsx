"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/application/stats/1.html. Modified for effect-ui.

import type { HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StatTrendItem {
  label: string
  value: string
  from: string
  delta: string
  direction: "up" | "down"
}

export interface StatTrendCardsProps extends HTMLAttributes<HTMLDivElement> {
  items: StatTrendItem[]
}

export function StatTrendCards({ items, className, ...props }: StatTrendCardsProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div {...props} className={cn("flex max-w-lg flex-col gap-4", className)} data-reduced={reduced ? "true" : "false"} data-slot="stat-trend-cards">
      {items.map((item) => {
        const up = item.direction === "up"
        return (
          <article key={`${item.label}-${item.direction}`} className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
            <p className={cn("inline-flex items-center gap-2 self-end rounded-sm p-1 text-xs font-medium", up ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-50" : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-50")}>
              <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {up ? <path d="M4 14l6-6 4 4 6-6" /> : <path d="M4 10l6 6 4-4 6 6" />}
              </svg>
              <span className="sr-only">{up ? "上涨：" : "下跌："}</span>
              <span>{item.delta}</span>
            </p>
            <div>
              <strong className="block text-sm font-medium text-muted-foreground">{item.label}</strong>
              <p className="mt-1">
                <span className="text-2xl font-medium text-foreground">{item.value}</span>
                <span className="ml-2 text-xs text-muted-foreground">之前 {item.from}</span>
              </p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
