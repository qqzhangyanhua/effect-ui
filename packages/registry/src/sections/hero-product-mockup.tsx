"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { ContainerScroll3D } from "@/components/ui/container-scroll-3d"
import { Macbook } from "@/components/ui/device-mockups"
import { GlowHover } from "@/components/ui/glow-hover"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { cn } from "@/lib/utils"

export interface HeroProductMockupProps {
  title?: string
  subtitle?: string
  ctaLabel?: string
  screen?: ReactNode
  className?: string
}

function DefaultScreen() {
  return (
    <div className="grid min-h-44 place-items-center bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_28%,transparent),#09090b_70%)] p-6">
      <div className="w-full max-w-sm space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left text-white">
        <p className="text-xs tracking-[0.2em] text-white/50 uppercase">Preview</p>
        <p className="font-display text-2xl">Product surface</p>
        <div className="h-2 w-2/3 rounded-full bg-white/20" />
        <div className="h-2 w-1/2 rounded-full bg-white/10" />
      </div>
    </div>
  )
}

function HeroProductMockup({
  title = "产品在滚动里抬起，带着光晕入场",
  subtitle = "设备框 + 辉光，滚动时 3D 抬头。组合 device-mockups、glow-hover 与 container-scroll-3d。",
  ctaLabel = "看演示",
  screen,
  className,
}: HeroProductMockupProps) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-background px-6 py-12", className)}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Hero Product</p>
        <h2 className="font-display mt-3 text-4xl tracking-tight text-balance">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-5 flex justify-center gap-2">
          <ShimmerButton>{ctaLabel}</ShimmerButton>
          <Button variant="outline">定价</Button>
        </div>
      </div>
      <div className="relative mx-auto mt-10 max-w-3xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-8 h-40 rounded-full bg-primary/35 blur-3xl"
        />
        <ContainerScroll3D title="Tilt up" className="relative">
          <GlowHover glowColor="var(--primary)" className="rounded-t-xl">
            <Macbook>{screen ?? <DefaultScreen />}</Macbook>
          </GlowHover>
        </ContainerScroll3D>
      </div>
    </section>
  )
}

export { HeroProductMockup }
