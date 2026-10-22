"use client"

import { AICitations } from "../effects/ai-citations"
import { AITextLoading } from "../effects/ai-text-loading"
import { AITokenAlternatives } from "../effects/ai-token-alternatives"
import { AIVoice } from "../effects/ai-voice"
import { AttractButton } from "../effects/attract-button"
import { AvatarPicker } from "../effects/avatar-picker"
import { ClipTrimmer } from "../effects/clip-trimmer"
import { CurrencyTransfer } from "../effects/currency-transfer"
import { DotField } from "../effects/dot-field"
import { LiquidGauge } from "../effects/liquid-gauge"
import { LiquidSlider } from "../effects/liquid-slider"
import { ReceiptPrinter } from "../effects/receipt-printer"
import { SpendingRing } from "../effects/spending-ring"
import { TimezonePlanner } from "../effects/timezone-planner"

const film = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="800"><defs><linearGradient id="g" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#0f172a"/><stop offset="0.45" stop-color="#0369a1"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="2400" height="800" fill="url(#g)"/><path d="M0 620 C400 540 700 700 1200 580 C1700 460 2000 520 2400 480 L2400 800 L0 800 Z" fill="#020617" opacity="0.85"/></svg>`,
)}`

export function ReceiptPrinterDemo() {
  return (
    <div className="flex w-full justify-center">
      <ReceiptPrinter
        className="w-full"
        currency="¥"
        items={[
          { name: "澳白", quantity: 2, price: 28 },
          { name: "杏仁可颂", quantity: 1, price: 22 },
        ]}
        merchant="街角咖啡"
        order="#4182"
      />
    </div>
  )
}

export function LiquidGaugeDemo() {
  return (
    <div className="flex w-full justify-center">
      <LiquidGauge className="w-full" label="存储" unit="GB" />
    </div>
  )
}

export function LiquidSliderDemo() {
  return (
    <div className="flex w-full justify-center">
      <LiquidSlider className="w-full" label="今日饮水" unit="毫升" />
    </div>
  )
}

export function AttractButtonDemo() {
  return (
    <div className="flex w-full justify-center py-16">
      <AttractButton>靠近</AttractButton>
    </div>
  )
}

export function DotFieldDemo() {
  return (
    <DotField className="min-h-96 w-full">
      <p className="relative z-10 text-lg font-medium">点阵</p>
    </DotField>
  )
}

export function AITextLoadingDemo() {
  return (
    <AITextLoading
      className="w-full"
      label="加载中"
      showElapsed
      texts={["思考中", "整理中", "快好了"]}
    />
  )
}

export function AIVoiceDemo() {
  return (
    <div className="flex w-full justify-center">
      <AIVoice className="w-full" />
    </div>
  )
}

export function AvatarPickerDemo() {
  return (
    <div className="flex w-full justify-center">
      <AvatarPicker
        className="w-full"
        description="名字决定这张脸。可以转动，也可以点选。"
        submitLabel="继续"
        title="选择头像"
      />
    </div>
  )
}

export function SpendingRingDemo() {
  return (
    <div className="flex w-full justify-center">
      <SpendingRing className="w-full" currency="CNY" title="十月支出" />
    </div>
  )
}

export function AICitationsDemo() {
  return (
    <div className="flex w-full justify-center">
      <AICitations className="w-full" />
    </div>
  )
}

export function AITokenAlternativesDemo() {
  return (
    <div className="flex w-full justify-center">
      <AITokenAlternatives className="w-full" />
    </div>
  )
}

export function TimezonePlannerDemo() {
  return (
    <div className="flex w-full justify-center">
      <TimezonePlanner className="w-full" />
    </div>
  )
}

export function CurrencyTransferDemo() {
  return (
    <div className="flex w-full justify-center">
      <CurrencyTransfer className="w-full" locale="zh-CN" />
    </div>
  )
}

export function ClipTrimmerDemo() {
  return (
    <div className="flex w-full justify-center">
      <ClipTrimmer alt="山谷公路" className="w-full" src={film} />
    </div>
  )
}
