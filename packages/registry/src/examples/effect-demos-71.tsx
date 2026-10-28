"use client"

import { OscillationArcDial } from "../effects/oscillation-arc-dial"
import { PuzzleSlideFit } from "../effects/puzzle-slide-fit"
import { ScatterPhotoDrag } from "../effects/scatter-photo-drag"
import { SeedSlotDrop } from "../effects/seed-slot-drop"
import { StripStepExpand } from "../effects/strip-step-expand"
import { TabMediaSwap } from "../effects/tab-media-swap"

export function StripStepExpandDemo({
  pace = 1,
  intensity = 0.7,
  count = 3,
  gap = 8,
}: {
  pace?: number
  intensity?: number
  count?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <StripStepExpand pace={pace} intensity={intensity} count={count} gap={gap} />
    </div>
  )
}

export function TabMediaSwapDemo({
  pace = 1,
  intensity = 0.6,
  autoplay = true,
  count = 4,
}: {
  pace?: number
  intensity?: number
  autoplay?: boolean
  count?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <TabMediaSwap pace={pace} intensity={intensity} autoplay={autoplay} count={count} />
    </div>
  )
}

export function SeedSlotDropDemo({
  pace = 1,
  intensity = 0.65,
  slots = 3,
  gap = 12,
}: {
  pace?: number
  intensity?: number
  slots?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <SeedSlotDrop pace={pace} intensity={intensity} slots={slots} gap={gap} />
    </div>
  )
}

export function OscillationArcDialDemo({
  pace = 1,
  intensity = 0.65,
  step = 1,
  span = 180,
}: {
  pace?: number
  intensity?: number
  step?: number
  span?: number
} = {}) {
  return (
    <div className="w-full max-w-sm px-6 py-10">
      <OscillationArcDial pace={pace} intensity={intensity} step={step} span={span} />
    </div>
  )
}

export function PuzzleSlideFitDemo({
  pace = 1,
  intensity = 0.55,
  target = 0.62,
  jagged = 0.45,
}: {
  pace?: number
  intensity?: number
  target?: number
  jagged?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PuzzleSlideFit pace={pace} intensity={intensity} target={target} jagged={jagged} />
    </div>
  )
}

export function ScatterPhotoDragDemo({
  intensity = 0.7,
  pace = 1,
  count = 6,
  gap = 12,
}: {
  intensity?: number
  pace?: number
  count?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ScatterPhotoDrag intensity={intensity} pace={pace} count={count} gap={gap} />
    </div>
  )
}
