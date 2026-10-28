"use client"

import { CabinSeatPick } from "../effects/cabin-seat-pick"
import { CurbSpotWalk } from "../effects/curb-spot-walk"
import { FloorUnitGlow } from "../effects/floor-unit-glow"
import { OrbitFrameSpin } from "../effects/orbit-frame-spin"
import { PinClusterBurst } from "../effects/pin-cluster-burst"
import { SpeedNotchRail } from "../effects/speed-notch-rail"

export function PinClusterBurstDemo({
  pace = 1,
  intensity = 0.7,
  drift = true,
  labels = true,
}: {
  pace?: number
  intensity?: number
  drift?: boolean
  labels?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PinClusterBurst pace={pace} intensity={intensity} drift={drift} labels={labels} />
    </div>
  )
}

export function CabinSeatPickDemo({
  pace = 1,
  intensity = 0.7,
  preferred = true,
  multi = false,
}: {
  pace?: number
  intensity?: number
  preferred?: boolean
  multi?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <CabinSeatPick pace={pace} intensity={intensity} preferred={preferred} multi={multi} />
    </div>
  )
}

export function FloorUnitGlowDemo({
  pace = 1,
  intensity = 0.7,
  breath = false,
  showLegend = true,
}: {
  pace?: number
  intensity?: number
  breath?: boolean
  showLegend?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <FloorUnitGlow pace={pace} intensity={intensity} breath={breath} showLegend={showLegend} />
    </div>
  )
}

export function CurbSpotWalkDemo({
  pace = 1,
  intensity = 0.7,
  flow = true,
  showEta = true,
}: {
  pace?: number
  intensity?: number
  flow?: boolean
  showEta?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <CurbSpotWalk pace={pace} intensity={intensity} flow={flow} showEta={showEta} />
    </div>
  )
}

export function OrbitFrameSpinDemo({
  pace = 1,
  intensity = 0.7,
  auto = false,
  snap = true,
}: {
  pace?: number
  intensity?: number
  auto?: boolean
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <OrbitFrameSpin pace={pace} intensity={intensity} auto={auto} snap={snap} />
    </div>
  )
}

export function SpeedNotchRailDemo({
  pace = 1,
  intensity = 0.7,
  preview = true,
  notches = 5,
}: {
  pace?: number
  intensity?: number
  preview?: boolean
  notches?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <SpeedNotchRail pace={pace} intensity={intensity} preview={preview} notches={notches} />
    </div>
  )
}
