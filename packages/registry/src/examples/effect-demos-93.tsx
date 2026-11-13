"use client"

import { FlutedGlassPane } from "../effects/fluted-glass-pane"
import { VelocityBendGallery } from "../effects/velocity-bend-gallery"

export function FlutedGlassPaneDemo({
  count = 18,
  angle = 90,
  intensity = 0.45,
}: {
  count?: number
  angle?: number
  intensity?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <FlutedGlassPane count={count} angle={angle} intensity={intensity} />
    </div>
  )
}

export function VelocityBendGalleryDemo({
  speed = 1,
  intensity = 0.6,
  gap = 16,
}: {
  speed?: number
  intensity?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <VelocityBendGallery speed={speed} intensity={intensity} gap={gap} />
    </div>
  )
}
