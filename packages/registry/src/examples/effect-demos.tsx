"use client"

import type { ReactNode } from "react"

import { AuroraBackground } from "../effects/aurora-background"
import { AuroraText } from "../effects/aurora-text"
import { CountUp } from "../effects/count-up"
import { CursorFollow } from "../effects/cursor-follow"
import { DotPattern } from "../effects/dot-pattern"
import { DotsLoader } from "../effects/dots-loader"
import { FlickeringGrid } from "../effects/flickering-grid"
import { FlipCard } from "../effects/flip-card"
import { GlassCard } from "../effects/glass-card"
import { GlowHover } from "../effects/glow-hover"
import { GradientText } from "../effects/gradient-text"
import { GridPattern } from "../effects/grid-pattern"
import { HighlightText } from "../effects/highlight-text"
import { HoverLift } from "../effects/hover-lift"
import { Magnetic } from "../effects/magnetic"
import { Meteors } from "../effects/meteors"
import { NeonButton } from "../effects/neon-button"
import { OrbitLoader } from "../effects/orbit-loader"
import { Particles } from "../effects/particles"
import { ProgressRing } from "../effects/progress-ring"
import { PulseButton } from "../effects/pulse-button"
import { Reveal } from "../effects/reveal"
import { RippleButton } from "../effects/ripple-button"
import { Ripples } from "../effects/ripples"
import { ShimmerButton } from "../effects/shimmer-button"
import { ShimmerText } from "../effects/shimmer-text"
import { ShineBorder } from "../effects/shine-border"
import { Spinner } from "../effects/spinner"
import { SplitText } from "../effects/split-text"
import { SpotlightCard } from "../effects/spotlight-card"
import { Tilt } from "../effects/tilt"
import { TypingText } from "../effects/typing-text"
import { Button } from "../ui/button"

function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border bg-card/40 p-8">
      {children}
    </div>
  )
}

export function TypingTextDemo({
  text = "把特效复制进你的项目",
  duration = 80,
  loop = true,
  cursor = true,
}: Partial<{
  text: string
  duration: number
  loop: boolean
  cursor: boolean
}> = {}) {
  return (
    <TypingText
      className="text-2xl"
      text={text}
      duration={duration}
      loop={loop}
      cursor={cursor}
    />
  )
}

export function GradientTextDemo() {
  return (
    <GradientText className="text-4xl font-semibold tracking-tight">
      Effect UI
    </GradientText>
  )
}

export function ShimmerTextDemo({ children = "扫光文字即将上线" }: { children?: string } = {}) {
  return <ShimmerText className="text-2xl font-medium">{children}</ShimmerText>
}

export function AuroraTextDemo({
  children = "极光标题",
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  speed,
}: {
  children?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
  speed?: number
} = {}) {
  return (
    <AuroraText
      className="text-4xl font-semibold"
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
      speed={speed}
    >
      {children}
    </AuroraText>
  )
}

export function SplitTextDemo({
  text = "逐字显现的标题",
  by = "char",
  delay = 0,
}: {
  text?: string
  by?: "char" | "word"
  delay?: number
} = {}) {
  return <SplitText className="text-3xl font-medium" text={text} by={by} delay={delay} />
}

export function HighlightTextDemo({
  children = "关键句",
  color,
  duration,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  children?: string
  color?: string
  duration?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <p className="text-xl">
      把{" "}
      <HighlightText
        color={color}
        duration={duration}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        align={align}
      >
        {children}
      </HighlightText>{" "}
      用底纹强调出来
    </p>
  )
}

export function CountUpDemo({
  value = 1280,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  value?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <div className="flex items-end gap-2">
      <CountUp
        className="text-5xl font-semibold"
        value={value}
        direction={direction}
        delay={delay}
        decimalPlaces={decimalPlaces}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        align={align}
      />
      <span className="pb-1 text-muted-foreground">components</span>
    </div>
  )
}

export function ParticlesDemo({
  quantity = 80,
  staticity = 50,
  ease = 50,
  color = "#7c3aed",
}: {
  quantity?: number
  staticity?: number
  ease?: number
  color?: string
} = {}) {
  return (
    <PreviewFrame>
      <Particles quantity={quantity} staticity={staticity} ease={ease} color={color} />
      <p className="relative z-10 text-sm text-muted-foreground">移动指针，粒子会跟上</p>
    </PreviewFrame>
  )
}

export function GridPatternDemo({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
}: {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: string
} = {}) {
  return (
    <PreviewFrame>
      <GridPattern width={width} height={height} x={x} y={y} strokeDasharray={strokeDasharray} />
      <p className="relative z-10 text-sm">网格底纹</p>
    </PreviewFrame>
  )
}

export function DotPatternDemo({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
}: {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
} = {}) {
  return (
    <PreviewFrame>
      <DotPattern width={width} height={height} cx={cx} cy={cy} cr={cr} />
      <p className="relative z-10 text-sm">圆点底纹</p>
    </PreviewFrame>
  )
}

export function MeteorsDemo({
  number = 18,
  speed = 1,
  color = undefined,
  size = 2,
}: {
  number?: number
  speed?: number
  color?: string
  size?: number
} = {}) {
  return (
    <PreviewFrame>
      <div className="absolute inset-0 bg-zinc-950" />
      <Meteors number={number} speed={speed} color={color} size={size} />
      <p className="relative z-10 text-sm text-zinc-100">流星雨</p>
    </PreviewFrame>
  )
}

