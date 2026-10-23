"use client"

import { useState } from "react"

import { AchievementToast } from "../effects/achievement-toast"
import { Callout } from "../effects/callout"
import { CssPatternBackground } from "../effects/css-pattern-background"
import { DownloadSizeButton } from "../effects/download-size-button"
import { ExpandingIconTabs } from "../effects/expanding-icon-tabs"
import { EyeBlinkLoader } from "../effects/eye-blink-loader"
import { GridTiltCard } from "../effects/grid-tilt-card"
import { HeartLikeButton } from "../effects/heart-like-button"
import { HeartbeatButton } from "../effects/heartbeat-button"
import { ImageFade } from "../effects/image-fade"
import { LayeredGlassCard } from "../effects/layered-glass-card"
import { NeubrutalismButton } from "../effects/neubrutalism-button"
import { ProgressCircle } from "../effects/progress-circle"
import { SlideToggle } from "../effects/slide-toggle"
import { ThreeDButton } from "../effects/3d-button"

function scene() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#312e81"/><rect y="210" width="100%" height="150" fill="#166534"/><circle cx="480" cy="80" r="36" fill="#fde68a"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function GridTiltCardDemo({
  heading = "纯 CSS 倾斜",
  subtitle = "5×5 追踪格",
  prompt = "悬停看看",
}: { heading?: string; subtitle?: string; prompt?: string } = {}) {
  return (
    <div className="flex justify-center px-6 py-8">
      <GridTiltCard heading={heading} prompt={prompt} subtitle={subtitle} />
    </div>
  )
}

export function LayeredGlassCardDemo({
  title = "分层玻璃",
  description = "五层圆在悬停时向前探出。",
  actionLabel = "看细节",
}: { title?: string; description?: string; actionLabel?: string } = {}) {
  return (
    <div className="flex justify-center px-6 py-8">
      <LayeredGlassCard
        actionLabel={actionLabel}
        description={description}
        title={title}
        icon={
          <svg aria-hidden className="size-5 fill-primary-foreground" viewBox="0 0 24 24">
            <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.8 5.7 20.8 8 13.6 2 9.2h7.6z" />
          </svg>
        }
      />
    </div>
  )
}

export function EyeBlinkLoaderDemo() {
  return (
    <div className="flex justify-center px-6 py-16">
      <EyeBlinkLoader />
    </div>
  )
}

export function CssPatternBackgroundDemo({
  variant = "stripes",
  color,
  speed = 4,
}: {
  variant?: "stripes" | "dots" | "honeycomb"
  color?: string
  speed?: number
} = {}) {
  return (
    <div className="mx-auto grid w-[720px] max-w-full grid-cols-3 gap-3 p-6">
      <CssPatternBackground className="h-36 w-full rounded-xl" variant={variant} color={color} speed={speed} />
      <CssPatternBackground className="h-36 w-full rounded-xl" color="#38bdf8" variant="dots" />
      <CssPatternBackground className="h-36 w-full rounded-xl" color="#f5f5f4" size={4} variant="honeycomb" />
    </div>
  )
}

export function HeartbeatButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <HeartbeatButton>心跳</HeartbeatButton>
    </div>
  )
}

export function NeubrutalismButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <NeubrutalismButton>粗野</NeubrutalismButton>
    </div>
  )
}

export function ThreeDButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <ThreeDButton>立体</ThreeDButton>
    </div>
  )
}

export function ImageFadeDemo({
  alt = "渐隐的风景",
  direction = "up",
  fadeSize = 20,
}: { alt?: string; direction?: "left" | "right" | "up" | "down"; fadeSize?: number } = {}) {
  return (
    <div className="mx-auto max-w-xl px-6 py-6">
      <ImageFade alt={alt} direction={direction} fadeSize={fadeSize} src={scene()} />
    </div>
  )
}

export function ProgressCircleDemo() {
  return (
    <div className="flex justify-center px-6 py-8">
      <ProgressCircle value={64}>64</ProgressCircle>
    </div>
  )
}

export function CalloutDemo() {
  return (
    <div className="mx-auto max-w-md px-6 py-6">
      <Callout icon={<span aria-hidden>!</span>} title="航线已核对" variant="success">
        北窗到灯塔这一段可以走。
      </Callout>
    </div>
  )
}

export function ExpandingIconTabsDemo() {
  const tabs = [
    { value: "general", label: "总览", icon: <span>✧</span> },
    { value: "about", label: "关于", icon: <span>i</span> },
    { value: "privacy", label: "隐私", icon: <span>◉</span> },
  ]
  const [value, setValue] = useState("general")
  const current = tabs.find((tab) => tab.value === value)
  return (
    <div className="px-6 py-6">
      <ExpandingIconTabs onValueChange={setValue} tabs={tabs} value={value} />
      <p className="mt-3 text-sm text-muted-foreground">当前：{current?.label}</p>
    </div>
  )
}

export function SlideToggleDemo({
  defaultChecked = false,
  offLabel = "关",
  onLabel = "开",
}: {
  defaultChecked?: boolean
  offLabel?: string
  onLabel?: string
} = {}) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="flex justify-center px-6 py-10">
      <SlideToggle checked={checked} defaultChecked={defaultChecked} offLabel={offLabel} onCheckedChange={setChecked} onLabel={onLabel} />
    </div>
  )
}

export function HeartLikeButtonDemo() {
  const [liked, setLiked] = useState(false)
  return (
    <div className="flex justify-center px-6 py-8">
      <HeartLikeButton count={liked ? 13 : 12} liked={liked} onLikedChange={setLiked} />
    </div>
  )
}

export function DownloadSizeButtonDemo({
  size = 20,
  label = "甲板日志",
  href = "#deck-log",
}: { size?: number; label?: string; href?: string } = {}) {
  return (
    <div className="flex justify-center px-6 pt-16 pb-8">
      <DownloadSizeButton href={href} label={label} size={size} />
    </div>
  )
}

export function AchievementToastDemo() {
  const [done, setDone] = useState(false)
  return (
    <div className="flex justify-center px-6 py-8">
      <AchievementToast actionLabel={done ? "已领取" : "下一级"} onAction={() => setDone(true)} subtitle="等级 5" title="升级" />
    </div>
  )
}
