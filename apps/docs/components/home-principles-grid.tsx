"use client"

import { CheckCircle2, Code2, FileCode2, Palette } from "lucide-react"

import { SpotlightCard } from "@effect-ui/registry/effects/spotlight-card"

const principles = [
  {
    icon: FileCode2,
    title: "100% 源码透明",
    description:
      "没有臃肿的 npm 黑盒依赖，组件源码直接存放在你的 components 目录，代码掌控力 100%。",
  },
  {
    icon: Palette,
    title: "Tailwind CSS v4",
    description:
      "全面采用 OKLCH 色彩与原生 CSS 变量，浅色与深色主题无缝自动适配，无任何额外样式运行时。",
  },
  {
    icon: Code2,
    title: "严格 TypeScript",
    description: "全量组件配齐完整的类型定义与 Props 注解，IDE 智能提示丝滑畅快，杜绝类型隐患。",
  },
  {
    icon: CheckCircle2,
    title: "无缝兼容生态",
    description: "与既有 shadcn/ui 组件完全同构，零门槛混用，助力团队快速交付高质感产品界面。",
  },
] as const

export function HomePrinciplesGrid() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {principles.map((item) => {
        const Icon = item.icon
        return (
          <SpotlightCard
            key={item.title}
            radius={220}
            intensity={0.85}
            className="rounded-2xl border-border/80 p-6 shadow-xs transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </SpotlightCard>
        )
      })}
    </div>
  )
}
