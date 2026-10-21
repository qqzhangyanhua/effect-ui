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

export function GpgpuParticlesDemo({
  count = 1400,
  text = "effect-ui",
  speed = 1,
  size = 2.4,
}: {
  count?: number
  text?: string
  speed?: number
  size?: number
} = {}) {
  return <GpgpuParticles className="h-56 w-full" count={count} text={text} speed={speed} size={size} />
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
  speed = 1,
  color,
}: {
  rows?: number
  cols?: number
  speed?: number
  color?: string
} = {}) {
  return <LetterGlitchWall className="h-48 w-full" rows={rows} cols={cols} speed={speed} color={color} />
}

export function TargetCursorDemo({ className = "w-full" }: { className?: string } = {}) {
  return <TargetCursor className={className} />
}

export function LightningDemo({
  hue = 3.8,
  speed = 1,
  intensity = 1,
  count = 4,
}: {
  hue?: number
  speed?: number
  intensity?: number
  count?: number
} = {}) {
  return <Lightning className="h-52 w-full" hue={hue} speed={speed} intensity={intensity} count={count} />
}

export function IridescenceDemo({
  children = "虹彩噪声",
  speed = 1,
  scale = 1,
  intensity = 0.85,
  color,
}: {
  children?: string
  speed?: number
  scale?: number
  intensity?: number
  color?: string
} = {}) {
  return (
    <Iridescence className="h-52 w-full" speed={speed} scale={scale} intensity={intensity} color={color}>
      <div className="grid h-52 place-items-center text-sm text-white/80">{children}</div>
    </Iridescence>
  )
}

export function SilkDemo({
  children = "丝绸褶皱",
  colors = ["#120d1f", "#472e6b", "#c7b8db"],
  speed = 1,
  scale = 1,
  intensity = 0.35,
}: {
  children?: string
  colors?: string[]
  speed?: number
  scale?: number
  intensity?: number
} = {}) {
  return (
    <Silk className="h-52 w-full" colors={colors} speed={speed} scale={scale} intensity={intensity}>
      <div className="grid h-52 place-items-center text-sm text-white/80">{children}</div>
    </Silk>
  )
}
