"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/usage-quota-meter.tsx

import { useEffect, useRef, useState } from "react"
import { animate, motion, useInView } from "motion/react"
import { AlertTriangle, ArrowUpRight } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface UsageSegment {
  label: string
  value: number
}

export interface UsageResource {
  id: string
  label: string
  unit: string
  limit: number
  segments: UsageSegment[]
  decimals?: number
}

export interface UsageQuotaMeterProps {
  resources?: UsageResource[]
  period?: string
  warnAt?: number
  loading?: boolean
  onUpgrade?: () => void
  title?: string
  className?: string
}

const DEFAULT_USAGE: UsageResource[] = [
  { id: "bw", label: "Fast data transfer", unit: "GB", limit: 100, decimals: 1, segments: [{ label: "Static assets", value: 41.2 }, { label: "Functions", value: 18.6 }, { label: "Images", value: 6.3 }] },
  { id: "fn", label: "Function invocations", unit: "M", limit: 1, decimals: 2, segments: [{ label: "API routes", value: 0.61 }, { label: "Cron", value: 0.23 }] },
  { id: "build", label: "Build minutes", unit: "min", limit: 6000, segments: [{ label: "Production", value: 3120 }, { label: "Preview", value: 2950 }, { label: "Retries", value: 410 }] },
  { id: "store", label: "Blob storage", unit: "GB", limit: 5, decimals: 2, segments: [{ label: "Uploads", value: 0.92 }] },
]

function formatAmount(value: number, decimals = 0) {
  return value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function Count({ to, decimals = 0, run, reduced }: { to: number; decimals?: number; run: boolean; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduced || !run) {
      node.textContent = formatAmount(run || reduced ? to : 0, decimals)
      return
    }
    const controls = animate(0, to, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: (value) => { node.textContent = formatAmount(value, decimals) } })
    return () => controls.stop()
  }, [to, decimals, run, reduced])
  return <span ref={ref} className="tabular-nums">{formatAmount(reduced ? to : 0, decimals)}</span>
}

export function UsageQuotaMeter({
  resources = DEFAULT_USAGE,
  period = "Oct 1 – Oct 31",
  warnAt = 0.8,
  loading = false,
  onUpgrade,
  title = "Usage",
  className,
}: UsageQuotaMeterProps) {
  const rootRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const inView = useInView(rootRef, { once: true, amount: 0.3 })
  const [focus, setFocus] = useState<string | null>(null)
  const over = resources.filter((resource) => resource.segments.reduce((sum, segment) => sum + segment.value, 0) > resource.limit).length
  const moving = live && !reduced

  return (
    <section ref={rootRef} aria-busy={loading || undefined} data-motion={moving ? "on" : "off"} className={cn("w-full max-w-xl rounded-[20px] bg-card p-5 text-foreground shadow-sm ring-1 ring-border motion-reduce:animate-none sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Hobby plan · <span className="tabular-nums">{period}</span></p>
        </div>
        <button type="button" onClick={onUpgrade} className="inline-flex min-h-11 items-center gap-1 rounded-[10px] bg-foreground px-3 text-[13px] font-medium text-background outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Upgrade <ArrowUpRight aria-hidden className="size-3.5" />
        </button>
      </div>
      {over > 0 && !loading ? (
        <p role="alert" className="mt-4 flex items-center gap-2 rounded-[10px] bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <AlertTriangle aria-hidden className="size-4 shrink-0" /> {over} resource{over > 1 ? "s" : ""} over the included limit. Upgrade to avoid throttling.
        </p>
      ) : null}
      <ul className="mt-5 space-y-1">
        {resources.map((resource, index) => {
          const used = resource.segments.reduce((sum, segment) => sum + segment.value, 0)
          const fraction = used / resource.limit
          const tone = fraction > 1 ? "over" : fraction >= warnAt ? "warn" : "ok"
          const scale = Math.max(1, fraction)
          const active = focus === resource.id
          return (
            <li key={resource.id}>
              <div
                tabIndex={loading ? -1 : 0}
                onMouseEnter={() => setFocus(resource.id)}
                onMouseLeave={() => setFocus(null)}
                onFocus={() => setFocus(resource.id)}
                onBlur={() => setFocus(null)}
                onClick={() => setFocus((current) => (current === resource.id ? null : resource.id))}
                aria-label={`${resource.label}: ${formatAmount(used, resource.decimals ?? 0)} of ${formatAmount(resource.limit)} ${resource.unit}, ${Math.round(fraction * 100)} percent${tone === "over" ? ", over limit" : tone === "warn" ? ", nearing limit" : ""}`}
                className="-mx-2 rounded-[14px] px-2 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{loading ? "…" : resource.label}</span>
                  {!loading ? (
                    <span className="shrink-0 text-[13px] text-muted-foreground" aria-hidden>
                      <span className={cn("font-medium", tone === "over" && "text-destructive", tone === "warn" && "text-chart-4")}>
                        <Count to={used} decimals={resource.decimals} run={inView && moving} reduced={reduced || !live} />
                      </span>
                      {" / "}
                      <span className="tabular-nums">{formatAmount(resource.limit)}</span> {resource.unit}
                    </span>
                  ) : null}
                </div>
                <div aria-hidden className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  {!loading ? (
                    <motion.div className="absolute inset-0 flex origin-left gap-px" initial={reduced ? false : { scaleX: 0 }} animate={{ scaleX: inView || reduced ? 1 : 0 }} transition={{ duration: moving ? 1.1 : 0, delay: index * 0.05 }}>
                      {resource.segments.map((segment) => (
                        <span key={segment.label} className={cn("h-full first:rounded-l-full last:rounded-r-full", tone === "over" ? "bg-destructive" : tone === "warn" ? "bg-chart-4" : "bg-primary")} style={{ width: `${(segment.value / resource.limit / scale) * 100}%` }} />
                      ))}
                    </motion.div>
                  ) : null}
                  {scale > 1 ? <span className="absolute inset-y-0 w-0.5 bg-card" style={{ left: `${100 / scale}%` }} /> : null}
                </div>
                {active && !loading ? (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
                    {resource.segments.map((segment) => (
                      <span key={segment.label}>{segment.label} <span className="text-foreground tabular-nums">{formatAmount(segment.value)}</span></span>
                    ))}
                    {tone !== "ok" ? <span className={tone === "over" ? "text-destructive" : "text-chart-4"}>{tone === "over" ? "Over limit" : "Nearing limit"}</span> : null}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
