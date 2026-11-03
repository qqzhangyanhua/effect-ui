"use client"

import { CaretWelcomeRing, type CaretKind, type WelcomeStyle } from "../effects/caret-welcome-ring"
import { FloatLabelSettle, type RestPlace, type SettleStyle } from "../effects/float-label-settle"
import { InlineAlertRail, type AlertIcon, type NudgeKind } from "../effects/inline-alert-rail"
import { MeterRuleTicks, type MeterStyle } from "../effects/meter-rule-ticks"
import { OtpCellCascade, type CellStyle } from "../effects/otp-cell-cascade"
import { SubmitCheckFlare, type FlareAnchor, type FlareStyle } from "../effects/submit-check-flare"

export function CaretWelcomeRingDemo({
  pace = 1,
  intensity = 0.34,
  style = "ring",
  caret = "bar",
}: {
  pace?: number
  intensity?: number
  style?: WelcomeStyle
  caret?: CaretKind
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <CaretWelcomeRing pace={pace} intensity={intensity} style={style} caret={caret} />
    </div>
  )
}

export function FloatLabelSettleDemo({
  pace = 1,
  intensity = 0.45,
  style = "float",
  rest = "above",
}: {
  pace?: number
  intensity?: number
  style?: SettleStyle
  rest?: RestPlace
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <FloatLabelSettle pace={pace} intensity={intensity} style={style} rest={rest} />
    </div>
  )
}

export function InlineAlertRailDemo({
  pace = 1,
  intensity = 0.18,
  nudge = "rim",
  icon = "alert",
}: {
  pace?: number
  intensity?: number
  nudge?: NudgeKind
  icon?: AlertIcon
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <InlineAlertRail pace={pace} intensity={intensity} nudge={nudge} icon={icon} />
    </div>
  )
}

export function OtpCellCascadeDemo({
  pace = 1,
  intensity = 0.4,
  cells = 6,
  style = "box",
}: {
  pace?: number
  intensity?: number
  cells?: number
  style?: CellStyle
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <OtpCellCascade pace={pace} intensity={intensity} cells={cells} style={style} />
    </div>
  )
}

export function MeterRuleTicksDemo({
  pace = 1,
  intensity = 0.4,
  style = "bar",
  rules = 4,
}: {
  pace?: number
  intensity?: number
  style?: MeterStyle
  rules?: number
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <MeterRuleTicks pace={pace} intensity={intensity} style={style} rules={rules} />
    </div>
  )
}

export function SubmitCheckFlareDemo({
  pace = 1,
  intensity = 0.32,
  style = "check",
  anchor = "button",
}: {
  pace?: number
  intensity?: number
  style?: FlareStyle
  anchor?: FlareAnchor
} = {}) {
  return (
    <div className="w-full max-w-xl px-6 py-10">
      <SubmitCheckFlare pace={pace} intensity={intensity} style={style} anchor={anchor} />
    </div>
  )
}
