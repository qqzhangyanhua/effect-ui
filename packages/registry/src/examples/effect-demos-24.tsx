"use client"

import { Bell, User } from "lucide-react"

import { AnimatedBackground } from "../effects/animated-background"
import { BorderTrail } from "../effects/border-trail"
import { ComicText } from "../effects/comic-text"
import { CoolMode } from "../effects/cool-mode"
import { Disclosure, DisclosureContent, DisclosureTrigger } from "../effects/disclosure"
import { FeedbackWidget } from "../effects/feedback-widget"
import { GeoPatterns } from "../effects/geo-patterns"
import { GlowEffect } from "../effects/glow-effect"
import { NeonGradientCard } from "../effects/neon-gradient-card"
import { PixelImage } from "../effects/pixel-image"
import { TextShimmerWave } from "../effects/text-shimmer-wave"
import { ToolbarDynamic } from "../effects/toolbar-dynamic"
import { ToolbarExpandable } from "../effects/toolbar-expandable"

const pixelSrc =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="640" height="360" fill="url(#g)"/><circle cx="220" cy="150" r="70" fill="#fde68a"/></svg>',
  )

export function ComicTextDemo() {
  return <ComicText className="py-8">北窗</ComicText>
}

export function NeonGradientCardDemo({
  colors = ["#ff00aa", "#00fff1"],
  borderSize = 2,
  borderRadius = 20,
}: { colors?: readonly string[]; borderSize?: number; borderRadius?: number } = {}) {
  return (
    <NeonGradientCard className="max-w-md" colors={colors} borderSize={borderSize} borderRadius={borderRadius}>
      <p className="text-sm">霓虹边框里的内容</p>
    </NeonGradientCard>
  )
}

export function CoolModeDemo() {
  return (
    <CoolMode>
      <button type="button" className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground">
        按住喷发
      </button>
    </CoolMode>
  )
}

export function PixelImageDemo({
  rows = 4,
  cols = 6,
  duration = 0.8,
}: { rows?: number; cols?: number; duration?: number } = {}) {
  return <PixelImage className="h-64 max-w-xl" cols={cols} duration={duration} rows={rows} src={pixelSrc} />
}

export function GeoPatternsDemo({
  variant = "hexagon",
  direction = "left",
  gap = 8,
}: {
  variant?: "hexagon" | "striped"
  direction?: "left" | "right" | "up" | "down"
  gap?: number
} = {}) {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border bg-background">
      <GeoPatterns variant={variant} direction={direction} gap={gap} highlights={[[1, 1], [3, 2]]} />
    </div>
  )
}

export function BorderTrailDemo({
  duration = 4,
  radius = 16,
  size = 14,
}: { duration?: number; radius?: number; size?: number } = {}) {
  return (
    <BorderTrail className="max-w-sm rounded-2xl" duration={duration} radius={radius} size={size}>
      <div className="rounded-2xl border bg-card px-6 py-8 text-sm">圆点沿着圆角走</div>
    </BorderTrail>
  )
}

export function GlowEffectDemo({
  duration = 5,
  mode = "rotate",
  scale = 1,
}: {
  duration?: number
  mode?: "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static"
  scale?: number
} = {}) {
  return (
    <div className="relative h-48 w-full max-w-md">
      <GlowEffect duration={duration} mode={mode} scale={scale} />
      <div className="absolute inset-8 grid place-items-center rounded-xl bg-background text-sm">背后的辉光</div>
    </div>
  )
}

export function TextShimmerWaveDemo({
  children = "波动闪光",
  duration = 1.4,
  yDistance = -6,
}: { children?: string; duration?: number; yDistance?: number } = {}) {
  return (
    <TextShimmerWave duration={duration} yDistance={yDistance}>
      {children}
    </TextShimmerWave>
  )
}

export function ToolbarDynamicDemo() {
  return (
    <ToolbarDynamic
      items={[
        { id: "user", label: "账户", icon: <User className="size-5" /> },
        { id: "bell", label: "通知", icon: <Bell className="size-5" /> },
      ]}
    />
  )
}

export function ToolbarExpandableDemo() {
  return (
    <ToolbarExpandable
      items={[
        { id: "user", label: "账户", icon: <User className="size-5" />, content: <p>北窗账户</p> },
        { id: "bell", label: "通知", icon: <Bell className="size-5" />, content: <p>3 条新消息</p> },
      ]}
    />
  )
}

export function AnimatedBackgroundDemo() {
  return (
    <AnimatedBackground defaultValue="one">
      <button type="button" data-id="one" className="rounded-lg px-3 py-2 text-sm">
        其一
      </button>
      <button type="button" data-id="two" className="rounded-lg px-3 py-2 text-sm">
        其二
      </button>
    </AnimatedBackground>
  )
}

export function DisclosureDemo() {
  return (
    <Disclosure className="max-w-md rounded-xl border px-3">
      <DisclosureTrigger>展开说明</DisclosureTrigger>
      <DisclosureContent>
        <p className="pb-3 text-sm text-muted-foreground">这里是一段可以收起的说明。</p>
      </DisclosureContent>
    </Disclosure>
  )
}

export function FeedbackWidgetDemo() {
  return (
    <div className="relative h-80 w-full">
      <FeedbackWidget className="absolute right-4 bottom-4" onSubmit={() => {}} />
    </div>
  )
}
