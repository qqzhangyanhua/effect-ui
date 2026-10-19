"use client"

import { FlowField } from "../effects/flow-field"
import { Halftone } from "../effects/halftone"
import { HoldButton } from "../effects/hold-button"
import { HolographicFoil } from "../effects/holographic-foil"
import { ParticleButton } from "../effects/particle-button"
import { SpoilerText } from "../effects/spoiler-text"
import { TearButton } from "../effects/tear-button"

export function HolographicFoilDemo() {
  return (
    <HolographicFoil className="w-72 bg-zinc-950 text-white">
      <p className="text-xs tracking-[0.2em] uppercase opacity-70">Smooth UI</p>
      <p className="mt-2 font-display text-2xl">Holographic Foil</p>
    </HolographicFoil>
  )
}

export function SpoilerTextDemo() {
  return <SpoilerText className="text-lg" text="点击揭示隐藏剧透" />
}

export function HoldButtonDemo() {
  return <HoldButton>长按确认</HoldButton>
}

export function ParticleButtonDemo() {
  return <ParticleButton>粒子爆散</ParticleButton>
}

export function TearButtonDemo() {
  return <TearButton>撕开</TearButton>
}

export function FlowFieldDemo() {
  return <FlowField className="h-48 w-full" />
}

export function HalftoneDemo() {
  return <Halftone className="h-48 w-full" />
}
