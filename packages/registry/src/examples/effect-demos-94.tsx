"use client"

import { GlassRefractHero } from "../effects/glass-refract-hero"
import { VoiceOrb, type VoiceOrbState } from "../effects/voice-orb"

export function GlassRefractHeroDemo({
  speed = 1,
  intensity = 0.45,
  size = 180,
}: {
  speed?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <GlassRefractHero speed={speed} intensity={intensity} size={size}>
        <p className="max-w-xs text-sm text-foreground">North aisle, seen through glass.</p>
      </GlassRefractHero>
    </div>
  )
}

export function VoiceOrbDemo({
  speed = 1,
  volume = 0.5,
  state = "idle",
}: {
  speed?: number
  volume?: number
  state?: VoiceOrbState
} = {}) {
  return (
    <div className="flex w-full justify-center px-6 py-10">
      <VoiceOrb speed={speed} volume={volume} state={state} />
    </div>
  )
}
