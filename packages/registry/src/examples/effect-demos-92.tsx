"use client"

import { FluidInkCursor } from "../effects/fluid-ink-cursor"

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
