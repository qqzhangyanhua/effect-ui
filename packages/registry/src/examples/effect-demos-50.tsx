"use client"

import { JellyButton } from "../effects/jelly-button"
import { LanyardBadge } from "../effects/lanyard-badge"
import { SpringDrawer } from "../effects/spring-drawer"

export function LanyardBadgeDemo({
  color,
  size = 120,
  duration = 640,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <LanyardBadge color={color} duration={duration} size={size} />
    </div>
  )
}

export function JellyButtonDemo({
  color,
  size = 48,
  duration = 420,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-48 items-center justify-center px-6 py-10">
      <JellyButton color={color} duration={duration} size={size} />
    </div>
  )
}

export function SpringDrawerDemo({
  color,
  size = 280,
  duration = 560,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <SpringDrawer color={color} duration={duration} size={size} />
    </div>
  )
}
