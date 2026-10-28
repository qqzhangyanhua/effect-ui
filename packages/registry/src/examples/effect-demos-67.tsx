"use client"

import { ColorStepRail } from "../effects/color-step-rail"
import { IridescentEdgeCard } from "../effects/iridescent-edge-card"
import { ParticleDialReveal } from "../effects/particle-dial-reveal"
import { ScratchLineField } from "../effects/scratch-line-field"
import { ScrubFogClear } from "../effects/scrub-fog-clear"
import { SwipeActionRow } from "../effects/swipe-action-row"

export function ColorStepRailDemo({
  count = 8,
  pace = 1,
  format = "hex",
  hue = 262,
}: {
  count?: number
  pace?: number
  format?: "hex" | "oklch"
  hue?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ColorStepRail count={count} pace={pace} format={format} hue={hue} />
    </div>
  )
}

export function ScratchLineFieldDemo({
  threshold = 0.45,
  brush = 28,
  pace = 1,
}: {
  threshold?: number
  brush?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ScratchLineField threshold={threshold} brush={brush} pace={pace} />
    </div>
  )
}

export function SwipeActionRowDemo({
  threshold = 0.34,
  snap = 0.85,
  pace = 1,
}: {
  threshold?: number
  snap?: number
  pace?: number
} = {}) {
  return (
    <div className="w-full max-w-lg px-6 py-10">
      <SwipeActionRow threshold={threshold} snap={snap} pace={pace} />
    </div>
  )
}

export function ParticleDialRevealDemo({
  pace = 1,
  density = 64,
  intensity = 0.7,
}: {
  pace?: number
  density?: number
  intensity?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <ParticleDialReveal pace={pace} density={density} intensity={intensity} />
    </div>
  )
}

export function ScrubFogClearDemo({
  blur = 12,
  threshold = 0.4,
  brush = 36,
}: {
  blur?: number
  threshold?: number
  brush?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ScrubFogClear blur={blur} threshold={threshold} brush={brush} />
    </div>
  )
}

export function IridescentEdgeCardDemo({
  intensity = 0.75,
  pace = 1,
  thickness = 3,
}: {
  intensity?: number
  pace?: number
  thickness?: number
} = {}) {
  return (
    <div className="w-full max-w-sm px-6 py-10">
      <IridescentEdgeCard intensity={intensity} pace={pace} thickness={thickness} />
    </div>
  )
}
