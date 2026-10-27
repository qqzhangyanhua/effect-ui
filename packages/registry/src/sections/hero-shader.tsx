"use client"

import * as React from "react"

import { AuroraBackground } from "@/components/ui/aurora-background"
import { Iridescence } from "@/components/ui/iridescence"
import { Lightning } from "@/components/ui/lightning"
import { Silk } from "@/components/ui/silk"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type HeroShaderBackground = "silk" | "iridescence" | "lightning" | "mesh" | "aurora"

export interface HeroShaderProps {
  title?: string
  subtitle?: string
  ctaLabel?: string
  secondaryLabel?: string
  backgroundVariant?: HeroShaderBackground
  background?: React.ReactNode
  className?: string
}

const layer = "absolute inset-0 size-full min-h-0 rounded-none border-0"

function ShaderSlot({
  variant,
  background,
  reduced,
}: {
  variant: HeroShaderBackground
  background?: React.ReactNode
  reduced: boolean
}) {
  if (reduced) {
    return <div className="absolute inset-0 bg-[linear-gradient(135deg,#1e1b4b,#4c1d95,#0f172a)]" />
  }
  if (background) {
    return <div className="absolute inset-0">{background}</div>
  }
  if (variant === "iridescence") return <Iridescence className={layer} />
  if (variant === "lightning") return <Lightning className={layer} />
  if (variant === "mesh") {
    return <div className={cn(layer, "bg-[linear-gradient(135deg,#312e81,#7c3aed_45%,#22d3ee,#0f172a)]")} />
  }
  if (variant === "aurora") return <AuroraBackground className={layer} />
  return <Silk className={layer} />
}

function HeroShader({
  title = "Shaders, blocks, and a copy-paste registry",
  subtitle = "切换背景槽：Silk / Iridescence / Lightning / Mesh / Aurora。减弱动效时回退静态渐变。",
  ctaLabel = "开始使用",
  secondaryLabel = "查看文档",
  backgroundVariant = "silk",
  background,
  className,
}: HeroShaderProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <section
      className={cn(
        "relative isolate min-h-[28rem] overflow-hidden rounded-2xl border text-white",
        className,
      )}
    >
      <ShaderSlot variant={backgroundVariant} background={background} reduced={reduced} />
      <div className="pointer-events-none absolute inset-0 bg-zinc-950/35" />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-20 text-center">
        <p className="text-xs tracking-[0.28em] text-white/60 uppercase">Hero Shader</p>
        <h2 className="font-display text-4xl tracking-tight text-balance sm:text-5xl">
          <span className="inline-flex justify-center gap-x-2">{title}</span>
        </h2>
        <p className="max-w-lg text-sm text-white/70">{subtitle}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md border border-white/25 bg-white/5 px-4 text-sm text-white hover:bg-white/10 hover:text-white"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

export { HeroShader }
