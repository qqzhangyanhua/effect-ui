"use client"

import { BalancePlanePuck } from "../effects/balance-plane-puck"
import { PhaseIllumScrub, type PhaseSpan } from "../effects/phase-illum-scrub"
import { SleepArcRange } from "../effects/sleep-arc-range"
import { StageLaneFlow, type StageLanes } from "../effects/stage-lane-flow"
import { StemFaderMix } from "../effects/stem-fader-mix"
import { TideCurveScrub } from "../effects/tide-curve-scrub"

export function PhaseIllumScrubDemo({
  pace = 1,
  intensity = 0.7,
  span = "7",
  auto = false,
}: {
  pace?: number
  intensity?: number
  span?: PhaseSpan
  auto?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PhaseIllumScrub pace={pace} intensity={intensity} span={span} auto={auto} />
    </div>
  )
}

export function SleepArcRangeDemo({
  pace = 1,
  intensity = 0.7,
  snap = true,
  minHours = 4,
}: {
  pace?: number
  intensity?: number
  snap?: boolean
  minHours?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SleepArcRange pace={pace} intensity={intensity} snap={snap} minHours={minHours} />
    </div>
  )
}

export function StageLaneFlowDemo({
  pace = 1,
  intensity = 0.65,
  lanes = "4",
  flow = false,
}: {
  pace?: number
  intensity?: number
  lanes?: StageLanes
  flow?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <StageLaneFlow pace={pace} intensity={intensity} lanes={lanes} flow={flow} />
    </div>
  )
}

export function StemFaderMixDemo({
  pace = 1,
  intensity = 0.7,
  count = 4,
  link = false,
}: {
  pace?: number
  intensity?: number
  count?: number
  link?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <StemFaderMix pace={pace} intensity={intensity} count={count} link={link} />
    </div>
  )
}

export function BalancePlanePuckDemo({
  pace = 1,
  intensity = 0.65,
  snap = true,
  grid = false,
}: {
  pace?: number
  intensity?: number
  snap?: boolean
  grid?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <BalancePlanePuck pace={pace} intensity={intensity} snap={snap} grid={grid} />
    </div>
  )
}

export function TideCurveScrubDemo({
  pace = 1,
  intensity = 0.7,
  marks = true,
  play = false,
}: {
  pace?: number
  intensity?: number
  marks?: boolean
  play?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <TideCurveScrub pace={pace} intensity={intensity} marks={marks} play={play} />
    </div>
  )
}
