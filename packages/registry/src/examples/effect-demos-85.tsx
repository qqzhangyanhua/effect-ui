"use client"

import { InertiaNotchCoast } from "../effects/inertia-notch-coast"
import { LatchThumbSpring } from "../effects/latch-thumb-spring"
import { MagnetPocketCatch } from "../effects/magnet-pocket-catch"
import { PressSquashTile } from "../effects/press-squash-tile"
import { ShardVeilClear } from "../effects/shard-veil-clear"
import { TetherYankReturn } from "../effects/tether-yank-return"

export function PressSquashTileDemo({
  pace = 1,
  intensity = 0.4,
  shadow = true,
  axis = "y",
}: {
  pace?: number
  intensity?: number
  shadow?: boolean
  axis?: "y" | "uniform"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <PressSquashTile pace={pace} intensity={intensity} shadow={shadow} axis={axis} />
    </div>
  )
}

export function TetherYankReturnDemo({
  pace = 1,
  intensity = 0.55,
  stiffness = 1,
  showRope = true,
}: {
  pace?: number
  intensity?: number
  stiffness?: number
  showRope?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <TetherYankReturn pace={pace} intensity={intensity} stiffness={stiffness} showRope={showRope} />
    </div>
  )
}

export function MagnetPocketCatchDemo({
  pace = 1,
  intensity = 0.55,
  radius = 1,
  snapPreview = true,
}: {
  pace?: number
  intensity?: number
  radius?: number
  snapPreview?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <MagnetPocketCatch pace={pace} intensity={intensity} radius={radius} snapPreview={snapPreview} />
    </div>
  )
}

export function ShardVeilClearDemo({
  pace = 1,
  intensity = 0.55,
  shardCount = 8,
  veilOpacity = 0.86,
}: {
  pace?: number
  intensity?: number
  shardCount?: number
  veilOpacity?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ShardVeilClear pace={pace} intensity={intensity} shardCount={shardCount} veilOpacity={veilOpacity} />
    </div>
  )
}

export function InertiaNotchCoastDemo({
  pace = 1,
  intensity = 0.55,
  notches = 5,
  showTicks = true,
}: {
  pace?: number
  intensity?: number
  notches?: number
  showTicks?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <InertiaNotchCoast pace={pace} intensity={intensity} notches={notches} showTicks={showTicks} />
    </div>
  )
}

export function LatchThumbSpringDemo({
  pace = 1,
  intensity = 0.28,
  trackFill = true,
  labels = true,
}: {
  pace?: number
  intensity?: number
  trackFill?: boolean
  labels?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <LatchThumbSpring pace={pace} intensity={intensity} trackFill={trackFill} labels={labels} />
    </div>
  )
}
