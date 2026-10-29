"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles, Type, Wand2, Zap, type LucideIcon } from "lucide-react"
import { motion } from "motion/react"

import { ElectricBorder } from "@/components/ui/electric-border"
import { GlassCard } from "@/components/ui/glass-card"
import { GlowingEdge } from "@/components/ui/glowing-edge"
import { HoverLiftGlow } from "@/components/ui/hover-lift-glow"
import { JellyButton } from "@/components/ui/jelly-button"
import { KineticScrambleText } from "@/components/ui/kinetic-scramble-text"
import { NeonButton } from "@/components/ui/neon-button"
import { TextGenerate } from "@/components/ui/text-generate"
import { TextRotate } from "@/components/ui/text-rotate"
import { HomeSectionBackdrop } from "@/components/home-section-backdrop"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type ShowcaseTab = "text" | "card" | "border" | "button"

const tabs: { id: ShowcaseTab; label: string; icon: LucideIcon }[] = [
  { id: "text", label: "文字特效", icon: Type },
  { id: "card", label: "交互卡片", icon: Sparkles },
  { id: "border", label: "流光边框", icon: Wand2 },
  { id: "button", label: "动态按钮", icon: Zap },
]

const rotateLines = ["句子滑上来", "词在换位置", "节奏很克制"] as const

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function DocLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-sm text-xs font-medium text-primary",
        focusRing,
      )}
    >
      查看文档
      <ArrowRight className="size-3" />
    </Link>
  )
}

function TextPanel({ live, reduced }: { live: boolean; reduced: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <article className="flex min-h-[240px] min-w-0 flex-col rounded-2xl border border-border/80 bg-card p-6">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">text-generate</p>
        <div className="flex flex-1 items-center justify-center py-6">
          <TextGenerate
            text="光标跟着句子往下写"
            duration={480}
            delay={60}
            align="center"
            fontWeight={600}
            className="min-h-0 text-center text-2xl font-semibold leading-snug text-foreground sm:text-3xl"
          />
        </div>
        <DocLink href="/docs/text-generate" />
      </article>

      <div className="flex min-w-0 flex-col justify-between gap-4">
        <KineticScrambleText
          text="乱码慢慢还原"
          pace={0.8}
          intensity={0.4}
          charset="symbols"
          className="min-h-[220px] flex-1"
        />
        <DocLink href="/docs/kinetic-scramble-text" />
      </div>

      <article className="flex min-h-[240px] min-w-0 flex-col rounded-2xl border border-border/80 bg-card p-6">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">text-rotate</p>
        <div className="flex flex-1 items-center justify-center py-6 text-center">
          {live && !reduced ? (
            <TextRotate
              texts={[...rotateLines]}
              interval={3400}
              animation="slide"
              align="center"
              fontWeight={600}
              className="text-2xl font-semibold text-foreground sm:text-3xl"
            />
          ) : (
            <p className="text-2xl font-semibold text-foreground sm:text-3xl">{rotateLines[0]}</p>
          )}
        </div>
        <DocLink href="/docs/text-rotate" />
      </article>
    </div>
  )
}

function CardPanel() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <HoverLiftGlow lift={6} glow={0.45} className="h-full bg-card p-6">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">hover-lift-glow</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-card-foreground">抬起一点，光留在边缘</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          指针或键盘焦点经过时卡片上浮。标题和说明保持静止，不会被光晕盖住。
        </p>
        <div className="mt-6">
          <DocLink href="/docs/hover-lift-glow" />
        </div>
      </HoverLiftGlow>

      <GlassCard className="flex h-full flex-col bg-card/90 p-6 text-card-foreground">
        <p className="font-mono text-[11px] tracking-wide text-muted-foreground">glass-card</p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight">磨砂只在表面</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          玻璃叠色停在卡片边缘，正文用主题前景色，浅色和深色都能读完。
        </p>
        <div className="mt-6">
          <DocLink href="/docs/glass-card" />
        </div>
      </GlassCard>
    </div>
  )
}

function EdgeCopy({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed opacity-80">{body}</p>
    </div>
  )
}

