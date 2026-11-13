"use client"

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
