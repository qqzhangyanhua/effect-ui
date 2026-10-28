"use client"

import { GlassFeatureTrio } from "../effects/glass-feature-trio"
import { HexZoneHotspots } from "../effects/hex-zone-hotspots"
import { OrbitalActionRing } from "../effects/orbital-action-ring"
import { PageCurlTurn } from "../effects/page-curl-turn"
import { ScanRailProgress } from "../effects/scan-rail-progress"
import { StickyStackCards } from "../effects/sticky-stack-cards"

export function StickyStackCardsDemo({
  pace = 1,
  tilt = 6,
  depth = 0.16,
}: {
  pace?: number
  tilt?: number
  depth?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <StickyStackCards pace={pace} tilt={tilt} depth={depth} />
    </div>
  )
}

export function GlassFeatureTrioDemo({
  blur = 16,
  intensity = 0.7,
  pace = 1,
}: {
  blur?: number
  intensity?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <GlassFeatureTrio blur={blur} intensity={intensity} pace={pace} />
    </div>
  )
}

export function HexZoneHotspotsDemo({
  intensity = 0.45,
  pulse = 0.6,
  pace = 1,
}: {
  intensity?: number
  pulse?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <HexZoneHotspots intensity={intensity} pulse={pulse} pace={pace} />
    </div>
  )
}

export function OrbitalActionRingDemo({
  radius = 92,
  pace = 1,
  count = 3,
}: {
  radius?: number
  pace?: number
  count?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <OrbitalActionRing radius={radius} pace={pace} count={count} />
    </div>
  )
}

export function ScanRailProgressDemo({
  pace = 1,
  intensity = 0.7,
  mode = "auto",
}: {
  pace?: number
  intensity?: number
  mode?: "auto" | "hold"
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ScanRailProgress pace={pace} intensity={intensity} mode={mode} />
    </div>
  )
}

export function PageCurlTurnDemo({
  threshold = 0.42,
  pace = 1,
  curl = 36,
}: {
  threshold?: number
  pace?: number
  curl?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PageCurlTurn threshold={threshold} pace={pace} curl={curl} />
    </div>
  )
}
