"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/portfolio/Filter.html. Modified for effect-ui.

import { useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PortfolioPiece {
  id: string
  category: string
  eyebrow: string
  title: string
  imageUrl: string
  imageAlt: string
}

export interface PortfolioCategory {
  id: string
  label: string
}

export interface PortfolioFilterGridProps {
  items: PortfolioPiece[]
  categories: PortfolioCategory[]
  className?: string
}

export function PortfolioFilterGrid({ items, categories, className }: PortfolioFilterGridProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [active, setActive] = useState(categories[0]?.id ?? "")
  const moving = motionOn && !reduced
  const visible = items.filter((item) => item.category === active)

  return (
    <section
      className={cn("bg-background px-6 py-10 text-foreground", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="portfolio-filter-grid"
      ref={ref}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold">作品</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const pressed = category.id === active
            return (
              <button
                aria-pressed={pressed}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  pressed ? "border-primary text-primary" : "border-border text-muted-foreground",
                )}
                key={category.id}
                onClick={() => setActive(category.id)}
                type="button"
              >
                {category.label}
              </button>
            )
          })}
        </div>
      </div>
      <motion.ul className="mt-8 grid gap-6 sm:grid-cols-2" layout={moving}>
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.li
              animate={{ opacity: 1 }}
              className="overflow-hidden rounded-2xl border border-border bg-card"
              exit={{ opacity: moving ? 0 : 1 }}
              initial={moving ? { opacity: 0 } : false}
              key={item.id}
              layout={moving}
              transition={{ duration: moving ? 0.25 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image */}
              <img alt={item.imageAlt} className="h-48 w-full object-cover" src={item.imageUrl} />
              <div className="p-4">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">{item.eyebrow}</p>
                <h3 className="mt-1 text-lg font-medium">{item.title}</h3>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}
