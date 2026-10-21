import Link from "next/link"
import { ArrowRight, ChevronDown, ExternalLink, Github } from "lucide-react"

import { visibleComponents } from "@effect-ui/registry/catalog"
import { DotPattern } from "@effect-ui/registry/effects/dot-pattern"
import { HighlightText } from "@effect-ui/registry/effects/highlight-text"
import { HeroShowcase } from "@/components/hero-showcase"
import { HomeCtaBand } from "@/components/home-cta-band"
import { HomeFeatureGrid } from "@/components/home-feature-grid"
import { HomeHeroActions, HomeHeroMetrics } from "@/components/home-hero-extras"
import { HomeHeroTitle } from "@/components/home-hero-title"
import { HomePrinciplesGrid } from "@/components/home-principles-grid"
import { HomeSectionHeading } from "@/components/home-section-heading"
import { HomeShowcase } from "@/components/home-showcase"
import { HomeSectionBackdrop } from "@/components/home-section-backdrop"
import { HomeTerminal } from "@/components/home-terminal"

export default function HomePage() {
  const effectCount = visibleComponents.filter((item) => item.category !== "ui").length
  const uiCount = visibleComponents.filter((item) => item.category === "ui").length

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/50 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.12),transparent)]">
        <DotPattern
          width={20}
          height={20}
          cr={0.8}
          className="opacity-[0.28] mask-[radial-gradient(ellipse_75%_65%_at_50%_0%,#000_45%,transparent_100%)] motion-reduce:opacity-15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_70%,transparent)_1px,transparent_1px)] bg-size-[3.5rem_3.5rem] mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,#000_55%,transparent_100%)] opacity-35"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                MIT · 开源组件库
              </span>

              <HomeHeroTitle />

              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">
                effect-ui 二次开发 shadcn/ui，并移植 Magic UI、Animata、Motion
                Primitives、Cult UI 等 MIT 许可特效。通过{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm text-foreground/90 border border-border/60">
                  npx shadcn add
                </code>{" "}
                复制进项目，而不是再装一个黑盒 npm 包。
              </p>

              <HomeHeroActions />
              <HomeHeroMetrics uiCount={uiCount} effectCount={effectCount} />
            </div>

            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center">
              <HeroShowcase />
            </div>
          </div>

          <div className="mt-10 flex justify-center lg:mt-4">
            <Link
              href="/#showcase"
              className="group inline-flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>向下滚动体验动效</span>
              <ChevronDown className="size-4 animate-bounce motion-reduce:animate-none" />
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-24">
        <HomeSectionBackdrop variant="features" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <HomeSectionHeading
            align="left"
            className="flex-1"
            kicker="CORE FEATURES"
            title={
              <>
                核心
                <HighlightText className="mx-1">特性</HighlightText>
              </>
            }
            description="提供丰富的基础组件与炫酷特效，帮助你快速构建现代化的 Web 应用。"
          />
          <Link
            href="/docs"
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <span>查看全部组件</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <HomeFeatureGrid />
        </div>
      </section>

      <HomeShowcase />

      <section className="relative overflow-hidden border-t border-border/50 py-16 sm:py-24">
        <HomeSectionBackdrop variant="terminal" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomeSectionHeading
          kicker="QUICK START"
          title={
            <>
              一行命令，将
              <HighlightText className="mx-1">源码</HighlightText>
              置入你的项目
            </>
          }
          description="完全遵循 shadcn CLI 规范，直接复制代码到你的工程中，完全属于你，随时随意定制。"
        />

        <div className="mt-10">
          <HomeTerminal />
        </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-border/50 py-16 sm:py-24">
        <HomeSectionBackdrop variant="principles" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HomeSectionHeading
          kicker="WHY EFFECT-UI"
          title={
            <>
              为什么选择
              <HighlightText className="mx-1">effect-ui</HighlightText>
            </>
          }
          description="兼具基础 UI 的严谨规范与现代交互的灵动惊艳。"
        />

        <HomePrinciplesGrid />
        </div>
      </section>

      <HomeCtaBand />

      <footer className="relative overflow-hidden border-t border-border/50 py-12">
        <HomeSectionBackdrop variant="footer" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex size-5 items-center justify-center rounded bg-foreground text-background">
              <span className="size-1.5 rounded-full border border-background" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">effect-ui</span>
            <span className="text-xs text-muted-foreground">· 基于 MIT 许可开源</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              文档
            </Link>
            <Link href="/docs/button" className="hover:text-foreground transition-colors">
              组件库
            </Link>
            <Link href="/docs/typing-text" className="hover:text-foreground transition-colors">
              特效集合
            </Link>
            <a
              href="https://github.com/qqzhangyanhua/effect-ui"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              GitHub
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
