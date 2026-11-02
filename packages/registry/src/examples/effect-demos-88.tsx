"use client"

import { BrimFlickInk, type BrimEdge } from "../effects/brim-flick-ink"
import { EchoFocusTwin, type TwinStyle } from "../effects/echo-focus-twin"
import { NestSoftHalo, type HaloFit, type NestTrigger } from "../effects/nest-soft-halo"
import { NibCrumbFade, type CrumbStyle } from "../effects/nib-crumb-fade"
import { PressSnapBeacon, type BeaconStyle } from "../effects/press-snap-beacon"
import { ScrubGhostWhisk, type WhiskStyle } from "../effects/scrub-ghost-whisk"

export function NibCrumbFadeDemo({
  pace = 1,
  intensity = 0.28,
  density = 5,
  style = "dot",
}: {
  pace?: number
  intensity?: number
  density?: number
  style?: CrumbStyle
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <NibCrumbFade pace={pace} intensity={intensity} density={density} style={style} />
    </div>
  )
}

export function PressSnapBeaconDemo({
  pace = 1,
  intensity = 0.32,
  style = "ring",
  count = 1,
}: {
  pace?: number
  intensity?: number
  style?: BeaconStyle
  count?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <PressSnapBeacon pace={pace} intensity={intensity} style={style} count={count} />
    </div>
  )
}

export function NestSoftHaloDemo({
  pace = 1,
  intensity = 0.22,
  fit = "pad",
  trigger = "both",
}: {
  pace?: number
  intensity?: number
  fit?: HaloFit
  trigger?: NestTrigger
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <NestSoftHalo pace={pace} intensity={intensity} fit={fit} trigger={trigger} />
    </div>
  )
}

export function EchoFocusTwinDemo({
  pace = 1,
  intensity = 0.24,
  style = "corners",
  keyboardOnly = true,
}: {
  pace?: number
  intensity?: number
  style?: TwinStyle
  keyboardOnly?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <EchoFocusTwin pace={pace} intensity={intensity} style={style} keyboardOnly={keyboardOnly} />
    </div>
  )
}

export function ScrubGhostWhiskDemo({
  pace = 1,
  intensity = 0.3,
  style = "line",
  linger = 0,
}: {
  pace?: number
  intensity?: number
  style?: WhiskStyle
  linger?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ScrubGhostWhisk pace={pace} intensity={intensity} style={style} linger={linger} />
    </div>
  )
}

export function BrimFlickInkDemo({
  pace = 1,
  intensity = 0.16,
  edge = "top",
  oncePerEnter = true,
}: {
  pace?: number
  intensity?: number
  edge?: BrimEdge
  oncePerEnter?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <BrimFlickInk pace={pace} intensity={intensity} edge={edge} oncePerEnter={oncePerEnter} />
    </div>
  )
}
