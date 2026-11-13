"use client"

import { DepthParallaxPhoto } from "../effects/depth-parallax-photo"
import { FlutedGlassPane } from "../effects/fluted-glass-pane"

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

export function DepthParallaxPhotoDemo({
  intensity = 0.5,
  size = 24,
  speed = 1,
}: {
  intensity?: number
  size?: number
  speed?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <DepthParallaxPhoto intensity={intensity} size={size} speed={speed} />
    </div>
  )
}
