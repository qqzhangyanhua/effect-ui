"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/availability-badge.tsx

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type AvailabilityStatus = "open" | "limited" | "booked"

export interface AvailabilityBadgeProps {
  status?: AvailabilityStatus
  labels?: Partial<Record<AvailabilityStatus, { title: string; detail: string }>>
  timeZone?: string
  className?: string
  color?: string
}

const DEFAULT_LABELS: Record<AvailabilityStatus, { title: string; detail: string }> = {
  open: { title: "Open to work", detail: "Booking projects from November" },
  limited: { title: "Limited availability", detail: "One slot left this quarter" },
  booked: { title: "Fully booked", detail: "Waitlist open for January" },
}

export function AvailabilityBadge({ status = "open", labels, timeZone, className, color = "var(--primary)" }: AvailabilityBadgeProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const copy = { ...DEFAULT_LABELS[status], ...labels?.[status] }
  const [clock, setClock] = useState("")

  useEffect(() => {
    if (!timeZone) return
    let format: Intl.DateTimeFormat
    try {
      format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone, timeZoneName: "short" })
    } catch {
      return
    }
    const tick = () => setClock(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, 15000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return (
    <div ref={rootRef} role="status" aria-live="polite" data-motion={moving ? "on" : "off"} className={cn("inline-flex max-w-full items-center gap-3 rounded-full border border-border bg-card py-2 pr-4 pl-3.5 text-foreground motion-reduce:animate-none", className)}>
      <span className="relative grid size-3 shrink-0 place-items-center" aria-hidden>
        {moving && status === "open"
          ? [0, 1].map((index) => (
              <motion.span key={index} className="absolute inset-0 rounded-full" style={{ background: color }} animate={{ scale: [1, 3.2], opacity: [0.55, 0] }} transition={{ duration: 2.1, repeat: Infinity, delay: index * 1.05 }} />
            ))
          : null}
        {moving && status === "limited" ? <motion.span className="absolute inset-0 rounded-full" style={{ background: color }} animate={{ scale: [1, 2.2, 1], opacity: [0.35, 0, 0.35] }} transition={{ duration: 3.6, repeat: Infinity }} /> : null}
        <span className="relative size-3 rounded-full" style={{ background: status === "booked" ? "var(--destructive)" : color }} />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-sm font-semibold">{copy.title}</span>
        <span className="text-xs text-muted-foreground">{copy.detail}</span>
      </span>
      {clock ? <span className="ml-1 hidden border-l border-border pl-3 font-mono text-xs tabular-nums sm:block"><span className="sr-only">Local time </span>{clock}</span> : null}
    </div>
  )
}
