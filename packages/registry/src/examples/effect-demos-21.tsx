"use client"

import { CursorFollow } from "../effects/cursor-follow"
import { CursorTrail } from "../effects/cursor-trail"

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
