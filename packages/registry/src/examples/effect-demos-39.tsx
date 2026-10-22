"use client"

import { BallPit } from "../effects/ball-pit"
import { CoinJar } from "../effects/coin-jar"
import { TagJar } from "../effects/tag-jar"

export function TagJarDemo({
  color,
  size = 260,
  duration = 480,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <TagJar color={color} duration={duration} size={size} />
    </div>
  )
}

export function CoinJarDemo({
  color,
  size = 220,
  duration = 560,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <CoinJar color={color} duration={duration} size={size} />
    </div>
  )
}

export function BallPitDemo({
  color,
  size = 320,
  duration = 420,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-96 items-center justify-center px-6 py-10">
      <BallPit color={color} duration={duration} size={size} />
    </div>
  )
}
