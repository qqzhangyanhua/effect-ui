"use client"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CornerStat {
  label: string
  value: number
  suffix?: string
}

export interface SectionStatsCorneredProps {
  stats?: CornerStat[]
  className?: string
}

const defaultStats: CornerStat[] = [
  { label: "SHIPPED", value: 128 },
  { label: "UPTIME", value: 99, suffix: "%" },
  { label: "TEAMS", value: 36 },
]

function Viewfinder() {
  const mark = "absolute size-3 border-foreground/80"
  return (
    <>
      <span className={cn(mark, "top-3 left-3 border-t border-l")} />
      <span className={cn(mark, "top-3 right-3 border-t border-r")} />
      <span className={cn(mark, "bottom-3 left-3 border-b border-l")} />
      <span className={cn(mark, "right-3 bottom-3 border-r border-b")} />
    </>
  )
}

function SectionStatsCornered({ stats = defaultStats, className }: SectionStatsCorneredProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <section className={cn("rounded-2xl border bg-background px-4 py-12", className)}>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="relative rounded-xl border bg-card px-5 py-8">
            <Viewfinder />
            <p className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">{stat.label}</p>
            <p className="font-display mt-3 text-5xl tabular-nums" style={{ transition: reduced ? "none" : undefined }}>
              <span>{stat.value}</span>
              {stat.suffix}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export { SectionStatsCornered }
