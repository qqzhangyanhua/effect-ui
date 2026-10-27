"use client"

import { cn } from "@/lib/cn"

export interface HeroKineticTextProps {
  lead?: string
  words?: string[]
  annotation?: string
  subtitle?: string
  className?: string
}

function HeroKineticText({
  lead = "Interfaces that",
  words = ["move", "delight", "convert", "ship"],
  annotation = "hand-drawn",
  subtitle = "词组逐词显现，关键词轮换，再用 rough-annotation 圈出重点。",
  className,
}: HeroKineticTextProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_48%)] px-6 py-20",
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Hero Kinetic</p>
        <h2 className="font-display flex flex-wrap items-baseline justify-center gap-x-3 text-4xl tracking-tight sm:text-6xl">
          <span className="inline-flex justify-center gap-x-2">{lead}</span>
          <span className="text-primary">{words[0] ?? ""}</span>
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {subtitle} Try the <span className="text-primary">{annotation}</span> mark.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
          >
            开始构建
          </button>
          <button type="button" className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm hover:bg-muted">
            示例
          </button>
        </div>
      </div>
    </section>
  )
}

export { HeroKineticText }
