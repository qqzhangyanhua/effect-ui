"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Sparkles, Type, Wand2, Zap } from "lucide-react"

import { AuroraText } from "@effect-ui/registry/effects/aurora-text"
import { GradientText } from "@effect-ui/registry/effects/gradient-text"
import { Meteors } from "@effect-ui/registry/effects/meteors"
import { ShineBorder } from "@effect-ui/registry/effects/shine-border"
import { ShimmerButton } from "@effect-ui/registry/effects/shimmer-button"
import { SplitText } from "@effect-ui/registry/effects/split-text"
import { SpotlightCard } from "@effect-ui/registry/effects/spotlight-card"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "text", label: "文字特效", icon: Type },
  { id: "card", label: "交互卡片", icon: Sparkles },
  { id: "border", label: "流光边框", icon: Wand2 },
  { id: "button", label: "动态按钮", icon: Zap },
]

export function HomeShowcase() {
  const [activeTab, setActiveTab] = useState("text")

  return (
    <section id="showcase" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-border/50">
      <div className="flex flex-col items-center text-center">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          LIVE DEMO
        </span>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          精选特效实时体验
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          零黑盒、纯源码交付。你可以直接在浏览器中感受其细腻流畅的动效质感。
        </p>

        {/* Category Switcher Tabs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="mt-10">
        {activeTab === "text" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-8 text-center min-h-[220px]">
              <span className="text-xs font-mono text-muted-foreground mb-4">AuroraText</span>
              <AuroraText className="text-2xl sm:text-3xl font-bold">
                流光溢彩的极光文字
              </AuroraText>
              <Link
                href="/docs/aurora-text"
                className="mt-6 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                查看文档 <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-8 text-center min-h-[220px]">
              <span className="text-xs font-mono text-muted-foreground mb-4">GradientText</span>
              <GradientText className="text-2xl sm:text-3xl font-bold">
                平滑流动的渐变色彩
              </GradientText>
              <Link
                href="/docs/gradient-text"
                className="mt-6 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                查看文档 <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-8 text-center min-h-[220px]">
              <span className="text-xs font-mono text-muted-foreground mb-4">SplitText</span>
              <SplitText className="text-2xl sm:text-3xl font-bold" text="逐字跃动的律动节奏" />
              <Link
                href="/docs/split-text"
                className="mt-6 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                查看文档 <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "card" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SpotlightCard className="flex flex-col justify-between p-8 min-h-[240px] rounded-2xl">
              <div>
                <span className="text-xs font-mono text-muted-foreground">SpotlightCard</span>
                <h3 className="mt-3 text-xl font-bold text-card-foreground">
                  移动光标体验动态聚光
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  聚光灯高光随鼠标位置实时追踪，为静态卡片注入高级交互质感。支持自定义光晕色彩、扩散半径与过渡速度。
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">零依赖 · 纯 CSS 变量与 Motion 驱动</span>
                <Link
                  href="/docs/spotlight-card"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  查看文档 <ArrowRight className="size-3" />
                </Link>
              </div>
            </SpotlightCard>

            <SpotlightCard
              spotlightColor="color-mix(in oklab, var(--chart-2) 40%, transparent)"
              className="flex flex-col justify-between p-8 min-h-[240px] rounded-2xl"
            >
              <div>
                <span className="text-xs font-mono text-muted-foreground">Cyan Spotlight</span>
                <h3 className="mt-3 text-xl font-bold text-card-foreground">
                  青蓝流光高光卡片
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  通过传入自定义 spotlightColor 参数，即可轻松适配产品的主题色系或品牌规范。
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">极佳性能 · 硬件加速渲染</span>
                <Link
                  href="/docs/spotlight-card"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  查看文档 <ArrowRight className="size-3" />
                </Link>
              </div>
            </SpotlightCard>
          </div>
        )}

        {activeTab === "border" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ShineBorder duration={8} className="p-8 min-h-[220px] rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground">ShineBorder</span>
                <h3 className="mt-3 text-xl font-bold text-foreground">
                  360° 连续旋转流光边框
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  以纯 CSS Houdini @property 变量驱动，实现柔和圆滑的无缝旋转流光，无需笨重的三方库。
                </p>
              </div>
              <Link
                href="/docs/shine-border"
                className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                查看文档 <ArrowRight className="size-3" />
              </Link>
            </ShineBorder>

            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-8 min-h-[220px] flex flex-col justify-between">
              <Meteors number={10} />
              <div className="relative z-10">
                <span className="text-xs font-mono text-muted-foreground">Meteors</span>
                <h3 className="mt-3 text-xl font-bold text-foreground">
                  浪漫唯美的夜空流星划过
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  随机倾角与淡出效果，为暗色背景或主视觉 Hero 带来科技与唯美氛围感。
                </p>
              </div>
              <Link
                href="/docs/meteors"
                className="relative z-10 mt-6 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                查看文档 <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "button" && (
          <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border/80 bg-card p-12 min-h-[220px]">
            <div className="flex flex-col items-center gap-3">
              <ShimmerButton>
                <span>探索全部组件</span>
              </ShimmerButton>
              <span className="text-xs text-muted-foreground font-mono">ShimmerButton</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Link
                href="/docs"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
              >
                立即开始 →
              </Link>
              <span className="text-xs text-muted-foreground font-mono">Solid Button</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <Link
                href="/docs/aurora-text"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
              >
                浏览更多特效
              </Link>
              <span className="text-xs text-muted-foreground font-mono">Outline Button</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
