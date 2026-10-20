"use client"

import { AtroposCard } from "../effects/atropos-card"
import { BurstIcons } from "../effects/burst-icons"
import { CanvasReveal } from "../effects/canvas-reveal"
import { EvervaultCard } from "../effects/evervault-card"
import { GpgpuParticles } from "../effects/gpgpu-particles"
import { Iridescence } from "../effects/iridescence"
import { LetterGlitchWall } from "../effects/letter-glitch-wall"
import { Lightning } from "../effects/lightning"
import { MarqueeAlongSvgPath } from "../effects/marquee-along-svg-path"
import { MouseFlowmap } from "../effects/mouse-flowmap"
import { PixelCanvasCard } from "../effects/pixel-canvas-card"
import { PolylineRibbonCursor } from "../effects/polyline-ribbon-cursor"
import { RoughAnnotation } from "../effects/rough-annotation"
import { Silk } from "../effects/silk"
import { TargetCursor } from "../effects/target-cursor"
import { VfxElement } from "../effects/vfx-element"

export function VfxElementDemo() {
  return (
    <VfxElement className="w-full" effects={["glitch", "rgb-shift", "crt"]}>
      <p className="font-display text-4xl">effect-ui</p>
    </VfxElement>
  )
}

export function MouseFlowmapDemo() {
  return <MouseFlowmap className="h-56 w-full" />
}

export function GpgpuParticlesDemo() {
  return <GpgpuParticles className="h-56 w-full" text="effect-ui" />
}

export function PolylineRibbonCursorDemo() {
  return <PolylineRibbonCursor className="h-56 w-full" />
}

export function PixelCanvasCardDemo() {
  return (
    <PixelCanvasCard className="w-full max-w-sm">
      <p className="font-medium">Pixel Canvas</p>
      <p className="mt-1 text-sm text-muted-foreground">悬停点亮像素。</p>
    </PixelCanvasCard>
  )
}

export function AtroposCardDemo() {
  return <AtroposCard className="w-full" />
}

export function RoughAnnotationDemo() {
  return (
    <p className="text-lg">
      给 <RoughAnnotation type="highlight">重点词</RoughAnnotation> 加上手绘注释。
    </p>
  )
}

export function BurstIconsDemo() {
  return <BurstIcons />
}

export function MarqueeAlongSvgPathDemo() {
  return (
    <MarqueeAlongSvgPath className="h-44 w-full text-muted-foreground">
      <span className="rounded-full border bg-background px-3 py-1 text-xs">alpha</span>
      <span className="rounded-full border bg-background px-3 py-1 text-xs">beta</span>
      <span className="rounded-full border bg-background px-3 py-1 text-xs">gamma</span>
    </MarqueeAlongSvgPath>
  )
}

export function EvervaultCardDemo() {
  return <EvervaultCard className="w-full max-w-sm" text="SECURE" />
}

export function CanvasRevealDemo() {
  return (
    <CanvasReveal className="w-full">
      <p className="font-medium">点阵揭开</p>
      <p className="mt-1 text-sm text-muted-foreground">移动指针扩散涟漪。</p>
    </CanvasReveal>
  )
}

export function LetterGlitchWallDemo({
  rows = 8,
  cols = 18,
}: { rows?: number; cols?: number } = {}) {
  return <LetterGlitchWall className="h-48 w-full" rows={rows} cols={cols} />
}

export function TargetCursorDemo({ className = "w-full" }: { className?: string } = {}) {
  return <TargetCursor className={className} />
}

export function LightningDemo({ hue = 3.8 }: { hue?: number } = {}) {
  return <Lightning className="h-52 w-full" hue={hue} />
}

export function IridescenceDemo({ children = "虹彩噪声" }: { children?: string } = {}) {
  return (
    <Iridescence className="h-52 w-full">
      <div className="grid h-52 place-items-center text-sm text-white/80">{children}</div>
    </Iridescence>
  )
}

export function SilkDemo({ children = "丝绸褶皱" }: { children?: string } = {}) {
  return (
    <Silk className="h-52 w-full">
      <div className="grid h-52 place-items-center text-sm text-white/80">{children}</div>
    </Silk>
  )
}
