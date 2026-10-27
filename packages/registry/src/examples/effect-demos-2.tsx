"use client"
import { FloatingNavbar } from "../effects/floating-navbar"
import { GlobeSphere } from "../effects/globe-sphere"
import { GooeyButton } from "../effects/gooey-button"
import { NoiseGradient } from "../effects/noise-gradient"
import { PerspectiveCard } from "../effects/perspective-card"
import { TextRotate } from "../effects/text-rotate"
import { WaveBackground } from "../effects/wave-background"

export function TextRotateDemo({
  interval = 1800,
  animation = "slide",
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  interval?: number
  animation?: "slide" | "blur" | "glyph"
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TextRotate
      texts={["Motion", "Tailwind", "Registry"]}
      interval={interval}
      animation={animation}
      className="text-2xl font-semibold"
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function WaveBackgroundDemo({
  speed = 1,
  color,
  intensity = 0.25,
  size = 112,
}: {
  speed?: number
  color?: string
  intensity?: number
  size?: number
} = {}) {
  return (
    <WaveBackground
      className="flex min-h-40 w-full items-center justify-center p-8"
      speed={speed}
      color={color}
      intensity={intensity}
      size={size}
    >
      波浪背景
    </WaveBackground>
  )
}

export function NoiseGradientDemo({
  colors = ["#7c3aed", "#d946ef", "#22d3ee"],
  angle = 135,
  intensity = 0.25,
  scale = 1,
}: {
  colors?: string[]
  angle?: number
  intensity?: number
  scale?: number
} = {}) {
  return (
    <NoiseGradient
      className="flex min-h-40 w-full items-center justify-center p-8 text-white"
      colors={colors}
      angle={angle}
      intensity={intensity}
      scale={scale}
    >
      噪点渐变
    </NoiseGradient>
  )
}
export function GlobeSphereDemo({ dots, duration, size, color }: { dots?: number; duration?: number; size?: number; color?: string } = {}) {
  return <GlobeSphere className="[transform-style:preserve-3d]" dots={dots} duration={duration} size={size} color={color} />
}

export function PerspectiveCardDemo({ angle, size }: { angle?: number; size?: number } = {}) {
  return (
    <PerspectiveCard className="w-72" angle={angle} size={size}>
      <h3 className="font-medium">Perspective</h3>
      <p className="mt-2 text-sm text-muted-foreground">指针移动时透视倾斜。</p>
    </PerspectiveCard>
  )
}

export function GooeyButtonDemo({ scale, intensity }: { scale?: number; intensity?: number } = {}) {
  return <GooeyButton scale={scale} intensity={intensity}>Gooey</GooeyButton>
}

export function FloatingNavbarDemo({ duration, intensity }: { duration?: number; intensity?: number } = {}) {
  return (
    <div className="h-40 w-full overflow-auto rounded-xl border">
      <FloatingNavbar duration={duration} intensity={intensity}>
        <span className="text-sm">Home</span>
        <span className="text-sm">Docs</span>
      </FloatingNavbar>
      <div className="h-64 p-4 text-sm text-muted-foreground">向下滚动，导航会收起。</div>
    </div>
  )
}
