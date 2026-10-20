"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PerspectivePlan {
  name: string
  monthly: number
  yearly: number
  items: string[]
}

export interface SectionPricingPerspectiveGridProps {
  plans?: PerspectivePlan[]
  className?: string
}

const defaultPlans: PerspectivePlan[] = [
  { name: "HOBBY", monthly: 0, yearly: 0, items: ["1 个空间", "社区支持"] },
  { name: "STUDIO", monthly: 29, yearly: 19, items: ["无限区块", "优先更新"] },
  { name: "TEAM", monthly: 79, yearly: 59, items: ["席位管理", "设计评审"] },
]

function SectionPricingPerspectiveGrid({
  plans = defaultPlans,
  className,
}: SectionPricingPerspectiveGridProps) {
  const reduced = usePrefersReducedMotion()
  const [yearly, setYearly] = React.useState(true)

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border bg-background px-4 py-14", className)}>
      <style>
        {`@keyframes eu-hover { 50% { transform: translateY(-8px); } }`}
      </style>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 [perspective:700px]">
        <div className="absolute inset-0 origin-bottom bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_16%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_16%,transparent)_1px,transparent_1px)] bg-size-[42px_42px] [transform:rotateX(68deg)]" />
      </div>
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="font-mono text-xs tracking-[0.32em] text-muted-foreground uppercase">Pricing</p>
        <h2 className="font-display mt-2 text-4xl">卡片浮在消失的网格上</h2>
        <div className="mt-5 inline-flex rounded-full border bg-card p-1 font-mono text-[11px] tracking-[0.18em] uppercase">
          {(["monthly", "yearly"] as const).map((cycle) => {
            const on = yearly === (cycle === "yearly")
            return (
              <button
                key={cycle}
                type="button"
                aria-pressed={on}
                onClick={() => setYearly(cycle === "yearly")}
                className={cn("rounded-full px-4 py-1.5", on && "bg-foreground text-background")}
              >
                {cycle}
              </button>
            )
          })}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className="rounded-2xl border bg-card/95 p-5 text-left shadow-lg backdrop-blur"
              style={{ animation: reduced ? undefined : `eu-hover ${4 + index}s ease-in-out infinite` }}
            >
              <p className="font-mono text-xs tracking-[0.22em]">{plan.name}</p>
              <p className="font-display mt-3 text-4xl">${yearly ? plan.yearly : plan.monthly}</p>
              <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant={index === 1 ? "default" : "outline"}>
                选择 {plan.name}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export { SectionPricingPerspectiveGrid }
