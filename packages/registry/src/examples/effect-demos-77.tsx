"use client"

import { FanDeckPick } from "../effects/fan-deck-pick"
import { GaugeSentimentSweep } from "../effects/gauge-sentiment-sweep"
import { HexTrailClaim } from "../effects/hex-trail-claim"
import { RidgeProfileScrub } from "../effects/ridge-profile-scrub"
import { StressBandMeter, type StressScale } from "../effects/stress-band-meter"
import { WindStreakScrub } from "../effects/wind-streak-scrub"

export function WindStreakScrubDemo({
  pace = 1,
  intensity = 0.65,
  span = 5,
  play = false,
}: {
  pace?: number
  intensity?: number
  span?: number
  play?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <WindStreakScrub pace={pace} intensity={intensity} span={span} play={play} />
    </div>
  )
}

export function HexTrailClaimDemo({
  pace = 1,
  intensity = 0.7,
  count = 16,
  auto = false,
}: {
  pace?: number
  intensity?: number
  count?: number
  auto?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <HexTrailClaim pace={pace} intensity={intensity} count={count} auto={auto} />
    </div>
  )
}

export function FanDeckPickDemo({
  pace = 1,
  intensity = 0.6,
  count = 10,
  spread = 64,
}: {
  pace?: number
  intensity?: number
  count?: number
  spread?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <FanDeckPick pace={pace} intensity={intensity} count={count} spread={spread} />
    </div>
  )
}

export function GaugeSentimentSweepDemo({
  pace = 1,
  intensity = 0.7,
  zones = 5,
  snap = true,
}: {
  pace?: number
  intensity?: number
  zones?: number
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <GaugeSentimentSweep pace={pace} intensity={intensity} zones={zones} snap={snap} />
    </div>
  )
}

export function RidgeProfileScrubDemo({
  pace = 1,
  intensity = 0.65,
  marks = true,
  tint = true,
}: {
  pace?: number
  intensity?: number
  marks?: boolean
  tint?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <RidgeProfileScrub pace={pace} intensity={intensity} marks={marks} tint={tint} />
    </div>
  )
}

export function StressBandMeterDemo({
  pace = 1,
  intensity = 0.6,
  scaleMax = "3",
  breathe = true,
}: {
  pace?: number
  intensity?: number
  scaleMax?: StressScale
  breathe?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <StressBandMeter pace={pace} intensity={intensity} scaleMax={scaleMax} breathe={breathe} />
    </div>
  )
}
