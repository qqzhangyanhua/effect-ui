"use client"

import { useState } from "react"

import { CopyField } from "../effects/copy-field"
import { GlowLightSwitch } from "../effects/glow-light-switch"
import { HamburgerMorph } from "../effects/hamburger-morph"
import { HueWaveLoader } from "../effects/hue-wave-loader"
import { LeverSwitch } from "../effects/lever-switch"
import { LiftGradientBorderButton } from "../effects/lift-gradient-border-button"
import { MicSearchInput } from "../effects/mic-search-input"
import { MinimalAccordion } from "../effects/minimal-accordion"
import { MoonSunSwitch } from "../effects/moon-sun-switch"
import { Neon3dRadio } from "../effects/neon-3d-radio"
import { NeubrutalismToggle } from "../effects/neubrutalism-toggle"
import { NewsletterInput } from "../effects/newsletter-input"
import { PinDisplayInput } from "../effects/pin-display-input"
import { SocialFollowTooltip } from "../effects/social-follow-tooltip"
import { StarRibbonNotification } from "../effects/star-ribbon-notification"

const radioOptions = [
  { value: "yes", label: "是" },
  { value: "no", label: "否" },
  { value: "idk", label: "不确定" },
]

const accordionItems = [
  { value: "explore", title: "探索资料", content: "用可展开的面板浏览一组说明。" },
  { value: "learn", title: "学习方式", content: "一次只展开一项，或改成多项同时展开。" },
  { value: "grow", title: "进度记录", content: "标题按钮带有展开状态。" },
]

export function HueWaveLoaderDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <HueWaveLoader />
    </div>
  )
}

export function LiftGradientBorderButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <LiftGradientBorderButton />
    </div>
  )
}

export function LeverSwitchDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <LeverSwitch className="text-[28px]" />
    </div>
  )
}

export function Neon3dRadioDemo() {
  const [value, setValue] = useState("no")
  return (
    <div className="flex justify-center px-6 py-10">
      <Neon3dRadio onValueChange={setValue} options={radioOptions} value={value} />
    </div>
  )
}

export function StarRibbonNotificationDemo() {
  return (
    <div className="flex justify-center px-10 py-8">
      <StarRibbonNotification />
    </div>
  )
}

export function MoonSunSwitchDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <MoonSunSwitch className="text-[22px]" />
    </div>
  )
}

export function GlowLightSwitchDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <GlowLightSwitch />
    </div>
  )
}

export function HamburgerMorphDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center justify-center gap-4 px-6 py-10">
      <HamburgerMorph onOpenChange={setOpen} open={open} />
      <span className="text-sm text-muted-foreground">{open ? "已展开" : "已收起"}</span>
    </div>
  )
}

export function NeubrutalismToggleDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <NeubrutalismToggle className="scale-150" />
    </div>
  )
}

export function MinimalAccordionDemo() {
  const [value, setValue] = useState<string | readonly string[]>("explore")
  return (
    <div className="mx-auto w-[420px] max-w-full px-6 py-8">
      <MinimalAccordion items={accordionItems} onValueChange={setValue} type="single" value={value} />
    </div>
  )
}

export function MicSearchInputDemo() {
  const [note, setNote] = useState("尚未点击麦克风")
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10">
      <MicSearchInput onMicClick={() => setNote("已收到麦克风点击")} />
      <p className="text-sm text-muted-foreground">{note}</p>
    </div>
  )
}

export function SocialFollowTooltipDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <SocialFollowTooltip handle="studio" href="#follow" name="关注" stats="45k" />
    </div>
  )
}

export function CopyFieldDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <CopyField value="effect-ui.dev/docs" />
    </div>
  )
}

export function NewsletterInputDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  return (
    <div className="flex justify-center px-6 py-10">
      <NewsletterInput
        onSubmit={() => {
          setStatus("loading")
          window.setTimeout(() => setStatus("success"), 600)
        }}
        status={status}
      />
    </div>
  )
}

export function PinDisplayInputDemo() {
  const [value, setValue] = useState("")
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10">
      <PinDisplayInput mask value={value} onValueChange={setValue} />
      <p className="text-sm text-muted-foreground">{value.length === 6 ? "六位已填满" : `已输入 ${value.length} 位`}</p>
    </div>
  )
}
