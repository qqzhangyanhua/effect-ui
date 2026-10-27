"use client"

import { DragRateTiles } from "../effects/drag-rate-tiles"
import { RadialHotspotLabels } from "../effects/radial-hotspot-labels"
import { ScrollSplitReveal } from "../effects/scroll-split-reveal"
import { SliceShiftText } from "../effects/slice-shift-text"
import { SpaceJumpHero } from "../effects/space-jump-hero"
import { SpotlightFocusBlur } from "../effects/spotlight-focus-blur"

export function SpaceJumpHeroDemo({
  pace = 1,
  height = 104,
  gravity = 1,
}: {
  pace?: number
  height?: number
  gravity?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <SpaceJumpHero pace={pace} height={height} gravity={gravity} />
    </div>
  )
}

export function ScrollSplitRevealDemo({
  intensity = 0.75,
  seam = 50,
  pace = 1,
}: {
  intensity?: number
  seam?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full">
      <p className="px-6 pt-8 text-center text-sm text-muted-foreground">向下滚动，封面沿接缝裂开。</p>
      <div className="h-[40vh]" />
      <div className="px-6">
        <ScrollSplitReveal intensity={intensity} seam={seam} pace={pace} />
      </div>
      <div className="h-[40vh]" />
    </div>
  )
}

export function SliceShiftTextDemo({
  slices = 8,
  intensity = 0.7,
  pace = 1,
}: {
  slices?: number
  intensity?: number
  pace?: number
} = {}) {
  return (
    <div className="flex min-h-72 w-full items-center justify-center px-6 py-10">
      <SliceShiftText slices={slices} intensity={intensity} pace={pace} />
    </div>
  )
}

export function RadialHotspotLabelsDemo({
  spread = 1,
  duration = 420,
  lineOpacity = 0.55,
}: {
  spread?: number
  duration?: number
  lineOpacity?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <RadialHotspotLabels spread={spread} duration={duration} lineOpacity={lineOpacity} />
    </div>
  )
}

export function SpotlightFocusBlurDemo({
  blur = 8,
  glow = 0.65,
  pace = 1,
}: {
  blur?: number
  glow?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <SpotlightFocusBlur blur={blur} glow={glow} pace={pace} />
    </div>
  )
}

export function DragRateTilesDemo({
  threshold = 0.34,
  snap = 0.8,
  pace = 1,
}: {
  threshold?: number
  snap?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <DragRateTiles threshold={threshold} snap={snap} pace={pace} />
    </div>
  )
}
