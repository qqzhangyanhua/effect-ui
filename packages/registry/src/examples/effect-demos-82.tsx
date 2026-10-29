"use client"

import { ChapterDashSeek } from "../effects/chapter-dash-seek"
import { DotScaleMatrix } from "../effects/dot-scale-matrix"
import { HotspotPulseMap } from "../effects/hotspot-pulse-map"
import { InterlockStreakGlow } from "../effects/interlock-streak-glow"
import { TrimHandleSpan } from "../effects/trim-handle-span"
import { WavePinAnchor } from "../effects/wave-pin-anchor"

export function TrimHandleSpanDemo({
  pace = 1,
  intensity = 0.7,
  minSpan = 0.08,
  showFilm = true,
}: {
  pace?: number
  intensity?: number
  minSpan?: number
  showFilm?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <TrimHandleSpan pace={pace} intensity={intensity} minSpan={minSpan} showFilm={showFilm} />
    </div>
  )
}

export function WavePinAnchorDemo({
  pace = 1,
  intensity = 0.7,
  autoPlay = false,
  showPins = true,
}: {
  pace?: number
  intensity?: number
  autoPlay?: boolean
  showPins?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <WavePinAnchor pace={pace} intensity={intensity} autoPlay={autoPlay} showPins={showPins} />
    </div>
  )
}

export function HotspotPulseMapDemo({
  pace = 1,
  intensity = 0.7,
  pulse = true,
  oneOpen = true,
}: {
  pace?: number
  intensity?: number
  pulse?: boolean
  oneOpen?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <HotspotPulseMap pace={pace} intensity={intensity} pulse={pulse} oneOpen={oneOpen} />
    </div>
  )
}

export function DotScaleMatrixDemo({
  pace = 1,
  intensity = 0.7,
  colorScale = true,
  showChip = true,
}: {
  pace?: number
  intensity?: number
  colorScale?: boolean
  showChip?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <DotScaleMatrix pace={pace} intensity={intensity} colorScale={colorScale} showChip={showChip} />
    </div>
  )
}

export function InterlockStreakGlowDemo({
  pace = 1,
  intensity = 0.7,
  liquid = true,
  glow = true,
}: {
  pace?: number
  intensity?: number
  liquid?: boolean
  glow?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <InterlockStreakGlow pace={pace} intensity={intensity} liquid={liquid} glow={glow} />
    </div>
  )
}

export function ChapterDashSeekDemo({
  pace = 1,
  intensity = 0.7,
  dashed = true,
  labels = true,
}: {
  pace?: number
  intensity?: number
  dashed?: boolean
  labels?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ChapterDashSeek pace={pace} intensity={intensity} dashed={dashed} labels={labels} />
    </div>
  )
}
