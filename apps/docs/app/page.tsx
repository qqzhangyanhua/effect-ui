import Link from "next/link"
import { ArrowRight, ChevronDown, ExternalLink, Github } from "lucide-react"

import { visibleComponents } from "@effect-ui/registry/catalog"
import { HeroShowcase } from "@/components/hero-showcase"
import { HomeFeatureGrid } from "@/components/home-feature-grid"
import { HomeHeroActions, HomeHeroMetrics } from "@/components/home-hero-extras"
import { HomePrinciplesGrid } from "@/components/home-principles-grid"
import { HomeShowcase } from "@/components/home-showcase"
import { HomeTerminal } from "@/components/home-terminal"

export default function HomePage() {
  const effectCount = visibleComponents.filter((item) => item.category !== "ui").length
  const uiCount = visibleComponents.filter((item) => item.category === "ui").length

  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border/50 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.12),transparent)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_70%,transparent)_1px,transparent_1px)] bg-size-[3.5rem_3.5rem] mask-[radial-gradient(ellipse_70%_60%_at_50%_0%,#000_55%,transparent_100%)] opacity-50"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                MIT · 开源组件库
              </span>

              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.14]">
                特效和基础组件
                <br />
                放进同一套工具箱
              </h1>

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

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              CORE FEATURES
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              核心特性
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              提供丰富的基础组件与炫酷特效，帮助你快速构建现代化的 Web 应用。
            </p>
          </div>
          <Link
            href="/docs"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <span>查看全部组件</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <HomeFeatureGrid />
      </section>

      <HomeShowcase />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            QUICK START
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            一行命令，将源码置入你的项目
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            完全遵循 shadcn CLI 规范，直接复制代码到你的工程中，完全属于你，随时随意定制。
          </p>
        </div>

        <div className="mt-10">
          <HomeTerminal />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            WHY EFFECT-UI
          </span>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            为什么选择 effect-ui
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            兼具基础 UI 的严谨规范与现代交互的灵动惊艳。
          </p>
        </div>

        <HomePrinciplesGrid />
      </section>

      <section className="relative overflow-hidden border-t border-border/50 bg-muted/20 py-16 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent)]"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            准备好打造令人惊艳的现代化界面了吗？
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            立即挑选你心仪的特效组件，复制进项目，开启非凡视觉体验。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background shadow-xs transition-all hover:bg-foreground/90 hover:shadow-md"
            >
              浏览全部组件
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://github.com/qqzhangyanhua/effect-ui"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/70"
            >
              <Github className="size-4" />
              GitHub Star
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
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