export function AuroraBackgroundDemo({
  children = "极光铺在内容后面",
  speed = 1,
  intensity = 0.7,
  colors = undefined,
  size = 64,
}: {
  children?: string
  speed?: number
  intensity?: number
  colors?: string[]
  size?: number
} = {}) {
  return (
    <AuroraBackground
      speed={speed}
      intensity={intensity}
      colors={colors}
      size={size}
      className="flex min-h-48 w-full items-center justify-center p-10"
    >
      <p className="text-lg font-medium">{children}</p>
    </AuroraBackground>
  )
}

export function RipplesDemo({
  rings = 4,
  speed = 1,
  color = undefined,
  intensity = 0.2,
}: {
  rings?: number
  speed?: number
  color?: string
  intensity?: number
} = {}) {
  return (
    <PreviewFrame>
      <Ripples rings={rings} speed={speed} color={color} intensity={intensity} />
      <p className="relative z-10 text-sm">涟漪扩散</p>
    </PreviewFrame>
  )
}

export function FlickeringGridDemo({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.18,
  color = undefined,
  maxOpacity = 0.28,
}: {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  maxOpacity?: number
} = {}) {
  return (
    <PreviewFrame>
      <FlickeringGrid
        squareSize={squareSize}
        gridGap={gridGap}
        flickerChance={flickerChance}
        color={color}
        maxOpacity={maxOpacity}
      />
      <p className="relative z-10 text-sm">闪烁网格</p>
    </PreviewFrame>
  )
}

export function SpotlightCardDemo() {
  return (
    <SpotlightCard className="w-full max-w-sm">
      <h3 className="text-lg font-medium">Spotlight</h3>
      <p className="mt-2 text-sm text-muted-foreground">指针移上去，光斑会跟着走。</p>
    </SpotlightCard>
  )
}

export function MagneticDemo({ strength = 0.35 }: { strength?: number } = {}) {
  return (
    <Magnetic strength={strength}>
      <Button>磁性按钮</Button>
    </Magnetic>
  )
}

export function CursorFollowDemo() {
  return (
    <CursorFollow className="flex min-h-48 w-full items-center justify-center rounded-xl border bg-zinc-950 text-zinc-100">
      <p>在区域内移动指针</p>
    </CursorFollow>
  )
}

export function TiltDemo({ maxTilt = 12 }: { maxTilt?: number } = {}) {
  return (
    <Tilt className="w-full max-w-sm" maxTilt={maxTilt}>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-medium">3D Tilt</h3>
        <p className="mt-2 text-sm text-muted-foreground">指针移动时卡片会倾斜。</p>
      </div>
    </Tilt>
  )
}

export function GlowHoverDemo() {
  return (
    <GlowHover className="w-full max-w-sm border bg-card p-6">
      <h3 className="font-medium">Glow Hover</h3>
      <p className="mt-2 text-sm text-muted-foreground">悬停时出现柔光和上浮。</p>
    </GlowHover>
  )
}

export function FlipCardDemo() {
  return (
    <FlipCard
      className="h-44 w-72"
      front={
        <div className="flex h-full items-center justify-center rounded-xl border bg-card">
          正面 · 悬停翻转
        </div>
      }
      back={
        <div className="flex h-full items-center justify-center rounded-xl border bg-primary text-primary-foreground">
          背面 · 更多细节
        </div>
      }
    />
  )
}

export function GlassCardDemo() {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-linear-to-br from-violet-600 to-cyan-500 p-8">
      <GlassCard>
        <h3 className="font-medium">Glass</h3>
        <p className="mt-2 text-sm text-foreground/80">毛玻璃叠在彩色背景上。</p>
      </GlassCard>
    </div>
  )
}

export function ShineBorderDemo() {
  return (
    <ShineBorder className="w-full max-w-sm">
      <h3 className="font-medium">Shine Border</h3>
      <p className="mt-2 text-sm text-muted-foreground">描边高光持续旋转。</p>
    </ShineBorder>
  )
}

export function HoverLiftDemo() {
  return (
    <HoverLift className="w-full max-w-sm">
      <h3 className="font-medium">Hover Lift</h3>
      <p className="mt-2 text-sm text-muted-foreground">悬停抬起并加深阴影。</p>
    </HoverLift>
  )
}

export function RippleButtonDemo() {
  return <RippleButton>点击出现波纹</RippleButton>
}

export function ShimmerButtonDemo() {
  return <ShimmerButton>Shimmer</ShimmerButton>
}

export function PulseButtonDemo() {
  return <PulseButton>脉冲</PulseButton>
}

export function NeonButtonDemo() {
  return <NeonButton>Neon</NeonButton>
}

export function SpinnerDemo() {
  return <Spinner />
}

export function OrbitLoaderDemo() {
  return <OrbitLoader />
}

export function DotsLoaderDemo() {
  return <DotsLoader />
}

export function ProgressRingDemo() {
  return <ProgressRing value={72} />
}

export function RevealDemo() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <Reveal variant="fade" className="rounded-xl border bg-card p-4">
        淡入
      </Reveal>
      <Reveal variant="blur" delay={0.05} className="rounded-xl border bg-card p-4">
        模糊显现
      </Reveal>
      <Reveal variant="slide" from="left" delay={0.1} className="rounded-xl border bg-card p-4">
        从左滑入
      </Reveal>
      <Reveal as="section" variant="clip" delay={0.15} className="rounded-xl border bg-card p-4">
        裁切揭开
      </Reveal>
    </div>
  )
}


