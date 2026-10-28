"use client"

import { BearingCompassTurn } from "../effects/bearing-compass-turn"
import { ChargeTargetRing } from "../effects/charge-target-ring"
import { KeystoneCornerDrag } from "../effects/keystone-corner-drag"
import { RoutePathScrub } from "../effects/route-path-scrub"
import { SkewAxisWarp } from "../effects/skew-axis-warp"
import { WaveClipWindow, type WaveSeconds } from "../effects/wave-clip-window"

export function RoutePathScrubDemo({
  pace = 1,
  intensity = 0.7,
  metrics = true,
  auto = false,
}: {
  pace?: number
  intensity?: number
  metrics?: boolean
  auto?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <RoutePathScrub pace={pace} intensity={intensity} metrics={metrics} auto={auto} />
    </div>
  )
}

export function SkewAxisWarpDemo({
  pace = 1,
  intensity = 0.7,
  grid = true,
  snap = true,
}: {
  pace?: number
  intensity?: number
  grid?: boolean
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SkewAxisWarp pace={pace} intensity={intensity} grid={grid} snap={snap} />
    </div>
  )
}

export function WaveClipWindowDemo({
  pace = 1,
  intensity = 0.7,
  seconds = "15",
  play = false,
}: {
  pace?: number
  intensity?: number
  seconds?: WaveSeconds
  play?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <WaveClipWindow pace={pace} intensity={intensity} seconds={seconds} play={play} />
    </div>
  )
}

export function ChargeTargetRingDemo({
  pace = 1,
  intensity = 0.7,
  pulse = false,
  showEta = true,
}: {
  pace?: number
  intensity?: number
  pulse?: boolean
  showEta?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ChargeTargetRing pace={pace} intensity={intensity} pulse={pulse} showEta={showEta} />
    </div>
  )
}

export function KeystoneCornerDragDemo({
  pace = 1,
  intensity = 0.7,
  loupe = true,
  midpoints = false,
}: {
  pace?: number
  intensity?: number
  loupe?: boolean
  midpoints?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <KeystoneCornerDrag pace={pace} intensity={intensity} loupe={loupe} midpoints={midpoints} />
    </div>
  )
}

export function BearingCompassTurnDemo({
  pace = 1,
  intensity = 0.7,
  snap = false,
  noise = false,
}: {
  pace?: number
  intensity?: number
  snap?: boolean
  noise?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <BearingCompassTurn pace={pace} intensity={intensity} snap={snap} noise={noise} />
    </div>
  )
}
