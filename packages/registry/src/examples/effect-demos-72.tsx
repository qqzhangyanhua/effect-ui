"use client"

import { AmountFitType } from "../effects/amount-fit-type"
import { FinishSwatchMorph } from "../effects/finish-swatch-morph"
import { MosaicTileFlip } from "../effects/mosaic-tile-flip"
import { PixelStreamMorph } from "../effects/pixel-stream-morph"
import { SlideRailConfirm } from "../effects/slide-rail-confirm"
import { UndoCountdownRing } from "../effects/undo-countdown-ring"

export function MosaicTileFlipDemo({
  pace = 1,
  intensity = 0.7,
  cols = 3,
  gap = 8,
}: {
  pace?: number
  intensity?: number
  cols?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <MosaicTileFlip pace={pace} intensity={intensity} cols={cols} gap={gap} />
    </div>
  )
}

export function PixelStreamMorphDemo({
  pace = 1,
  intensity = 0.7,
  density = 28,
  text = "flow",
}: {
  pace?: number
  intensity?: number
  density?: number
  text?: string
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PixelStreamMorph pace={pace} intensity={intensity} density={density} text={text} />
    </div>
  )
}

export function SlideRailConfirmDemo({
  pace = 1,
  intensity = 0.65,
  threshold = 0.9,
}: {
  pace?: number
  intensity?: number
  threshold?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SlideRailConfirm pace={pace} intensity={intensity} threshold={threshold} />
    </div>
  )
}

export function FinishSwatchMorphDemo({
  pace = 1,
  intensity = 0.6,
  count = 5,
  gap = 12,
}: {
  pace?: number
  intensity?: number
  count?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <FinishSwatchMorph pace={pace} intensity={intensity} count={count} gap={gap} />
    </div>
  )
}

export function UndoCountdownRingDemo({
  pace = 4,
  intensity = 0.6,
  autoCommit = false,
  label = "Commit",
}: {
  pace?: number
  intensity?: number
  autoCommit?: boolean
  label?: string
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <UndoCountdownRing pace={pace} intensity={intensity} autoCommit={autoCommit} label={label} />
    </div>
  )
}

export function AmountFitTypeDemo({
  pace = 1,
  intensity = 0.65,
  currency = "$",
  maxDigits = 8,
}: {
  pace?: number
  intensity?: number
  currency?: string
  maxDigits?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <AmountFitType pace={pace} intensity={intensity} currency={currency} maxDigits={maxDigits} />
    </div>
  )
}
