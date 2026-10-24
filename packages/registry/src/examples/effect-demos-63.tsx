"use client"

import { Bell, Heart, Search, Settings } from "lucide-react"

import { IconMoves } from "../effects/icon-moves"
import { WavePhysicsLoader } from "../effects/wave-physics-loader"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const buttonClass = "inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-foreground"

export function IconMovesDemo({
  on = "press",
  color = "var(--foreground)",
  speed = 1,
  size = 24,
  duration = 420,
}: {
  on?: "press" | "hover"
  color?: string
  speed?: number
  size?: number
  duration?: number
} = {}) {
  return (
    <div className={frame}>
      <IconMoves on={on} color={color} speed={speed} size={size} duration={duration} className="flex flex-wrap justify-center gap-3">
        <button type="button" className={buttonClass}>
          <Settings />
          设置
        </button>
        <button type="button" className={buttonClass}>
          <Bell />
          提醒
        </button>
        <button type="button" className={buttonClass}>
          <Heart />
          收藏
        </button>
        <button type="button" className={buttonClass}>
          <Search />
          搜索
        </button>
      </IconMoves>
    </div>
  )
}

export function WavePhysicsLoaderDemo({
  color = "var(--foreground)",
  count = 15,
  duration = 4000,
  speed = 1,
  intensity = 48,
  size = 12,
  gap = 8,
}: {
  color?: string
  count?: number
  duration?: number
  speed?: number
  intensity?: number
  size?: number
  gap?: number
} = {}) {
  return (
    <div className={frame}>
      <div className="space-y-4 text-center">
        <WavePhysicsLoader color={color} count={count} duration={duration} speed={speed} intensity={intensity} size={size} gap={gap} />
        <p className="text-sm text-muted-foreground">小球沿着这排柱子弹。</p>
      </div>
    </div>
  )
}




