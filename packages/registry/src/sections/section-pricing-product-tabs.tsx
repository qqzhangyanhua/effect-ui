"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ProductPlan {
  name: string
  monthly: number
  yearly: number
  save: string
}

export interface SectionPricingProductTabsProps {
  products?: ProductPlan[]
  className?: string
}

const defaultProducts: ProductPlan[] = [
  { name: "笔记", monthly: 12, yearly: 9, save: "省 25%" },
  { name: "画布", monthly: 24, yearly: 18, save: "省 25%" },
  { name: "席位", monthly: 40, yearly: 32, save: "省 20%" },
]

function SectionPricingProductTabs({
  products = defaultProducts,
  className,
}: SectionPricingProductTabsProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const [yearly, setYearly] = React.useState(true)
  const product = products[index] ?? products[0]

  if (!product) return null

  return (
    <section className={cn("rounded-2xl border bg-muted/40 px-4 py-12", className)}>
      <div className="mx-auto max-w-xl">
        <div className="flex items-end gap-1 px-2">
          {products.map((item, itemIndex) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={itemIndex === index}
              onClick={() => setIndex(itemIndex)}
              className={cn(
                "rounded-t-xl border border-b-0 px-4 text-sm",
                itemIndex === index ? "h-11 bg-card font-medium" : "h-9 bg-background/70 text-muted-foreground",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="rounded-2xl rounded-tl-none border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl">{product.name}</h2>
            <button
              type="button"
              role="switch"
              aria-checked={yearly}
              onClick={() => setYearly((value) => !value)}
              className="rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase"
            >
              {yearly ? "yearly" : "monthly"}
            </button>
          </div>
          <p className="font-display mt-6 text-5xl">${yearly ? product.yearly : product.monthly}</p>
          {yearly ? (
            <span className="mt-2 inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">{product.save}</span>
          ) : null}
          <Button
            className="mt-6 w-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white hover:opacity-90"
            style={{ transition: reduced ? "none" : undefined }}
          >
            开始使用
          </Button>
        </div>
      </div>
    </section>
  )
}

export { SectionPricingProductTabs }
