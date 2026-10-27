"use client"
import { EvervaultCard } from "../effects/evervault-card"
import { Iridescence } from "../effects/iridescence"
import { LetterGlitchWall } from "../effects/letter-glitch-wall"
import { Lightning } from "../effects/lightning"
import { Silk } from "../effects/silk"
import { TargetCursor } from "../effects/target-cursor"

export function EvervaultCardDemo({ interval, color, size, count, intensity }: { interval?: number; color?: string; size?: number; count?: number; intensity?: number } = {}) {
  return <EvervaultCard className="w-full max-w-sm" text="SECURE" interval={interval} color={color} size={size} count={count} intensity={intensity} />
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

export function TargetCursorDemo({
  className = "w-full",
  size = 28,
  color,
  speed,
  intensity,
}: {
  className?: string
  size?: number
  color?: string
  speed?: number
  intensity?: number
} = {}) {
  return <TargetCursor className={className} size={size} color={color} speed={speed} intensity={intensity} />
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
