"use client"

import { ChipFoldBadge } from "../effects/chip-fold-badge"
import { DigitSlotGate } from "../effects/digit-slot-gate"
import { GlyphBlockSwap } from "../effects/glyph-block-swap"
import { MoodWordRing } from "../effects/mood-word-ring"
import { ParticleVeilCaption } from "../effects/particle-veil-caption"
import { SpineNodeMarch } from "../effects/spine-node-march"

export function DigitSlotGateDemo({
  pace = 1,
  intensity = 0.7,
  slots = 6,
  mask = true,
}: {
  pace?: number
  intensity?: number
  slots?: number
  mask?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <DigitSlotGate pace={pace} intensity={intensity} slots={slots} mask={mask} />
    </div>
  )
}

export function SpineNodeMarchDemo({
  pace = 1,
  intensity = 0.7,
  flow = true,
  showChecks = true,
}: {
  pace?: number
  intensity?: number
  flow?: boolean
  showChecks?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SpineNodeMarch pace={pace} intensity={intensity} flow={flow} showChecks={showChecks} />
    </div>
  )
}

export function ChipFoldBadgeDemo({
  pace = 1,
  intensity = 0.7,
  collapsed = false,
  maxVisible = 6,
}: {
  pace?: number
  intensity?: number
  collapsed?: boolean
  maxVisible?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ChipFoldBadge pace={pace} intensity={intensity} collapsed={collapsed} maxVisible={maxVisible} />
    </div>
  )
}

export function MoodWordRingDemo({
  pace = 1,
  intensity = 0.7,
  auto = false,
  echo = true,
}: {
  pace?: number
  intensity?: number
  auto?: boolean
  echo?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <MoodWordRing pace={pace} intensity={intensity} auto={auto} echo={echo} />
    </div>
  )
}

export function GlyphBlockSwapDemo({
  pace = 1,
  intensity = 0.7,
  eyes = true,
  cycle = true,
}: {
  pace?: number
  intensity?: number
  eyes?: boolean
  cycle?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <GlyphBlockSwap pace={pace} intensity={intensity} eyes={eyes} cycle={cycle} />
    </div>
  )
}

export function ParticleVeilCaptionDemo({
  pace = 1,
  intensity = 0.7,
  sphere = true,
  caption = true,
}: {
  pace?: number
  intensity?: number
  sphere?: boolean
  caption?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ParticleVeilCaption pace={pace} intensity={intensity} sphere={sphere} caption={caption} />
    </div>
  )
}
