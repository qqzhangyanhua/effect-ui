"use client"

import { BeforeAfterWipe, type WipeOrientation } from "../effects/before-after-wipe"
import { BentoAsymmetricGrid } from "../effects/bento-asymmetric-grid"
import { CaseStudyCarousel } from "../effects/case-study-carousel"
import { DragLockEscape } from "../effects/drag-lock-escape"
import { HoldFillCommit, type HoldFillMode } from "../effects/hold-fill-commit"
import { KineticScrambleText, type ScrambleCharset } from "../effects/kinetic-scramble-text"

export function BentoAsymmetricGridDemo({
  gap = 12,
  intensity = 0.65,
  pace = 1,
  radius = 20,
}: {
  gap?: number
  intensity?: number
  pace?: number
  radius?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <BentoAsymmetricGrid gap={gap} intensity={intensity} pace={pace} radius={radius} />
    </div>
  )
}

export function CaseStudyCarouselDemo({
  pace = 1,
  peek = 0.22,
  intensity = 0.7,
  gap = 12,
}: {
  pace?: number
  peek?: number
  intensity?: number
  gap?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <CaseStudyCarousel pace={pace} peek={peek} intensity={intensity} gap={gap} />
    </div>
  )
}

export function HoldFillCommitDemo({
  pace = 1,
  intensity = 0.7,
  threshold = 1,
  mode = "ring",
}: {
  pace?: number
  intensity?: number
  threshold?: number
  mode?: HoldFillMode
} = {}) {
  return (
    <div className="w-full max-w-sm px-6 py-10">
      <HoldFillCommit pace={pace} intensity={intensity} threshold={threshold} mode={mode} />
    </div>
  )
}

export function DragLockEscapeDemo({
  radius = 88,
  threshold = 1,
  pace = 1,
  intensity = 0.6,
}: {
  radius?: number
  threshold?: number
  pace?: number
  intensity?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <DragLockEscape radius={radius} threshold={threshold} pace={pace} intensity={intensity} />
    </div>
  )
}

export function BeforeAfterWipeDemo({
  orientation = "vertical-handle",
  pace = 1,
  intensity = 0.6,
  initial = 0.5,
}: {
  orientation?: WipeOrientation
  pace?: number
  intensity?: number
  initial?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <BeforeAfterWipe orientation={orientation} pace={pace} intensity={intensity} initial={initial} />
    </div>
  )
}

export function KineticScrambleTextDemo({
  pace = 1,
  intensity = 0.7,
  charset = "mixed",
}: {
  pace?: number
  intensity?: number
  charset?: ScrambleCharset
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <KineticScrambleText pace={pace} intensity={intensity} charset={charset} />
    </div>
  )
}
