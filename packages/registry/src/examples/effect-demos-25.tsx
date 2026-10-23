"use client"

import { Pencil, Share2 } from "lucide-react"

import { ApertureReveal } from "../effects/aperture-reveal"
import { BoidsEcosystem } from "../effects/boids-ecosystem"
import { CopyButton } from "../effects/copy-button"
import { DistortedGlass } from "../effects/distorted-glass"
import { FeatureVoting } from "../effects/feature-voting"
import { FibonacciLines } from "../effects/fibonacci-lines"
import { FloatingPanel } from "../effects/floating-panel"
import { FlowerMenu } from "../effects/flower-menu"
import { MergingBubbles } from "../effects/merging-bubbles"
import { PopoverForm } from "../effects/popover-form"
import { ShootingStars } from "../effects/shooting-stars"
import { SiblingFocusNav } from "../effects/sibling-focus-nav"
import { SpeedDial } from "../effects/speed-dial"
import { SvgBands } from "../effects/svg-bands"
import { TextExplode } from "../effects/text-explode"

const actions = [
  { label: "编辑", icon: <Pencil className="size-4" /> },
  { label: "分享", icon: <Share2 className="size-4" /> },
]

export function BoidsEcosystemDemo({
  count = 80,
  colors = ["#f5f5f4", "#fde68a", "#93c5fd", "#fca5a5"],
  cursorRadius = 90,
}: {
  count?: number
  colors?: string[]
  cursorRadius?: number
} = {}) {
  return (
    <BoidsEcosystem className="w-full" count={count} colors={colors} cursorRadius={cursorRadius}>
      <p className="text-sm text-white">把指针移进鸟群</p>
    </BoidsEcosystem>
  )
}

export function ShootingStarsDemo({
  frequency = 1.4,
  angle = 32,
  color = "#fde68a",
}: {
  frequency?: number
  angle?: number
  color?: string
} = {}) {
  return <ShootingStars className="w-full" frequency={frequency} angle={angle} color={color} />
}

export function FibonacciLinesDemo() {
  return (
    <FibonacciLines className="w-full">
      <p className="text-sm">斐波那契线框</p>
    </FibonacciLines>
  )
}

export function ApertureRevealDemo() {
  return (
    <ApertureReveal viewportHeight={420} length={2.2} className="w-full rounded-xl">
      <ApertureReveal.Media>
        <div className="bg-linear-to-br from-amber-200 via-orange-400 to-sky-700" />
      </ApertureReveal.Media>
      <ApertureReveal.Headline>
        <ApertureReveal.Lead>打开</ApertureReveal.Lead>
        <ApertureReveal.Opening />
        <ApertureReveal.Trail>光圈</ApertureReveal.Trail>
      </ApertureReveal.Headline>
      <ApertureReveal.Caption>
        <ApertureReveal.Text>镜头随滚动张开，照片填满画面。</ApertureReveal.Text>
      </ApertureReveal.Caption>
      <ApertureReveal.Hint>滚动</ApertureReveal.Hint>
    </ApertureReveal>
  )
}

export function TextExplodeDemo() {
  return <TextExplode className="w-full">收到一条消息</TextExplode>
}

export function DistortedGlassDemo() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-xl bg-[linear-gradient(120deg,#fb7185,#38bdf8,#fde68a)]">
      <DistortedGlass>
        <p className="relative p-6 text-lg font-medium text-slate-950">波纹玻璃</p>
      </DistortedGlass>
    </div>
  )
}

export function MergingBubblesDemo() {
  return <MergingBubbles className="w-full" count={7} />
}

export function SvgBandsDemo() {
  return (
    <SvgBands className="w-full">
      <p className="p-8 text-2xl text-white">流动色带</p>
    </SvgBands>
  )
}

export function SpeedDialDemo() {
  return (
    <div className="flex h-64 w-full items-end justify-center gap-24 pb-4">
      <SpeedDial placement="up" actions={actions} />
      <SpeedDial placement="left" actions={actions} />
      <SpeedDial placement="arc" actions={actions} />
    </div>
  )
}

export function FlowerMenuDemo() {
  return (
    <div className="flex w-full justify-center">
      <FlowerMenu
        count={6}
        duration={0.45}
        items={[
          { href: "#north", label: "北" },
          { href: "#east", label: "东" },
          { href: "#south", label: "南" },
          { href: "#west", label: "西" },
          { href: "#up", label: "上" },
          { href: "#down", label: "下" },
        ]}
      />
    </div>
  )
}

export function SiblingFocusNavDemo() {
  return (
    <SiblingFocusNav
      className="w-full"
      items={[
        { href: "#one", label: "概览" },
        { href: "#two", label: "组件" },
        { href: "#three", label: "动效" },
        { href: "#four", label: "文档" },
      ]}
    />
  )
}

export function PopoverFormDemo({
  label = "留言",
  placeholder = "写一句",
  submitLabel = "发送",
}: {
  label?: string
  placeholder?: string
  submitLabel?: string
} = {}) {
  return (
    <div className="flex min-h-40 w-full items-center justify-center">
      <PopoverForm label={label} placeholder={placeholder} submitLabel={submitLabel} />
    </div>
  )
}

export function FloatingPanelDemo() {
  return (
    <div className="flex min-h-48 w-full items-end justify-center">
      <FloatingPanel button="打开面板" title="快捷笔记" footer={<button type="button" className="text-sm">完成</button>}>
        记下一件待办，点外面即可收起。
      </FloatingPanel>
    </div>
  )
}

export function CopyButtonDemo() {
  return (
    <div className="flex w-full items-center justify-center gap-3">
      <span className="text-sm">effect-ui</span>
      <CopyButton value="effect-ui" />
    </div>
  )
}

export function FeatureVotingDemo() {
  return (
    <FeatureVoting
      className="w-full"
      items={[
        { id: "glass", title: "磨砂玻璃", description: "英雄区的波纹玻璃", votes: 12 },
        { id: "flock", title: "鸟群背景", description: "指针可以驱散", votes: 9 },
        { id: "vote", title: "票数滚动", description: "排序随票数变化", votes: 7 },
      ]}
    />
  )
}
