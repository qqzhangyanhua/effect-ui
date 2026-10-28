"use client"

import { BarrelValueWheel } from "../effects/barrel-value-wheel"
import { BlobZoomLens } from "../effects/blob-zoom-lens"
import { InkStrokeDraw } from "../effects/ink-stroke-draw"
import { PeekFanStack } from "../effects/peek-fan-stack"
import { RulerTickScrub } from "../effects/ruler-tick-scrub"
import { YearSnapRail } from "../effects/year-snap-rail"

export function BlobZoomLensDemo({
  intensity = 0.65,
  radius = 72,
  pace = 1,
  jagged = 0.55,
}: {
  intensity?: number
  radius?: number
  pace?: number
  jagged?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <BlobZoomLens intensity={intensity} radius={radius} pace={pace} jagged={jagged} />
    </div>
  )
}

export function YearSnapRailDemo({
  pace = 1,
  intensity = 0.7,
  gap = 12,
  count = 6,
}: {
  pace?: number
  intensity?: number
  gap?: number
  count?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <YearSnapRail pace={pace} intensity={intensity} gap={gap} count={count} />
    </div>
  )
}

export function RulerTickScrubDemo({
  gap = 14,
  pace = 1,
  intensity = 0.65,
  majorEvery = 4,
}: {
  gap?: number
  pace?: number
  intensity?: number
  majorEvery?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <RulerTickScrub gap={gap} pace={pace} intensity={intensity} majorEvery={majorEvery} />
    </div>
  )
}

export function PeekFanStackDemo({
  intensity = 0.7,
  pace = 1,
  gap = 18,
  radius = 18,
}: {
  intensity?: number
  pace?: number
  gap?: number
  radius?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <PeekFanStack intensity={intensity} pace={pace} gap={gap} radius={radius} />
    </div>
  )
}

export function BarrelValueWheelDemo({
  pace = 1,
  intensity = 0.7,
  visible = 5,
}: {
  pace?: number
  intensity?: number
  visible?: number
} = {}) {
  return (
    <div className="w-full max-w-xs px-6 py-10">
      <BarrelValueWheel pace={pace} intensity={intensity} visible={visible} />
    </div>
  )
}

export function InkStrokeDrawDemo({
  pace = 1,
  intensity = 0.65,
  stagger = 0.35,
  fillAfter = true,
}: {
  pace?: number
  intensity?: number
  stagger?: number
  fillAfter?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <InkStrokeDraw pace={pace} intensity={intensity} stagger={stagger} fillAfter={fillAfter} />
    </div>
  )
}
