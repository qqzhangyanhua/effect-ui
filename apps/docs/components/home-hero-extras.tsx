import Link from "next/link"
import { ArrowRight, Box, LayoutGrid, Sparkles } from "lucide-react"

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function HomeHeroActions() {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Link
        href="/docs"
        className={`inline-flex h-11 w-fit shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 ${focusRing}`}
      >
        开始使用
        <ArrowRight className="size-4 shrink-0" />
      </Link>
      <Link
        href="/#showcase"
        className={`inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-background/80 px-5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted ${focusRing}`}
      >
        实时体验
      </Link>
    </div>
  )
}

type HomeHeroMetricsProps = {
  componentCount: number
  effectCount: number
}

export function HomeHeroMetrics({ componentCount, effectCount }: HomeHeroMetricsProps) {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <LayoutGrid className="size-4 text-muted-foreground" />
        <strong className="font-semibold tabular-nums text-foreground">{componentCount}</strong>{" "}
        个基础组件
      </span>
      <span className="text-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="size-4 text-muted-foreground" />
        <strong className="font-semibold tabular-nums text-foreground">{effectCount}</strong> 个特效
      </span>
      <span className="text-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <Box className="size-4 text-muted-foreground" />
        亮/暗色 CSS 变量
      </span>
    </div>
  )
}
