"use client"

import { CursorFollow } from "../effects/cursor-follow"
import { CursorTrail } from "../effects/cursor-trail"
import { GlowHover } from "../effects/glow-hover"
import { Magnetic } from "../effects/magnetic"
import { SpotlightCard } from "../effects/spotlight-card"
import { Tilt } from "../effects/tilt"
import { Button } from "../ui/button"

export function SpotlightCardDemo({
  spotlightColor,
  radius = 240,
  speed,
  intensity,
}: {
  spotlightColor?: string
  radius?: number
  speed?: number
  intensity?: number
} = {}) {
  return (
    <SpotlightCard
      className="w-full max-w-sm"
      spotlightColor={spotlightColor}
      radius={radius}
      speed={speed}
      intensity={intensity}
    >
      <h3 className="text-lg font-medium">Spotlight</h3>
      <p className="mt-2 text-sm text-muted-foreground">指针移上去，光斑会跟着走。</p>
    </SpotlightCard>
  )
}

export function MagneticDemo({
  strength = 0.35,
  speed,
  intensity,
  scale,
}: {
  strength?: number
  speed?: number
  intensity?: number
  scale?: number
} = {}) {
  return (
    <Magnetic strength={strength} speed={speed} intensity={intensity} scale={scale}>
      <Button>磁性按钮</Button>
    </Magnetic>
  )
}

export function CursorFollowDemo({
  size = 28,
  color,
  speed,
  intensity,
}: {
  size?: number
  color?: string
  speed?: number
  intensity?: number
} = {}) {
  return (
    <CursorFollow
      className="flex min-h-48 w-full items-center justify-center rounded-xl border bg-zinc-950 text-zinc-100"
      size={size}
      color={color}
      speed={speed}
      intensity={intensity}
    >
      <p>在区域内移动指针</p>
    </CursorFollow>
  )
}

export function TiltDemo({
  maxTilt = 12,
  speed,
  intensity,
  scale,
}: {
  maxTilt?: number
  speed?: number
  intensity?: number
  scale?: number
} = {}) {
  return (
    <Tilt className="w-full max-w-sm" maxTilt={maxTilt} speed={speed} intensity={intensity} scale={scale}>
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-medium">3D Tilt</h3>
        <p className="mt-2 text-sm text-muted-foreground">指针移动时卡片会倾斜。</p>
      </div>
    </Tilt>
  )
}

export function GlowHoverDemo({
  glowColor,
  speed,
  intensity,
  size,
}: {
  glowColor?: string
  speed?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <GlowHover className="w-full max-w-sm border bg-card p-6" glowColor={glowColor} speed={speed} intensity={intensity} size={size}>
      <h3 className="font-medium">Glow Hover</h3>
      <p className="mt-2 text-sm text-muted-foreground">悬停时出现柔光和上浮。</p>
    </GlowHover>
  )
}

export function CursorTrailDemo({
  dots = 8,
  size,
  color,
  intensity,
}: {
  dots?: number
  size?: number
  color?: string
  intensity?: number
} = {}) {
  return (
    <CursorTrail
      className="flex min-h-40 w-full items-center justify-center rounded-xl border"
      dots={dots}
      size={size}
      color={color}
      intensity={intensity}
    >
      <p className="text-sm text-muted-foreground">在区域内移动指针</p>
    </CursorTrail>
  )
}
