"use client"

import { ClayDigitMorph } from "../effects/clay-digit-morph"
import { CurveFocusRail } from "../effects/curve-focus-rail"
import { LiveStageCapsule } from "../effects/live-stage-capsule"
import { SolarOrbitScrub } from "../effects/solar-orbit-scrub"
import { StrengthSegmentFill } from "../effects/strength-segment-fill"
import { SwipeStyleCycle } from "../effects/swipe-style-cycle"

export function SolarOrbitScrubDemo({
  pace = 1,
  intensity = 0.7,
  span = 0.75,
  snap = false,
}: {
  pace?: number
  intensity?: number
  span?: number
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SolarOrbitScrub pace={pace} intensity={intensity} span={span} snap={snap} />
    </div>
  )
}

export function LiveStageCapsuleDemo({
  pace = 1,
  intensity = 0.65,
  stages = 4,
  autoAdvance = false,
}: {
  pace?: number
  intensity?: number
  stages?: number
  autoAdvance?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <LiveStageCapsule pace={pace} intensity={intensity} stages={stages} autoAdvance={autoAdvance} />
    </div>
  )
}

export function StrengthSegmentFillDemo({
  pace = 1,
  intensity = 0.65,
  segments = 4,
  rules = 4,
}: {
  pace?: number
  intensity?: number
  segments?: number
  rules?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <StrengthSegmentFill pace={pace} intensity={intensity} segments={segments} rules={rules} />
    </div>
  )
}

export function SwipeStyleCycleDemo({
  pace = 1,
  intensity = 0.7,
  count = 3,
  threshold = 0.28,
}: {
  pace?: number
  intensity?: number
  count?: number
  threshold?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SwipeStyleCycle pace={pace} intensity={intensity} count={count} threshold={threshold} />
    </div>
  )
}

export function ClayDigitMorphDemo({
  pace = 1,
  intensity = 0.7,
  digits = 1,
  softness = 0.55,
}: {
  pace?: number
  intensity?: number
  digits?: number
  softness?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <ClayDigitMorph pace={pace} intensity={intensity} digits={digits} softness={softness} />
    </div>
  )
}

export function CurveFocusRailDemo({
  pace = 1,
  intensity = 0.65,
  count = 5,
  spread = 2,
}: {
  pace?: number
  intensity?: number
  count?: number
  spread?: number
} = {}) {
  return (
    <div className="w-full max-w-3xl px-6 py-10">
      <CurveFocusRail pace={pace} intensity={intensity} count={count} spread={spread} />
    </div>
  )
}
