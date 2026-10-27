"use client"

import { graphLinePath } from "@/components/ui/scroll-svg-graph"
import { UptimeBars, buildUptimeDays, type UptimeService, type UptimeStatus } from "@/components/ui/uptime-bars"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface StatusIncident {
  id: string
  title: string
  time: string
  status: UptimeStatus
}

export interface StatusPageProps {
  services?: UptimeService[]
  samples?: number[]
  incidents?: StatusIncident[]
  className?: string
}

const LEGEND: { status: UptimeStatus; label: string; tone: string }[] = [
  { status: "ok", label: "正常", tone: "bg-emerald-500" },
  { status: "degraded", label: "降级", tone: "bg-amber-400" },
  { status: "partial", label: "部分故障", tone: "bg-orange-500" },
  { status: "major", label: "重大故障", tone: "bg-rose-500" },
  { status: "maintenance", label: "维护", tone: "bg-sky-400" },
]

const DEFAULT_SERVICES: UptimeService[] = [
  { id: "api", name: "接口", days: buildUptimeDays(2) },
  { id: "web", name: "站点", days: buildUptimeDays(4) },
  { id: "mail", name: "邮件", days: buildUptimeDays(6) },
]

const DEFAULT_SAMPLES = [42, 48, 45, 70, 66, 58, 52, 49]
const DEFAULT_INCIDENTS: StatusIncident[] = [
  { id: "1", title: "接口响应变慢", time: "2026-10-18 09:20", status: "degraded" },
  { id: "2", title: "邮件队列维护完成", time: "2026-10-12 02:00", status: "maintenance" },
]

function banner(services: UptimeService[]) {
  const latest = services.flatMap((service) => service.days.at(-1)?.status ?? "ok")
  if (latest.includes("major")) return "重大故障"
  if (latest.includes("partial")) return "部分服务发生故障"
  if (latest.includes("degraded")) return "部分服务性能下降"
  return "所有系统运行正常"
}

function StatusPage({ services = DEFAULT_SERVICES, samples = DEFAULT_SAMPLES, incidents = DEFAULT_INCIDENTS, className }: StatusPageProps) {
  usePrefersReducedMotion()
  const max = Math.max(...samples, 1)
  const path = graphLinePath(samples.map((value) => (value / max) * 100))
  const message = banner(services)

  return (
    <article data-slot="status-page" className={cn("mx-auto w-full max-w-3xl space-y-6 px-4 py-6", className)}>
      <header className={cn("rounded-xl border px-4 py-3", message === "所有系统运行正常" ? "border-emerald-500/40" : "border-amber-500/40")}>
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">过去 90 天的服务记录。</p>
      </header>
      <UptimeBars services={services} />
      <section>
        <h2 className="mb-2 text-sm font-medium">响应时间</h2>
        <svg viewBox="0 0 100 100" className="h-40 w-full text-sky-300" role="img" aria-label="响应时间折线">
          <path d={`${path} L 100 92 L 0 92 Z`} fill="currentColor" opacity="0.12" />
          <path d={path} fill="none" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-medium">近期公告</h2>
        <ol className="space-y-2">
          {incidents.map((incident) => (
            <li key={incident.id} className="rounded-lg border px-3 py-2 text-sm">
              <p>{incident.title}</p>
              <p className="text-muted-foreground">{incident.time}</p>
            </li>
          ))}
        </ol>
      </section>
      <ul className="flex flex-wrap gap-3 text-xs">
        {LEGEND.map((item) => (
          <li key={item.status} className="flex items-center gap-1">
            <span className={cn("size-2 rounded-sm", item.tone)} />
            {item.label}
          </li>
        ))}
      </ul>
    </article>
  )
}

export { StatusPage }
