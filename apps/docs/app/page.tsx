import Link from "next/link"
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCode2,
  FileText,
  Github,
  Layers,
  LayoutGrid,
  Palette,
  Sparkles,
} from "lucide-react"

import { visibleComponents } from "@effect-ui/registry/catalog"
import { HeroShowcase } from "@/components/hero-showcase"
import { HomeShowcase } from "@/components/home-showcase"
import { HomeTerminal } from "@/components/home-terminal"

export default function HomePage() {
  const effectCount = visibleComponents.filter((item) => item.category !== "ui").length
  const uiCount = visibleComponents.filter((item) => item.category === "ui").length

  return (
    <main className="min-h-svh bg-background text-foreground">
      {/* =========================================================================
          HERO SECTION (Matches reference screenshot)
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-border/50 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.06),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(59,130,246,0.12),transparent)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Content */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
              {/* MIT Tag */}
              <span className="text-xs sm:text-sm font-medium tracking-wide text-muted-foreground/90">
                MIT · 开源组件库
              </span>

              {/* Main Headline */}
              <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.14]">
                特效和基础组件
                <br />
                放进同一套工具箱
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">
                effect-ui 二次开发 shadcn/ui，并移植 Magic UI、Animata、Motion
                Primitives、Cult UI 等 MIT 许可特效。通过{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs sm:text-sm text-foreground/90 border border-border/60">
                  npx shadcn add
                </code>{" "}
                复制进项目，而不是再装一个黑盒 npm 包。
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-xs transition-all hover:bg-foreground/90 hover:gap-2.5"
                >
                  开始使用
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/docs/aurora-text"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/70 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted/70"
                >
                  浏览特效
                </Link>
              </div>

              {/* Metrics / Highlights Row */}
              <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <LayoutGrid className="size-4 text-muted-foreground" />
                  <strong className="font-semibold text-foreground">{uiCount}</strong> 个基础组件
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-4 text-muted-foreground" />
                  <strong className="font-semibold text-foreground">{effectCount}</strong> 个特效
                </span>
                <span className="text-border">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Box className="size-4 text-muted-foreground" />
                  亮/暗色 CSS 变量
                </span>
              </div>
            </div>

            {/* Right 3D Visual Showcase */}
            <div className="lg:col-span-6 xl:col-span-6 flex items-center justify-center">
              <HeroShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CORE FEATURES SECTION (Matches reference screenshot)
         ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Section Header */}
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

        {/* 3 Core Feature Cards */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1 */}
          <Link href="/docs/button" className="group block">
            <div className="relative h-full rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted/60 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <LayoutGrid className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">丰富的基础组件</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                覆盖常用 UI 场景，基于 shadcn/ui 深度定制，灵活易用。
              </p>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/docs/aurora-text" className="group block">
            <div className="relative h-full rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted/60 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Layers className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">炫酷的特效组件</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                整合 Magic UI、Animata、Motion Primitives、Cult UI 等高质量特效。
              </p>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/docs/spotlight-card" className="group block">
            <div className="relative h-full rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted/60 text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <FileText className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-0.5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">交互卡片</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                聚光、倾斜、翻转、描边高光。
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          LIVE COMPONENT SHOWCASE PLAYGROUND
         ========================================================================= */}
      <HomeShowcase />

      {/* =========================================================================
          CLI TERMINAL / QUICK INSTALL SECTION
         ========================================================================= */}
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

      {/* =========================================================================
          DESIGN PRINCIPLES / BENTO GRID
         ========================================================================= */}
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

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileCode2 className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">100% 源码透明</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              没有臃肿的 npm 黑盒依赖，组件源码直接存放在你的 components 目录，代码掌控力 100%。
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Palette className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Tailwind CSS v4</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              全面采用 OKLCH 色彩与原生 CSS 变量，浅色与深色主题无缝自动适配，无任何额外样式运行时。
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Code2 className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">严格 TypeScript</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              全量组件配齐完整的类型定义与 Props 注解，IDE 智能提示丝滑畅快，杜绝类型隐患。
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">无缝兼容生态</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              与既有 shadcn/ui 组件完全同构，零门槛混用，助力团队快速交付高质感产品界面。
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION
         ========================================================================= */}
      <section className="relative overflow-hidden border-t border-border/50 bg-muted/20 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            准备好打造令人惊艳的现代化界面了吗？
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            立即挑选你心仪的特效组件，复制进项目，开启非凡视觉体验。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background shadow-xs hover:bg-foreground/90 transition-colors"
            >
              浏览全部组件
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://github.com/qqzhangyanhua/effect-ui"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <Github className="size-4" />
              GitHub Star
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
         ========================================================================= */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex size-5 items-center justify-center rounded bg-foreground text-background">
              <span className="size-1.5 rounded-full border border-background" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-foreground">effect-ui</span>
            <span className="text-xs text-muted-foreground">
              · 基于 MIT 许可开源
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              文档
            </Link>
            <Link href="/docs/button" className="hover:text-foreground transition-colors">
              组件库
            </Link>
            <Link href="/docs/aurora-text" className="hover:text-foreground transition-colors">
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
