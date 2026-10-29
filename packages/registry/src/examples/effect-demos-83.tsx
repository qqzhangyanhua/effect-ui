"use client"

import { FunnelDropStage } from "../effects/funnel-drop-stage"
import { LayerPeelSheet } from "../effects/layer-peel-sheet"
import { NodeLinkPulse } from "../effects/node-link-pulse"
import { PaneBlendCompare } from "../effects/pane-blend-compare"
import { RailPinAnnotate } from "../effects/rail-pin-annotate"
import { StatusRailHop } from "../effects/status-rail-hop"

export function RailPinAnnotateDemo({
  pace = 1,
  intensity = 0.7,
  snap = false,
  oneOpen = true,
}: {
  pace?: number
  intensity?: number
  snap?: boolean
  oneOpen?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <RailPinAnnotate pace={pace} intensity={intensity} snap={snap} oneOpen={oneOpen} />
    </div>
  )
}

export function PaneBlendCompareDemo({
  pace = 1,
  intensity = 0.7,
  showLabels = true,
}: {
  pace?: number
  intensity?: number
  showLabels?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <PaneBlendCompare pace={pace} intensity={intensity} showLabels={showLabels} />
    </div>
  )
}

export function LayerPeelSheetDemo({
  pace = 1,
  intensity = 0.7,
  threshold = 0.45,
}: {
  pace?: number
  intensity?: number
  threshold?: number
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <LayerPeelSheet pace={pace} intensity={intensity} threshold={threshold} />
    </div>
  )
}

export function FunnelDropStageDemo({
  pace = 1,
  intensity = 0.7,
  showDrop = true,
}: {
  pace?: number
  intensity?: number
  showDrop?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <FunnelDropStage pace={pace} intensity={intensity} showDrop={showDrop} />
    </div>
  )
}

export function StatusRailHopDemo({
  pace = 1,
  intensity = 0.7,
  enforceEdges = true,
}: {
  pace?: number
  intensity?: number
  enforceEdges?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <StatusRailHop pace={pace} intensity={intensity} enforceEdges={enforceEdges} />
    </div>
  )
}

export function NodeLinkPulseDemo({
  pace = 1,
  intensity = 0.7,
  pulse = true,
}: {
  pace?: number
  intensity?: number
  pulse?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <NodeLinkPulse pace={pace} intensity={intensity} pulse={pulse} />
    </div>
  )
}
