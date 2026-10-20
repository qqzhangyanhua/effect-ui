"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { GlowingEdge } from "@/components/ui/glowing-edge"
import { NumberFlow } from "@/components/ui/number-flow"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface PricingPlan {
  name: string
  monthly: number
  yearly: number
  items: string[]
  featured?: boolean
}

export interface SectionPricingFlowProps {
  plans?: PricingPlan[]
  className?: string
}

const defaultPlans: PricingPlan[] = [
  { name: "Hobby", monthly: 0, yearly: 0, items: ["基础组件", "社区支持"] },
  {
    name: "Pro",
    monthly: 29,
    yearly: 19,
    items: ["全部区块", "优先更新", "商业使用"],
    featured: true,
  },
  { name: "Team", monthly: 79, yearly: 59, items: ["席位管理", "设计评审"] },
]

function SectionPricingFlow({ plans = defaultPlans, className }: SectionPricingFlowProps) {
  const [yearly, setYearly] = React.useState(true)

  return (
    <section className={cn("rounded-2xl border bg-background px-6 py-12", className)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Pricing</p>
        <h2 className="font-display text-3xl">按年付更便宜，数字会滚</h2>
        <label className="flex items-center gap-2 text-sm">
          <span className={yearly ? "text-muted-foreground" : "text-foreground"}>月付</span>
          <Switch checked={yearly} onCheckedChange={setYearly} aria-label="按年计费" />
          <span className={yearly ? "text-foreground" : "text-muted-foreground"}>年付</span>
        </label>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price = yearly ? plan.yearly : plan.monthly
          const card = (
            <article
              className={cn(
                "flex h-full flex-col rounded-2xl border bg-card p-6",
                plan.featured && "border-transparent bg-transparent",
              )}
            >
              <p className="text-sm text-muted-foreground">{plan.name}</p>
              <p className="mt-3 flex items-end gap-1 font-display text-4xl">
                <NumberFlow value={price} prefix="$" />
                <span className="pb-1 text-sm text-muted-foreground">/月</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button className="mt-6" variant={plan.featured ? "default" : "outline"}>
                选择 {plan.name}
              </Button>
            </article>
          )
          return plan.featured ? (
            <GlowingEdge key={plan.name}>{card}</GlowingEdge>
          ) : (
            <div key={plan.name}>{card}</div>
          )
        })}
      </div>
    </section>
  )
}

export { SectionPricingFlow }
