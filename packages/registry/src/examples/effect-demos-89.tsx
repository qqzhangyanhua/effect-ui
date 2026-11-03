"use client"

import { BuzzRimFlash, type BuzzTone, type NudgeStyle } from "../effects/buzz-rim-flash"
import { ChimeCheckBloom, type BloomStyle, type ChimeKind } from "../effects/chime-check-bloom"
import { LatchGateClick, type LatchStyle } from "../effects/latch-gate-click"
import { MuteConeMorph, type ConeStyle } from "../effects/mute-cone-morph"
import { TickPipConfirm, type PipStyle } from "../effects/tick-pip-confirm"
import { WhooshDartSend, type DartDirection, type DartStyle } from "../effects/whoosh-dart-send"

export function TickPipConfirmDemo({
  pace = 1,
  intensity = 0.28,
  pitch = 880,
  style = "pip",
  muted = true,
}: {
  pace?: number
  intensity?: number
  pitch?: number
  style?: PipStyle
  muted?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <TickPipConfirm pace={pace} intensity={intensity} pitch={pitch} style={style} muted={muted} />
    </div>
  )
}

export function ChimeCheckBloomDemo({
  pace = 1,
  intensity = 0.3,
  style = "check",
  chime = "soft",
  muted = true,
}: {
  pace?: number
  intensity?: number
  style?: BloomStyle
  chime?: ChimeKind
  muted?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <ChimeCheckBloom pace={pace} intensity={intensity} style={style} chime={chime} muted={muted} />
    </div>
  )
}

export function BuzzRimFlashDemo({
  pace = 1,
  intensity = 0.16,
  nudge = "rim",
  tone = "low",
  muted = true,
}: {
  pace?: number
  intensity?: number
  nudge?: NudgeStyle
  tone?: BuzzTone
  muted?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <BuzzRimFlash pace={pace} intensity={intensity} nudge={nudge} tone={tone} muted={muted} />
    </div>
  )
}

export function LatchGateClickDemo({
  pace = 1,
  intensity = 0.26,
  style = "thumb",
  onPitch = 520,
  offPitch = 340,
  muted = true,
}: {
  pace?: number
  intensity?: number
  style?: LatchStyle
  onPitch?: number
  offPitch?: number
  muted?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <LatchGateClick pace={pace} intensity={intensity} style={style} onPitch={onPitch} offPitch={offPitch} muted={muted} />
    </div>
  )
}

export function WhooshDartSendDemo({
  pace = 1,
  intensity = 0.24,
  style = "dart",
  direction = "end",
  muted = true,
}: {
  pace?: number
  intensity?: number
  style?: DartStyle
  direction?: DartDirection
  muted?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <WhooshDartSend pace={pace} intensity={intensity} style={style} direction={direction} muted={muted} />
    </div>
  )
}

export function MuteConeMorphDemo({
  pace = 1,
  intensity = 0.3,
  volume = 0.45,
  style = "cone",
  muted = true,
}: {
  pace?: number
  intensity?: number
  volume?: number
  style?: ConeStyle
  muted?: boolean
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <MuteConeMorph pace={pace} intensity={intensity} volume={volume} style={style} muted={muted} />
    </div>
  )
}
