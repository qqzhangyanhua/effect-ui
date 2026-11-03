"use client"

import { DockSettlePop, type DockAnchor, type DockStyle } from "../effects/dock-settle-pop"
import { GripLiftRise, type HandleKind, type LiftStyle } from "../effects/grip-lift-rise"
import { LaneInsertBeam, type BeamStyle, type LabelMode } from "../effects/lane-insert-beam"
import { RimRejectWobble, type CopyMode, type NudgeKind } from "../effects/rim-reject-wobble"
import { SlotGapShim, type GhostMode, type ShimStyle } from "../effects/slot-gap-shim"
import { SnapHomeCancel, type OriginKind, type SnapStyle } from "../effects/snap-home-cancel"

export function GripLiftRiseDemo({
  pace = 1,
  intensity = 0.28,
  style = "shadow",
  handle = "bars",
}: {
  pace?: number
  intensity?: number
  style?: LiftStyle
  handle?: HandleKind
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <GripLiftRise pace={pace} intensity={intensity} style={style} handle={handle} />
    </div>
  )
}

export function SlotGapShimDemo({
  pace = 1,
  intensity = 0.42,
  style = "outline",
  ghost = "on",
}: {
  pace?: number
  intensity?: number
  style?: ShimStyle
  ghost?: GhostMode
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <SlotGapShim pace={pace} intensity={intensity} style={style} ghost={ghost} />
    </div>
  )
}

export function LaneInsertBeamDemo({
  pace = 1,
  intensity = 0.4,
  style = "line",
  label = "on",
}: {
  pace?: number
  intensity?: number
  style?: BeamStyle
  label?: LabelMode
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <LaneInsertBeam pace={pace} intensity={intensity} style={style} label={label} />
    </div>
  )
}

export function RimRejectWobbleDemo({
  pace = 1,
  intensity = 0.22,
  nudge = "rim",
  copy = "on",
}: {
  pace?: number
  intensity?: number
  nudge?: NudgeKind
  copy?: CopyMode
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <RimRejectWobble pace={pace} intensity={intensity} nudge={nudge} copy={copy} />
    </div>
  )
}

export function SnapHomeCancelDemo({
  pace = 1,
  intensity = 0.36,
  style = "snap",
  origin = "slot",
}: {
  pace?: number
  intensity?: number
  style?: SnapStyle
  origin?: OriginKind
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <SnapHomeCancel pace={pace} intensity={intensity} style={style} origin={origin} />
    </div>
  )
}

export function DockSettlePopDemo({
  pace = 1,
  intensity = 0.3,
  style = "pop",
  anchor = "row",
}: {
  pace?: number
  intensity?: number
  style?: DockStyle
  anchor?: DockAnchor
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <DockSettlePop pace={pace} intensity={intensity} style={style} anchor={anchor} />
    </div>
  )
}
