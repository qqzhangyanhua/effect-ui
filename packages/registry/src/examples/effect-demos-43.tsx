"use client"

import { useState } from "react"

import { BatteryLoader } from "../effects/battery-loader"
import { CornerIndicator } from "../effects/corner-indicator"
import { FileInput } from "../effects/file-input"
import { FilterChips } from "../effects/filter-chips"
import { FormValidator } from "../effects/form-validator"
import { GlassClockLoader } from "../effects/glass-clock-loader"
import { HoverGallery } from "../effects/hover-gallery"
import { IconSwap } from "../effects/icon-swap"
import { PacmanLoader } from "../effects/pacman-loader"
import { PhoneRingLoader } from "../effects/phone-ring-loader"
import { PixelBirdLoader } from "../effects/pixel-bird-loader"
import { RingedPlanetLoader } from "../effects/ringed-planet-loader"
import { SiteFooter } from "../effects/site-footer"
import { TickRange } from "../effects/tick-range"

function swatch(color: string, label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='520'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='54%' fill='white' font-size='42' font-family='sans-serif' text-anchor='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const frames = [
  { src: swatch("#0f766e", "潮汐"), alt: "潮汐" },
  { src: swatch("#9a3412", "峡谷"), alt: "峡谷" },
  { src: swatch("#1e3a8a", "夜港"), alt: "夜港" },
]

const planetColors = ["#546c8c", "#bacbd9", "#7ea1bf", "#3c4359", "#bacbd9"]

const groups = [
  {
    title: "快速入口",
    links: [
      { label: "首页", href: "#home" },
      { label: "我们是谁", href: "#about" },
      { label: "方法", href: "#method" },
    ],
  },
  {
    title: "行业",
    links: [
      { label: "零售", href: "#retail" },
      { label: "信息技术", href: "#it" },
      { label: "金融", href: "#finance" },
    ],
  },
]

const social = [
  { label: "讨论", href: "#talk" },
  { label: "动态", href: "#feed" },
  { label: "代码", href: "#code" },
]

export function PacmanLoaderDemo() {
  return <PacmanLoader color="#EFF107" size={50} />
}

export function BatteryLoaderDemo() {
  return <BatteryLoader color="#00F45B" duration={2} />
}

export function RingedPlanetLoaderDemo() {
  return <RingedPlanetLoader colors={planetColors} label="正在装载" size={220} />
}

export function PixelBirdLoaderDemo() {
  return <PixelBirdLoader size={220} speed={1} />
}

export function PhoneRingLoaderDemo() {
  return <PhoneRingLoader color="#0d85aa" label="正在接通" size={208} />
}

export function GlassClockLoaderDemo() {
  return <GlassClockLoader size={180} tint="rgba(255,255,255,0.55)" />
}

export function HoverGalleryDemo() {
  return <HoverGallery alt="画幅" className="max-w-md" images={frames} progress />
}

export function IconSwapDemo() {
  const [pressed, setPressed] = useState(false)
  return (
    <IconSwap
      aria-label={pressed ? "已打开" : "已关闭"}
      effect="rotate"
      off={<span className="grid size-10 place-items-center rounded-full bg-muted text-sm">关</span>}
      on={<span className="grid size-10 place-items-center rounded-full bg-primary text-sm text-primary-foreground">开</span>}
      pressed={pressed}
      onPressedChange={setPressed}
    />
  )
}

export function FormValidatorDemo() {
  return <FormValidator required className="max-w-xs" hint="请填写邮箱" label="邮箱" placeholder="name@example.com" type="email" />
}

export function CornerIndicatorDemo() {
  return (
    <CornerIndicator
      items={[
        { label: "3", vertical: "top", horizontal: "end" },
        { label: "新", vertical: "bottom", horizontal: "start" },
      ]}
    >
      <span className="grid size-16 place-items-center rounded-md bg-muted text-sm">收件</span>
    </CornerIndicator>
  )
}

export function FilterChipsDemo() {
  const [value, setValue] = useState("")
  return (
    <FilterChips
      name="topic"
      options={[
        { value: "all", label: "全部" },
        { value: "ui", label: "界面" },
        { value: "motion", label: "动效" },
      ]}
      value={value}
      onValueChange={setValue}
    />
  )
}

export function FileInputDemo() {
  const [count, setCount] = useState(0)
  return (
    <div className="grid gap-2">
      <FileInput accept="image/*" aria-label="选择图片" fieldSize="md" multiple onFilesChange={(files) => setCount(files.length)} />
      <p className="text-sm text-muted-foreground">已选 {count} 个文件</p>
    </div>
  )
}

export function TickRangeDemo() {
  const [value, setValue] = useState(40)
  return <TickRange aria-label="音量" max={100} min={0} step={1} ticks={5} value={value} onValueChange={setValue} />
}

export function SiteFooterDemo() {
  const [sent, setSent] = useState("")
  return (
    <div className="grid gap-10">
      <SiteFooter
        brand="北窗"
        copyright="© 2026 北窗"
        groups={groups}
        heading="订阅更新，我们会把新组件寄到邮箱。"
        social={social}
        variant="subscribe"
        onSubscribe={setSent}
      />
      {sent ? <p className="text-sm text-muted-foreground">已记下 {sent}</p> : null}
      <SiteFooter brand="北窗" copyright="© 2026 北窗" ctaHref="#join" ctaLabel="现在加入" groups={groups} heading="把下一次发布留给现在。" variant="cta" />
      <SiteFooter brand="北窗" copyright="© 2026 北窗。保留所有权利。" social={social} variant="simple" />
    </div>
  )
}
