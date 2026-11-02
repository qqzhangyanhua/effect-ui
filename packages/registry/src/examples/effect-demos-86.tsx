"use client"

import { FolioDriftPlane } from "../effects/folio-drift-plane"
import { LedgeChapterChip } from "../effects/ledge-chapter-chip"
import { MarginBookmarkNotch } from "../effects/margin-bookmark-notch"
import { MarginInkProgress } from "../effects/margin-ink-progress"
import { StanzaRiseEnter } from "../effects/stanza-rise-enter"
import { VerseCascadeReveal } from "../effects/verse-cascade-reveal"

export function StanzaRiseEnterDemo({
  pace = 1,
  intensity = 0.32,
  stagger = true,
  threshold = 0.4,
}: {
  pace?: number
  intensity?: number
  stagger?: boolean
  threshold?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <StanzaRiseEnter pace={pace} intensity={intensity} stagger={stagger} threshold={threshold} />
    </div>
  )
}

export function FolioDriftPlaneDemo({
  pace = 1,
  intensity = 0.22,
  planeOpacity = 0.38,
  axis = "y",
}: {
  pace?: number
  intensity?: number
  planeOpacity?: number
  axis?: "y" | "x"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <FolioDriftPlane pace={pace} intensity={intensity} planeOpacity={planeOpacity} axis={axis} />
    </div>
  )
}

export function MarginInkProgressDemo({
  pace = 1,
  intensity = 0.35,
  ticks = 4,
  side = "start",
}: {
  pace?: number
  intensity?: number
  ticks?: number
  side?: "start" | "end"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <MarginInkProgress pace={pace} intensity={intensity} ticks={ticks} side={side} />
    </div>
  )
}

export function VerseCascadeRevealDemo({
  pace = 1,
  intensity = 0.45,
  cascadeGap = 0.45,
  lines = 5,
}: {
  pace?: number
  intensity?: number
  cascadeGap?: number
  lines?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <VerseCascadeReveal pace={pace} intensity={intensity} cascadeGap={cascadeGap} lines={lines} />
    </div>
  )
}

export function LedgeChapterChipDemo({
  pace = 1,
  intensity = 0.45,
  showToc = true,
  ledgeAlign = "start",
}: {
  pace?: number
  intensity?: number
  showToc?: boolean
  ledgeAlign?: "start" | "center" | "end"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <LedgeChapterChip pace={pace} intensity={intensity} showToc={showToc} ledgeAlign={ledgeAlign} />
    </div>
  )
}

export function MarginBookmarkNotchDemo({
  pace = 1,
  intensity = 0.32,
  snapNotches = 4,
  side = "end",
}: {
  pace?: number
  intensity?: number
  snapNotches?: number
  side?: "start" | "end"
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <MarginBookmarkNotch pace={pace} intensity={intensity} snapNotches={snapNotches} side={side} />
    </div>
  )
}
