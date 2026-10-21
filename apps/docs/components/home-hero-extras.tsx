"use client"

import Link from "next/link"
import { ArrowRight, Box, LayoutGrid, Sparkles } from "lucide-react"

import { CountUp } from "@effect-ui/registry/effects/count-up"
import { ShimmerButton } from "@effect-ui/registry/effects/shimmer-button"

export function HomeHeroActions() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3.5">
      <ShimmerButton
        asChild
        className="inline-flex h-10 w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-5 text-sm font-medium shadow-xs"
      >
        <Link href="/docs" className="inline-flex items-center gap-2 whitespace-nowrap">
          开始使用
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      </ShimmerButton>
      <Link
        href="/#showcase"
        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-muted/70 hover:shadow-sm"
      >
        实时体验
      </Link>
    </div>
  )
}

type HomeHeroMetricsProps = {
  uiCount: number
  effectCount: number
}

export function HomeHeroMetrics({ uiCount, effectCount }: HomeHeroMetricsProps) {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <LayoutGrid className="size-4 text-muted-foreground" />
        <strong className="font-semibold tabular-nums text-foreground">
          <CountUp value={uiCount} className="inline" />
        </strong>{" "}
        个基础组件
      </span>
      <span className="text-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="size-4 text-muted-foreground" />
        <strong className="font-semibold tabular-nums text-foreground">
          <CountUp value={effectCount} className="inline" />
        </strong>{" "}
        个特效
      </span>
      <span className="text-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <Box className="size-4 text-muted-foreground" />
        亮/暗色 CSS 变量
      </span>
    </div>
  )
}
