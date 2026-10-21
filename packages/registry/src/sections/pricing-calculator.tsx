"use client"

import * as React from "react"

import { NumberFlow } from "@/components/ui/number-flow"
import { cn } from "@/lib/utils"

export interface PricingTier {
  id: string
  name: string
  monthly: number
  yearly: number
  includedSeats: number
  includedUsage: number
  seatPrice: number
  usagePrice: number
  recommended?: boolean
}

export interface PricingCalculatorProps {
  tiers?: PricingTier[]
  className?: string
}

const DEFAULT_TIERS: PricingTier[] = [
  { id: "solo", name: "个人", monthly: 29, yearly: 24, includedSeats: 1, includedUsage: 1000, seatPrice: 12, usagePrice: 8 },
  { id: "team", name: "团队", monthly: 79, yearly: 64, includedSeats: 5, includedUsage: 8000, seatPrice: 9, usagePrice: 5, recommended: true },
  { id: "studio", name: "工作室", monthly: 159, yearly: 132, includedSeats: 15, includedUsage: 30000, seatPrice: 6, usagePrice: 3 },
]

function quote(tier: PricingTier, seats: number, usage: number, yearly: boolean) {
  const base = yearly ? tier.yearly : tier.monthly
  const extraSeats = Math.max(0, seats - tier.includedSeats)
  const extraChunks = Math.max(0, Math.ceil((usage - tier.includedUsage) / 1000))
  return base + extraSeats * tier.seatPrice + extraChunks * tier.usagePrice
}

function PricingCalculator({ tiers = DEFAULT_TIERS, className }: PricingCalculatorProps) {
  const [seats, setSeats] = React.useState(6)
  const [usage, setUsage] = React.useState(12000)
  const [yearly, setYearly] = React.useState(true)
  const quotes = tiers.map((tier) => ({ tier, amount: quote(tier, seats, usage, yearly) }))
  const best = quotes.reduce<(typeof quotes)[number] | undefined>(
    (winner, item) => (!winner || item.amount < winner.amount ? item : winner),
    undefined,
  )
  const recommended = quotes.find((item) => item.tier.recommended) ?? best

  return (
    <section data-slot="pricing-calculator" className={cn("w-full space-y-4 rounded-xl border p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">按用量估价</h2>
        <div className="flex rounded-full bg-muted p-1 text-sm">
          <button type="button" aria-pressed={!yearly} className={cn("rounded-full px-3 py-1", !yearly && "bg-background")} onClick={() => setYearly(false)}>
            月付
          </button>
          <button type="button" aria-pressed={yearly} className={cn("rounded-full px-3 py-1", yearly && "bg-background")} onClick={() => setYearly(true)}>
            年付
          </button>
        </div>
      </div>
      <label className="block text-sm">
        席位 {seats}
        <input aria-label="席位" type="range" min={1} max={40} value={seats} onChange={(event) => setSeats(Number(event.target.value))} className="w-full" />
      </label>
      <label className="block text-sm">
        调用量 {usage}
        <input aria-label="调用量" type="range" min={0} max={50000} step={1000} value={usage} onChange={(event) => setUsage(Number(event.target.value))} className="w-full" />
      </label>
      <p className="text-sm text-muted-foreground">按当前用量，推荐 {recommended?.tier.name}。最省的是 {best?.tier.name}。</p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {quotes.map(({ tier, amount }) => (
          <li key={tier.id} className={cn("rounded-xl border p-3", tier.id === recommended?.tier.id && "border-primary")}>
            <p className="text-sm font-medium">{tier.name}</p>
            <p className="mt-2 text-2xl">
              <NumberFlow value={amount} />
              <span className="text-sm text-muted-foreground"> / 月</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export { PricingCalculator }
