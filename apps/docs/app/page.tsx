import Link from "next/link"

import { AuroraText } from "@effect-ui/registry/effects/aurora-text"
import { GradientText } from "@effect-ui/registry/effects/gradient-text"
import { Meteors } from "@effect-ui/registry/effects/meteors"
import { ShineBorder } from "@effect-ui/registry/effects/shine-border"
import { ShimmerButton } from "@effect-ui/registry/effects/shimmer-button"
import { SplitText } from "@effect-ui/registry/effects/split-text"
import { SpotlightCard } from "@effect-ui/registry/effects/spotlight-card"
import { visibleComponents } from "@effect-ui/registry/catalog"
import { Badge } from "@effect-ui/registry/ui/badge"
import { Button } from "@effect-ui/registry/ui/button"

const featured = [
  {
    title: "文字动画",
    href: "/docs/gradient-text",
    body: "渐变、扫光、打字机、逐字错落。",
  },
  {
    title: "背景特效",
    href: "/docs/particles",
    body: "粒子、流星、极光、闪烁网格。",
  },
  {
    title: "交互卡片",
    href: "/docs/spotlight-card",
    body: "聚光、倾斜、翻转、描边高光。",
  },
]

function HomePage() {
  const effectCount = visibleComponents.filter((item) => item.category !== "ui").length
  const uiCount = visibleComponents.filter((item) => item.category === "ui").length

  return (
    <main>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_42%),radial-gradient(circle_at_90%_20%,color-mix(in_oklab,var(--chart-2)_18%,transparent),transparent_36%)]" />
        <Meteors number={12} />
        <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-24">
          <Badge variant="secondary">MIT · shadcn-compatible registry</Badge>
          <h1 className="font-display max-w-3xl text-5xl leading-tight tracking-tight sm:text-6xl">
            <AuroraText>特效和基础组件</AuroraText>
            <span className="block text-foreground">放进同一套工具箱</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            effect-ui 二次开发 shadcn/ui，并移植 Magic UI、Animata、Motion
            Primitives、Cult UI 等 MIT 许可特效。通过{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
              npx shadcn add
            </code>{" "}
            复制进项目，而不是再装一个黑盒 npm 包。
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/docs">
              <ShimmerButton>开始使用</ShimmerButton>
            </Link>
            <Link href="/docs/gradient-text">
              <Button variant="outline">浏览特效</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {uiCount} 个基础组件 · {effectCount} 个特效 · 亮/暗色 CSS 变量
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-16 md:grid-cols-3">
        {featured.map((item) => (
          <Link key={item.href} href={item.href}>
            <SpotlightCard className="h-full">
              <h2 className="text-lg font-medium">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </SpotlightCard>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <ShineBorder className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <GradientText className="text-2xl font-medium">
              npx shadcn add ./r/shimmer-button.json
            </GradientText>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              每个组件都是独立源码。文档站提供实时预览、安装命令和 props 表。
            </p>
          </div>
          <SplitText className="text-xl" text="Copy. Tweak. Ship." />
        </ShineBorder>
      </section>
    </main>
  )
}

export default HomePage
