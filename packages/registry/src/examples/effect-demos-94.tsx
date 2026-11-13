"use client"

import { GlassRefractHero } from "../effects/glass-refract-hero"

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
