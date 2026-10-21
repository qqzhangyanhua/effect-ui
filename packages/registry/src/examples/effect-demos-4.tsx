"use client"

import { useState, type ReactNode } from "react"
import { Github, Sparkles, SwatchBook, Zap } from "lucide-react"

import { AnimatedThemeToggler } from "../effects/animated-theme-toggler"
import { BackgroundPaths } from "../effects/background-paths"
import { GlitchText } from "../effects/glitch-text"
import { IconCloud } from "../effects/icon-cloud"
import { ImageTrail } from "../effects/image-trail"
import { LiquidGlass } from "../effects/liquid-glass"
import {
  MarketingFooter,
  MarketingHero,
  MarketingPricing,
  MarketingTestimonials,
} from "../effects/marketing-blocks"
import { NumberFlow } from "../effects/number-flow"
import { ShaderBackground } from "../effects/shader-backgrounds"
import { Terminal } from "../effects/terminal"

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border bg-card/40 p-6 ${className ?? ""}`}>
      {children}
    </div>
  )
}

const swatch = (color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="16" fill="${color}"/></svg>`)}`

export function ShaderBackgroundsDemo({
  variant = "mesh",
  colors,
  speed = 1,
  scale = 1,
}: {
  variant?: "mesh" | "grain" | "dithering" | "metaballs" | "warp"
  colors?: string[]
  speed?: number
  scale?: number
} = {}) {
  return (
    <ShaderBackground variant={variant} colors={colors} speed={speed} scale={scale} className="h-56 w-full rounded-xl">
      <div className="flex h-56 items-end p-4 text-sm text-white/80">{variant}</div>
    </ShaderBackground>
  )
}

export function LiquidGlassDemo({ intensity, size }: { intensity?: number; size?: number } = {}) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#7c3aed,transparent_40%),radial-gradient(circle_at_80%_70%,#22d3ee,transparent_35%)]" />
      <div className="relative flex min-h-48 items-center justify-center p-8">
        <LiquidGlass intensity={intensity} size={size}>液态玻璃 · 不支持时回退毛玻璃</LiquidGlass>
      </div>
    </div>
  )
}

export function BackgroundPathsDemo({
  count = 10,
  color,
  intensity = 0.45,
  speed = 1,
  duration = 2400,
}: {
  count?: number
  color?: string
  intensity?: number
  speed?: number
  duration?: number
} = {}) {
  return (
    <Frame className="p-0">
      <BackgroundPaths
        className="h-56 w-full"
        count={count}
        color={color}
        intensity={intensity}
        speed={speed}
        duration={duration}
      />
    </Frame>
  )
}

export function NumberFlowDemo({
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  const [value, setValue] = useState(1280)
  return (
    <Frame>
      <button
        type="button"
        className="text-4xl font-semibold tabular-nums"
        onClick={() => setValue((current) => (current === 1280 ? 4860 : 1280))}
      >
        <NumberFlow
          value={value}
          format={{ style: "currency", currency: "USD" }}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          align={align}
        />
      </button>
    </Frame>
  )
}

export function GlitchTextDemo({ text = "GLITCH" }: { text?: string } = {}) {
  return (
    <Frame>
      <GlitchText className="text-4xl font-semibold" text={text} />
    </Frame>
  )
}

export function ImageTrailDemo({
  gap,
  count,
  size,
  intensity,
}: {
  gap?: number
  count?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <ImageTrail
      className="h-56 w-full rounded-xl border bg-muted/30"
      images={[swatch("#7c3aed"), swatch("#22d3ee"), swatch("#f472b6"), swatch("#f59e0b")]}
      gap={gap}
      count={count}
      size={size}
      intensity={intensity}
    />
  )
}

export function IconCloudDemo({ duration, size, scale }: { duration?: number; size?: number; scale?: number } = {}) {
  return (
    <Frame>
      <IconCloud
        duration={duration}
        size={size}
        scale={scale}
        icons={[
          <Github key="gh" className="size-4" />,
          <Sparkles key="sp" className="size-4" />,
          <Zap key="zp" className="size-4" />,
          <SwatchBook key="sw" className="size-4" />,
          <Github key="gh2" className="size-4" />,
          <Sparkles key="sp2" className="size-4" />,
          <Zap key="zp2" className="size-4" />,
          <SwatchBook key="sw2" className="size-4" />,
        ]}
      />
    </Frame>
  )
}

export function AnimatedThemeTogglerDemo({ duration }: { duration?: number } = {}) {
  return (
    <Frame>
      <AnimatedThemeToggler duration={duration} />
    </Frame>
  )
}

export function MarketingBlocksDemo() {
  return (
    <div className="w-full space-y-4">
      <MarketingHero variant="aurora" />
      <MarketingPricing variant="featured" />
      <MarketingTestimonials variant="grid" />
      <MarketingFooter variant="columns" />
    </div>
  )
}

export function TerminalDemo({ interval, color }: { interval?: number; color?: string } = {}) {
  return (
    <Terminal
      className="w-full max-w-lg"
      lines={["pnpm add @effect-ui/registry", "pnpm registry:build", "npx shadcn add ./r/terminal.json"]}
      interval={interval}
      color={color}
    />
  )
}
