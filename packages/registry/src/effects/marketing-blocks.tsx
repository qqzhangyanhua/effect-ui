import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { AuroraBackground } from "./aurora-background"
import { GlassCard } from "./glass-card"
import { ShimmerButton } from "./shimmer-button"

export type MarketingHeroVariant = "aurora" | "split" | "glass"
export type MarketingPricingVariant = "cards" | "featured" | "compact"
export type MarketingTestimonialVariant = "grid" | "quote" | "stacked"
export type MarketingFooterVariant = "simple" | "columns" | "brand"

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-background", className)}>
      {children}
    </section>
  )
}

export interface MarketingHeroProps {
  variant?: MarketingHeroVariant
  title?: string
  subtitle?: string
  className?: string
}

function MarketingHero({
  variant = "aurora",
  title = "把特效和基础组件放进同一套工具箱",
  subtitle = "复制进项目，而不是再装一个黑盒依赖。",
  className,
}: MarketingHeroProps) {
  if (variant === "split") {
    return (
      <Frame className={cn("grid md:grid-cols-2", className)}>
        <div className="flex flex-col justify-center gap-4 p-8">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Launch</p>
          <h2 className="font-display text-3xl tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <div className="flex gap-2">
            <ShimmerButton>开始使用</ShimmerButton>
            <Button variant="outline">查看文档</Button>
          </div>
        </div>
        <AuroraBackground className="min-h-48 rounded-none border-0" />
      </Frame>
    )
  }

  if (variant === "glass") {
    return (
      <Frame className={cn("relative p-8", className)}>
        <AuroraBackground className="absolute inset-0 rounded-none border-0" />
        <GlassCard className="relative mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight">{title}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
          <ShimmerButton className="mt-5">预约演示</ShimmerButton>
        </GlassCard>
      </Frame>
    )
  }

  return (
    <AuroraBackground className={cn("rounded-2xl border p-10 text-center", className)}>
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">effect-ui</p>
      <h2 className="font-display mt-3 text-4xl tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-6 flex justify-center gap-2">
        <ShimmerButton>开始使用</ShimmerButton>
        <Button variant="ghost">GitHub</Button>
      </div>
    </AuroraBackground>
  )
}

const plans = [
  { name: "Hobby", price: "$0", items: ["基础组件", "社区支持"] },
  { name: "Pro", price: "$19", items: ["全部特效", "优先更新", "商业使用"] },
  { name: "Team", price: "$49", items: ["团队席位", "私有 registry"] },
]

export interface MarketingPricingProps {
  variant?: MarketingPricingVariant
  className?: string
}

function MarketingPricing({ variant = "cards", className }: MarketingPricingProps) {
  if (variant === "compact") {
    return (
      <Frame className={cn("divide-y", className)}>
        {plans.map((plan) => (
          <div key={plan.name} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-medium">{plan.name}</p>
              <p className="text-xs text-muted-foreground">{plan.items.join(" · ")}</p>
            </div>
            <p className="text-lg font-semibold">{plan.price}</p>
          </div>
        ))}
      </Frame>
    )
  }

  if (variant === "featured") {
    return (
      <div className={cn("grid gap-3 md:grid-cols-3", className)}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "rounded-2xl border p-5",
              plan.name === "Pro" && "border-primary shadow-lg",
            )}
          >
            <p className="text-sm text-muted-foreground">{plan.name}</p>
            <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Button className="mt-5 w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
              选择
            </Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-3 md:grid-cols-3", className)}>
      {plans.map((plan) => (
        <GlassCard key={plan.name}>
          <p className="text-sm text-muted-foreground">{plan.name}</p>
          <p className="mt-2 text-3xl font-semibold">{plan.price}</p>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {plan.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </GlassCard>
      ))}
    </div>
  )
}

const quotes = [
  { name: "林晓", role: "设计负责人", text: "复制即可用，主题变量一次对齐。" },
  { name: "陈默", role: "前端", text: "特效和基础组件终于在同一套 registry。" },
  { name: "苏晚", role: "独立开发者", text: "文档预览和 props 表省了很多时间。" },
]

export interface MarketingTestimonialsProps {
  variant?: MarketingTestimonialVariant
  className?: string
}

function MarketingTestimonials({ variant = "grid", className }: MarketingTestimonialsProps) {
  if (variant === "quote") {
    const quote = quotes[0]
    return (
      <Frame className={cn("p-8 text-center", className)}>
        <p className="font-display text-2xl tracking-tight">“{quote?.text}”</p>
        <p className="mt-4 text-sm text-muted-foreground">
          {quote?.name} · {quote?.role}
        </p>
      </Frame>
    )
  }

  if (variant === "stacked") {
    return (
      <div className={cn("space-y-3", className)}>
        {quotes.map((quote) => (
          <div key={quote.name} className="rounded-xl border bg-card p-4">
            <p className="text-sm">{quote.text}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {quote.name} · {quote.role}
            </p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("grid gap-3 md:grid-cols-3", className)}>
      {quotes.map((quote) => (
        <GlassCard key={quote.name} className="p-4">
          <p className="text-sm">{quote.text}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {quote.name} · {quote.role}
          </p>
        </GlassCard>
      ))}
    </div>
  )
}

export interface MarketingFooterProps {
  variant?: MarketingFooterVariant
  className?: string
}

function MarketingFooter({ variant = "simple", className }: MarketingFooterProps) {
  if (variant === "columns") {
    return (
      <footer className={cn("grid gap-6 rounded-2xl border p-6 text-sm md:grid-cols-3", className)}>
        <div>
          <p className="font-medium">产品</p>
          <p className="mt-2 text-muted-foreground">组件 · 特效 · Blocks</p>
        </div>
        <div>
          <p className="font-medium">资源</p>
          <p className="mt-2 text-muted-foreground">文档 · Registry · GitHub</p>
        </div>
        <div>
          <p className="font-medium">协议</p>
          <p className="mt-2 text-muted-foreground">MIT · 保留上游版权</p>
        </div>
      </footer>
    )
  }

  if (variant === "brand") {
    return (
      <footer className={cn("rounded-2xl border p-6", className)}>
        <p className="font-display text-2xl">effect-ui</p>
        <p className="mt-2 text-sm text-muted-foreground">开源 React UI + 特效 registry。</p>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        "flex items-center justify-between rounded-2xl border px-5 py-4 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>© effect-ui</span>
      <span>MIT License</span>
    </footer>
  )
}

export { MarketingHero, MarketingPricing, MarketingTestimonials, MarketingFooter }
