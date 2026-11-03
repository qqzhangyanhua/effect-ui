"use client"

import { AuroraBackground } from "../effects/aurora-background"
import { GlassCard } from "../effects/glass-card"
import { NeonButton } from "../effects/neon-button"
import { Spinner } from "../effects/spinner"

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

export function GlassCardDemo({ intensity, size }: { intensity?: number; size?: number } = {}) {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-linear-to-br from-violet-600 to-cyan-500 p-8">
      <GlassCard intensity={intensity} size={size}>
        <h3 className="font-medium">Glass</h3>
        <p className="mt-2 text-sm text-foreground/80">毛玻璃叠在彩色背景上。</p>
      </GlassCard>
    </div>
  )
}

export function NeonButtonDemo({ glowColor, scale }: { glowColor?: string; scale?: number } = {}) {
  return <NeonButton glowColor={glowColor} scale={scale}>Neon</NeonButton>
}

export function SpinnerDemo({ size, duration, color }: { size?: number; duration?: number; color?: string } = {}) {
  return <Spinner size={size} duration={duration} color={color} />
}
