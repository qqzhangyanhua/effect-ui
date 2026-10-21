"use client"

import Link from "next/link"
import { ArrowRight, FileText, Layers, LayoutGrid } from "lucide-react"

import { SpotlightCard } from "@effect-ui/registry/effects/spotlight-card"

const features = [
  {
    href: "/docs/button",
    icon: LayoutGrid,
    title: "丰富的基础组件",
    description: "覆盖常用 UI 场景，基于 shadcn/ui 深度定制，灵活易用。",
    spotlight: "color-mix(in oklab, var(--primary) 32%, transparent)",
  },
  {
    href: "/docs/typing-text",
    icon: Layers,
    title: "炫酷的特效组件",
    description: "整合 Magic UI、Animata、Motion Primitives、Cult UI 等高质量特效。",
    spotlight: "color-mix(in oklab, var(--chart-2) 35%, transparent)",
  },
  {
    href: "/docs/spotlight-card",
    icon: FileText,
    title: "交互卡片",
    description: "聚光、倾斜、翻转、描边高光。",
    spotlight: "color-mix(in oklab, var(--chart-4) 30%, transparent)",
  },
] as const

export function HomeFeatureGrid() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => {
        const Icon = feature.icon
        return (
          <Link key={feature.href} href={feature.href} className="group block h-full">
            <SpotlightCard
              spotlightColor={feature.spotlight}
              radius={280}
              className="h-full rounded-2xl border-border/80 p-6 shadow-xs transition-transform duration-300 pointer-fine:group-hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted/60 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </SpotlightCard>
          </Link>
        )
      })}
    </div>
  )
}
