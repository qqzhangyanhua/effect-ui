"use client"

import { BlurRepCount } from "../effects/blur-rep-count"
import { DragTokenGate } from "../effects/drag-token-gate"
import { FrostDotReveal } from "../effects/frost-dot-reveal"
import { LogoFocusDim } from "../effects/logo-focus-dim"
import { PaintLiftRail } from "../effects/paint-lift-rail"
import { TitleYearList } from "../effects/title-year-list"

export function TitleYearListDemo({
  pace = 1,
  intensity = 0.65,
  count = 7,
  leading = 1,
}: {
  pace?: number
  intensity?: number
  count?: number
  leading?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <TitleYearList pace={pace} intensity={intensity} count={count} leading={leading} />
    </div>
  )
}

export function LogoFocusDimDemo({
  pace = 1,
  intensity = 0.55,
  layout = "row",
  count = 8,
  hold = false,
}: {
  pace?: number
  intensity?: number
  layout?: "row" | "grid"
  count?: number
  hold?: boolean
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <LogoFocusDim pace={pace} intensity={intensity} layout={layout} count={count} hold={hold} />
    </div>
  )
}

export function PaintLiftRailDemo({
  pace = 1,
  intensity = 0.6,
  snap = false,
  hue = 28,
}: {
  pace?: number
  intensity?: number
  snap?: boolean
  hue?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PaintLiftRail pace={pace} intensity={intensity} snap={snap} hue={hue} />
    </div>
  )
}

export function DragTokenGateDemo({
  pace = 1,
  intensity = 0.65,
  hint = true,
  threshold = 0.45,
}: {
  pace?: number
  intensity?: number
  hint?: boolean
  threshold?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <DragTokenGate pace={pace} intensity={intensity} hint={hint} threshold={threshold} />
    </div>
  )
}

export function FrostDotRevealDemo({
  pace = 1,
  intensity = 0.7,
  span = 47,
  persist = false,
}: {
  pace?: number
  intensity?: number
  span?: number
  persist?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <FrostDotReveal pace={pace} intensity={intensity} span={span} persist={persist} />
    </div>
  )
}

export function BlurRepCountDemo({
  pace = 1,
  intensity = 0.65,
  auto = false,
  digits = 1,
}: {
  pace?: number
  intensity?: number
  auto?: boolean
  digits?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <BlurRepCount pace={pace} intensity={intensity} auto={auto} digits={digits} />
    </div>
  )
}
