"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type UptimeStatus = "ok" | "degraded" | "partial" | "major" | "maintenance"

export interface UptimeDay {
  date: string
  status: UptimeStatus
  detail: string
}

export interface UptimeService {
  id: string
  name: string
  days: UptimeDay[]
}

export interface UptimeBarsProps {
  services?: UptimeService[]
  className?: string
}

const TONE: Record<UptimeStatus, string> = {
  ok: "bg-emerald-500",
  degraded: "bg-amber-400",
  partial: "bg-orange-500",
  major: "bg-rose-500",
  maintenance: "bg-sky-400",
}

const LABEL: Record<UptimeStatus, string> = {
  ok: "正常",
  degraded: "降级",
  partial: "部分故障",
  major: "重大故障",
  maintenance: "维护",
}

export function buildUptimeDays(seed: number, length = 90): UptimeDay[] {
  const end = Date.UTC(2026, 9, 21)
  return Array.from({ length }, (_, index) => {
    const date = new Date(end - (length - 1 - index) * 86400000)
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    const roll = (seed * 17 + index * 13) % 100
    const status: UptimeStatus = roll > 98 ? "major" : roll > 96 ? "partial" : roll > 93 ? "degraded" : roll > 91 ? "maintenance" : "ok"
    return { date: `${date.getUTCFullYear()}-${month}-${day}`, status, detail: LABEL[status] }
  })
}

function uptimePercent(days: UptimeDay[]) {
  const healthy = days.filter((day) => day.status === "ok" || day.status === "maintenance").length
  return (healthy / Math.max(days.length, 1)) * 100
}

const DEFAULTS: UptimeService[] = [
  { id: "api", name: "接口", days: buildUptimeDays(2) },
  { id: "web", name: "站点", days: buildUptimeDays(5) },
]

function UptimeBars({ services = DEFAULTS, className }: UptimeBarsProps) {
  usePrefersReducedMotion()
  const [closed, setClosed] = React.useState<Set<string>>(() => new Set())
  const [tip, setTip] = React.useState<{ service: string; day: UptimeDay } | null>(null)

  return (
    <div data-slot="uptime-bars" className={cn("w-full space-y-4", className)}>
      {services.map((service) => {
        const open = !closed.has(service.id)
        const percent = uptimePercent(service.days)
        return (
          <section key={service.id} className="rounded-xl border p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <button
                type="button"
                aria-expanded={open}
                className="text-sm font-medium"
                onClick={() => {
                  setClosed((current) => {
                    const next = new Set(current)
                    if (next.has(service.id)) next.delete(service.id)
                    else next.add(service.id)
                    return next
                  })
                }}
              >
                {service.name}
              </button>
              <span className="text-sm tabular-nums">{percent.toFixed(2)}%</span>
            </div>
            {open ? (
              <div className="flex h-8 w-full items-end gap-px" onMouseLeave={() => setTip((current) => (current?.service === service.id ? null : current))}>
                {service.days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    aria-label={`${service.name} ${day.date} ${day.detail}`}
                    className={cn("h-7 min-w-px flex-1 rounded-[1px]", TONE[day.status])}
                    onMouseEnter={() => setTip({ service: service.id, day })}
                    onFocus={() => setTip({ service: service.id, day })}
                  />
                ))}
              </div>
            ) : null}
          </section>
        )
      })}
      {tip ? <p role="tooltip" className="text-sm text-muted-foreground">{tip.day.date} · {tip.day.detail}</p> : null}
    </div>
  )
}

export { UptimeBars }
