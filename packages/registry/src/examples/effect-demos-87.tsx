"use client"

import { AisleCrossfadeRoute, type AisleDirection, type AisleStyle } from "../effects/aisle-crossfade-route"
import { ApronSlideSheet, type ApronEdge } from "../effects/apron-slide-sheet"
import { HazeAmbientVeil, type HazeTint } from "../effects/haze-ambient-veil"
import { ScrimCleanDismiss, type ExitStyle } from "../effects/scrim-clean-dismiss"
import { SillGleamPass, type GleamPath } from "../effects/sill-gleam-pass"
import { WelcomeOfferStage } from "../effects/welcome-offer-stage"

export function AisleCrossfadeRouteDemo({
  pace = 1,
  intensity = 0.28,
  style = "crossfade",
  direction = "horizontal",
}: {
  pace?: number
  intensity?: number
  style?: AisleStyle
  direction?: AisleDirection
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <AisleCrossfadeRoute pace={pace} intensity={intensity} style={style} direction={direction} />
    </div>
  )
}

export function ApronSlideSheetDemo({
  pace = 1,
  intensity = 0.3,
  edge = "end",
  scrimBlur = 0,
}: {
  pace?: number
  intensity?: number
  edge?: ApronEdge
  scrimBlur?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ApronSlideSheet pace={pace} intensity={intensity} edge={edge} scrimBlur={scrimBlur} />
    </div>
  )
}

export function WelcomeOfferStageDemo({
  pace = 1,
  intensity = 0.32,
  emphasis = 0.55,
  scrimOpacity = 0.28,
}: {
  pace?: number
  intensity?: number
  emphasis?: number
  scrimOpacity?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <WelcomeOfferStage pace={pace} intensity={intensity} emphasis={emphasis} scrimOpacity={scrimOpacity} />
    </div>
  )
}

export function HazeAmbientVeilDemo({
  pace = 1,
  intensity = 0.28,
  tint = "muted",
  lift = 0.2,
}: {
  pace?: number
  intensity?: number
  tint?: HazeTint
  lift?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <HazeAmbientVeil pace={pace} intensity={intensity} tint={tint} lift={lift} />
    </div>
  )
}

export function SillGleamPassDemo({
  pace = 1,
  intensity = 0.18,
  path = "edge",
  loop = true,
}: {
  pace?: number
  intensity?: number
  path?: GleamPath
  loop?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <SillGleamPass pace={pace} intensity={intensity} path={path} loop={loop} />
    </div>
  )
}

export function ScrimCleanDismissDemo({
  pace = 1,
  intensity = 0.3,
  exitStyle = "fade",
  closeOnScrim = true,
}: {
  pace?: number
  intensity?: number
  exitStyle?: ExitStyle
  closeOnScrim?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ScrimCleanDismiss pace={pace} intensity={intensity} exitStyle={exitStyle} closeOnScrim={closeOnScrim} />
    </div>
  )
}
