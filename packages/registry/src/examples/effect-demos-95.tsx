"use client"

import { MorphMegaMenu } from "../effects/morph-mega-menu"
import { ThemeRevealToggle } from "../effects/theme-reveal-toggle"

export function ThemeRevealToggleDemo({
  duration = 640,
  size = 44,
  color,
}: {
  duration?: number
  size?: number
  color?: string
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ThemeRevealToggle duration={duration} size={size} color={color} />
    </div>
  )
}

export function MorphMegaMenuDemo({
  duration = 400,
  intensity = 0.55,
  size = 280,
}: {
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-16">
      <MorphMegaMenu duration={duration} intensity={intensity} size={size} />
    </div>
  )
}
