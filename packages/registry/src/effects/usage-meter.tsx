"use client"

import { NumberFlow } from "@/components/ui/number-flow"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface UsageMetric {
  id: string
  label: string
  used: number
  limit: number
  daily?: number[]
}

export interface UsageMeterProps {
  metrics?: UsageMetric[]
  resetsOn?: string
  onUpgrade?: () => void
  className?: string
}

const DEFAULTS: UsageMetric[] = [
  { id: "views", label: "页面访问", used: 8600, limit: 10000, daily: [20, 28, 24, 40, 36, 30, 22] },
  { id: "seats", label: "席位", used: 12, limit: 10, daily: [8, 9, 10, 11, 12, 12, 12] },
]

function tone(used: number, limit: number) {
  const ratio = used / Math.max(limit, 1)
  if (ratio >= 1) return "over"
  if (ratio >= 0.8) return "warn"
  return "ok"
}

const BAR = { ok: "bg-emerald-500", warn: "bg-amber-400", over: "bg-rose-500" }

function UsageMeter({ metrics = DEFAULTS, resetsOn = "2026-11-01", onUpgrade, className }: UsageMeterProps) {
  usePrefersReducedMotion()
  return (
    <section data-slot="usage-meter" className={cn("w-full space-y-4 rounded-xl border p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">重置于 {resetsOn}</p>
        <button type="button" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground" onClick={onUpgrade}>升级方案</button>
      </div>
      {metrics.map((metric) => {
        const level = tone(metric.used, metric.limit)
        const width = Math.min(100, (metric.used / Math.max(metric.limit, 1)) * 100)
        const peak = Math.max(...(metric.daily ?? [1]), 1)
        return (
          <article key={metric.id} className="space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <h3>{metric.label}</h3>
              <p>
                <NumberFlow value={metric.used} />
                <span className="text-muted-foreground"> / {metric.limit}</span>
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-label={metric.label} aria-valuenow={metric.used} aria-valuemax={metric.limit} data-tone={level}>
              <div className={cn("h-full", BAR[level])} style={{ width: `${width}%` }} />
            </div>
            {metric.daily ? (
              <div className="flex h-10 items-end gap-1" aria-hidden>
                {metric.daily.map((value, index) => (
                  <span key={index} className={cn("flex-1 rounded-sm", BAR[level])} style={{ height: `${(value / peak) * 100}%` }} />
                ))}
              </div>
            ) : null}
          </article>
        )
      })}
    </section>
  )
}

export { UsageMeter }
