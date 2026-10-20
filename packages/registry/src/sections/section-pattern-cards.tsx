"use client"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PatternCard {
  title: string
  body: string
  pattern: "rings" | "dots" | "stripes"
}

export interface SectionPatternCardsProps {
  cards?: PatternCard[]
  className?: string
}

const defaultCards: PatternCard[] = [
  { title: "同心圆", body: "标题区用程序画出的圆环。", pattern: "rings" },
  { title: "点阵", body: "同一套间距，换成圆点。", pattern: "dots" },
  { title: "条纹", body: "再换成斜向细线。", pattern: "stripes" },
]

function Pattern({ kind }: { kind: PatternCard["pattern"] }) {
  if (kind === "rings") {
    return (
      <svg viewBox="0 0 200 90" className="size-full" aria-hidden>
        {[18, 32, 46].map((radius) => (
          <circle key={radius} cx="100" cy="70" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.55" />
        ))}
      </svg>
    )
  }
  if (kind === "dots") {
    return (
      <svg viewBox="0 0 200 90" className="size-full" aria-hidden>
        {Array.from({ length: 8 }, (_, y) =>
          Array.from({ length: 16 }, (_, x) => (
            <circle key={`${x}-${y}`} cx={8 + x * 12} cy={8 + y * 12} r="1.4" fill="currentColor" />
          )),
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 90" className="size-full" aria-hidden>
      {Array.from({ length: 14 }, (_, index) => (
        <line key={index} x1={index * 16} y1="0" x2={index * 16 - 40} y2="90" stroke="currentColor" strokeOpacity="0.55" />
      ))}
    </svg>
  )
}

function SectionPatternCards({ cards = defaultCards, className }: SectionPatternCardsProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <section className={cn("rounded-2xl border bg-background px-4 py-12", className)}>
      <h2 className="font-display text-center text-3xl">几何图案做卡片头</h2>
      <div className="mx-auto mt-8 grid max-w-4xl gap-8 sm:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="relative rounded-2xl border bg-card pb-6 shadow-sm"
            style={{ transition: reduced ? "none" : "transform 300ms" }}
          >
            <div className="h-24 overflow-hidden rounded-t-2xl bg-primary/10 text-foreground">
              <Pattern kind={card.pattern} />
            </div>
            <span className="absolute top-16 left-5 grid size-12 place-items-center rounded-full bg-white text-zinc-900 shadow-md">
              <span className="size-3 rounded-full bg-current" />
            </span>
            <div className="px-5 pt-8">
              <h3 className="font-medium">{card.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export { SectionPatternCards }
