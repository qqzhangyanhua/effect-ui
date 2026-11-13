"use client"

import { FluidInkCursor } from "../effects/fluid-ink-cursor"
import { RippleRefractSurface } from "../effects/ripple-refract-surface"

export function FluidInkCursorDemo({
  speed = 1,
  intensity = 0.55,
  colors = undefined,
}: {
  speed?: number
  intensity?: number
  colors?: string[]
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <FluidInkCursor speed={speed} intensity={intensity} colors={colors} />
    </div>
  )
}

export function RippleRefractSurfaceDemo({
  speed = 1,
  intensity = 0.5,
  color,
}: {
  speed?: number
  intensity?: number
  color?: string
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <RippleRefractSurface speed={speed} intensity={intensity} color={color}>
        <p className="p-4 text-sm">North basin</p>
      </RippleRefractSurface>
    </div>
  )
}
