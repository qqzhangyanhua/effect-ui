"use client"

import { CurtainRouteTransition, type CurtainDirection } from "../effects/curtain-route-transition"
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

export function CurtainRouteTransitionDemo({
  duration = 800,
  intensity = 0.4,
  direction = "left",
}: {
  duration?: number
  intensity?: number
  direction?: CurtainDirection
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <CurtainRouteTransition duration={duration} intensity={intensity} direction={direction} />
    </div>
  )
}
