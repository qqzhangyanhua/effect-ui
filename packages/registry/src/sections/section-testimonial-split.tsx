"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SplitQuote {
  quote: string
  name: string
  role: string
  brand: string
  metric: string
}

export interface SectionTestimonialSplitProps {
  quotes?: SplitQuote[]
  className?: string
}

const defaultQuotes: SplitQuote[] = [
  { quote: "区块接上之后，落地页不再像三套工具拼出来的。", name: "林夏", role: "设计", brand: "Harbor", metric: "3.2×" },
  { quote: "定价和页脚终于用同一套字号。评审少了一轮。", name: "周衡", role: "前端", brand: "North", metric: "11 天" },
  { quote: "减弱动效打开时，页面还是完整的。", name: "苏晚", role: "产品", brand: "Lumen", metric: "0 跳帧" },
]

function SectionTestimonialSplit({ quotes = defaultQuotes, className }: SectionTestimonialSplitProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const quote = quotes[index] ?? quotes[0]
  const count = quotes.length

  React.useEffect(() => {
    if (reduced || count < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 4200)
    return () => window.clearInterval(timer)
  }, [count, reduced])

  if (!quote) return null

  const step = (delta: number) => setIndex((current) => (current + delta + count) % count)

  return (
    <section className={cn("rounded-2xl border bg-background p-4", className)}>
      <div className="grid overflow-hidden rounded-xl md:grid-cols-2">
        <article className="bg-card px-6 py-10">
          <p className="font-display text-2xl leading-snug tracking-tight text-balance sm:text-3xl">“{quote.quote}”</p>
          <p className="mt-6 text-sm">
            {quote.name}
            <span className="text-muted-foreground"> · {quote.role}</span>
          </p>
        </article>
        <article className="flex flex-col justify-between bg-zinc-950 px-6 py-10 text-white">
          <p className="font-mono text-xs tracking-[0.28em] text-white/50 uppercase">{quote.brand}</p>
          <p className="font-display text-6xl">{quote.metric}</p>
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-white/20 px-3 py-1 text-xs" onClick={() => step(-1)}>
              上一条
            </button>
            <button type="button" className="rounded-full border border-white/20 px-3 py-1 text-xs" onClick={() => step(1)}>
              下一条
            </button>
          </div>
        </article>
      </div>
    </section>
  )
}

export { SectionTestimonialSplit }