function BorderPanel({ live, reduced }: { live: boolean; reduced: boolean }) {
  const edgeBody = (
    <>
      <p className="font-mono text-[11px] tracking-wide text-muted-foreground">glowing-edge</p>
      <EdgeCopy title="一圈慢光，字在中间" body="描边在走，卡片里的句子保持不动。" />
    </>
  )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="min-w-0">
        <ElectricBorder speed={0.35} intensity={0.4} color="#c4b5fd" className="h-full">
          <div className="px-2 pt-2">
          <p className="font-mono text-[11px] tracking-[0.18em] text-white/65">electric-border</p>
          <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">电流只走边，不盖住字</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/75">深色标本里的标题保持纯白。离开视口后电流停下。</p>
          <div className="mt-6">
            <Link
              href="/docs/electric-border"
              className={cn(
                "inline-flex w-fit items-center gap-1 rounded-sm text-xs font-medium text-white underline decoration-white/40 underline-offset-4",
                focusRing,
                "focus-visible:ring-offset-zinc-950",
              )}
            >
              查看文档
              <ArrowRight className="size-3" />
            </Link>
          </div>
          </div>
        </ElectricBorder>
      </div>

      {live && !reduced ? (
        <GlowingEdge duration={14000} className="h-full">
          <div className="flex min-h-[200px] flex-col justify-between">
            {edgeBody}
            <div className="mt-6">
              <DocLink href="/docs/glowing-edge" />
            </div>
          </div>
        </GlowingEdge>
      ) : (
        <div className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-border bg-card p-5 text-card-foreground">
          {edgeBody}
          <div className="mt-6">
            <DocLink href="/docs/glowing-edge" />
          </div>
        </div>
      )}
    </div>
  )
}

function ButtonPanel() {
  const router = useRouter()

  return (
    <div className="flex min-h-[220px] flex-wrap items-center justify-center gap-x-10 gap-y-8 rounded-2xl border border-border/80 bg-card/80 px-6 py-12">
      <div className="flex flex-col items-center gap-3">
        <NeonButton
          scale={0.55}
          className={cn("rounded-lg", focusRing, "focus-visible:ring-offset-background")}
          onClick={() => router.push("/docs")}
        >
          探索全部组件
        </NeonButton>
        <span className="font-mono text-xs text-muted-foreground">neon-button</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <JellyButton
          label="按一下回弹"
          size={44}
          className="focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
        <DocLink href="/docs/jelly-button" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/docs"
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted",
            focusRing,
          )}
        >
          浏览文档
        </Link>
        <span className="font-mono text-xs text-muted-foreground">outline</span>
      </div>
    </div>
  )
}

function ShowcasePanel({
  tab,
  live,
  reduced,
}: {
  tab: ShowcaseTab
  live: boolean
  reduced: boolean
}) {
  if (tab === "text") return <TextPanel live={live} reduced={reduced} />
  if (tab === "card") return <CardPanel />
  if (tab === "border") return <BorderPanel live={live} reduced={reduced} />
  return <ButtonPanel />
}

export function HomeShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("text")
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(sectionRef)
  return (
    <section
      ref={sectionRef}
      id="showcase"
      data-home-zone="showcase"
      data-motion={reduced ? "off" : live ? "live" : "paused"}
      className="relative scroll-mt-16 overflow-hidden border-t border-border/50 py-16 sm:py-24"
    >
      <HomeSectionBackdrop variant="showcase" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">LIVE DEMO</span>
          <h2 className="mt-2 text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            精选特效实时体验
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            零黑盒、纯源码交付。你可以直接在浏览器中感受其细腻流畅的动效质感。
          </p>

          <div
            role="tablist"
            aria-label="特效分类"
            className="relative mt-8 flex flex-wrap items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 p-1"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const selected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`showcase-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="showcase-panel"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors",
                    focusRing,
                    selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {selected ? (
                    reduced ? (
                      <span className="absolute inset-0 rounded-lg bg-background shadow-xs" />
                    ) : (
                      <motion.span
                        layoutId="home-showcase-tab"
                        className="absolute inset-0 rounded-lg bg-background shadow-xs"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )
                  ) : null}
                  <Icon className="relative z-10 size-3.5" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="relative mt-10 overflow-hidden rounded-3xl border border-border/70 bg-background/70 p-4 sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_6%,transparent),transparent)]"
          />
          <div
            key={activeTab}
            id="showcase-panel"
            role="tabpanel"
            aria-labelledby={`showcase-tab-${activeTab}`}
            className="relative"
          >
            <ShowcasePanel tab={activeTab} live={live} reduced={reduced} />
          </div>
        </div>
      </div>
    </section>
  )
}
