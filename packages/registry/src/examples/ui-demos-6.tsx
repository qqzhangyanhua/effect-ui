"use client"

import { FuseButton } from "../ui/fuse-button"
import { JellyRadio } from "../ui/jelly-radio"
import { LatticeLoader } from "../ui/lattice-loader"
import { PeekRating } from "../ui/peek-rating"
import { PulseHeart } from "../ui/pulse-heart"
import { SlideToConfirm } from "../ui/slide-to-confirm"
import { SpringCheck } from "../ui/spring-check"
import { SquishSwitch } from "../ui/squish-switch"
import { SwipeRow } from "../ui/swipe-row"
import { WarmTooltip } from "../ui/warm-tooltip"

export function SquishSwitchDemo({
  size = "md",
  color = "#2563eb",
  squish = 0.35,
}: {
  size?: "sm" | "md" | "lg"
  color?: string
  squish?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <SquishSwitch aria-label="压扁开关" size={size} color={color} squish={squish} defaultChecked />
    </div>
  )
}

export function JellyRadioDemo({
  stiffness = 320,
  color = "#2563eb",
}: {
  stiffness?: number
  color?: string
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <JellyRadio
        aria-label="尺寸"
        stiffness={stiffness}
        color={color}
        defaultValue="m"
        options={[
          { value: "s", label: "小" },
          { value: "m", label: "中" },
          { value: "l", label: "大" },
        ]}
      />
    </div>
  )
}

export function SpringCheckDemo({
  strokeWidth = 2,
  color = "#2563eb",
  duration = 0.45,
}: {
  strokeWidth?: number
  color?: string
  duration?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <SpringCheck aria-label="弹簧勾选" strokeWidth={strokeWidth} color={color} duration={duration} defaultChecked />
    </div>
  )
}

export function PeekRatingDemo({
  max = 5,
  allowHalf = false,
  color = "#eab308",
}: {
  max?: number
  allowHalf?: boolean
  color?: string
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <PeekRating aria-label="评分" max={max} allowHalf={allowHalf} color={color} defaultValue={3} />
    </div>
  )
}

export function SlideToConfirmDemo({
  label = "滑动确认",
  threshold = 0.85,
  color = "#2563eb",
}: {
  label?: string
  threshold?: number
  color?: string
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <SlideToConfirm label={label} threshold={threshold} color={color} className="w-64" />
    </div>
  )
}

export function SwipeRowDemo({
  actionWidth = 88,
  direction = "left",
}: {
  actionWidth?: number
  direction?: "left" | "right"
} = {}) {
  return (
    <div className="mx-auto w-full max-w-sm p-6">
      <SwipeRow
        actionWidth={actionWidth}
        direction={direction}
        actions={<button type="button" className="bg-destructive px-3 text-sm text-white">删除</button>}
      >
        滑动这一行
      </SwipeRow>
    </div>
  )
}

export function FuseButtonDemo({
  holdMs = 800,
  color = "#2563eb",
}: {
  holdMs?: number
  color?: string
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <FuseButton holdMs={holdMs} color={color}>
        按住确认
      </FuseButton>
    </div>
  )
}

export function PulseHeartDemo({
  size = 28,
  color = "#e11d48",
  burst = 8,
}: {
  size?: number
  color?: string
  burst?: number
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <PulseHeart size={size} color={color} burst={burst} />
    </div>
  )
}

export function LatticeLoaderDemo({
  rows = 4,
  cols = 4,
  speed = 1,
  color = "#2563eb",
}: {
  rows?: number
  cols?: number
  speed?: number
  color?: string
} = {}) {
  return (
    <div className="flex items-center justify-center p-10">
      <LatticeLoader rows={rows} cols={cols} speed={speed} color={color} />
    </div>
  )
}

export function WarmTooltipDemo({
  delay = 200,
  side = "top",
  glow = true,
}: {
  delay?: number
  side?: "top" | "right" | "bottom" | "left"
  glow?: boolean
} = {}) {
  return (
    <div className="flex items-center justify-center p-16">
      <WarmTooltip content="软光提示" delay={delay} side={side} glow={glow}>
        <button type="button" className="rounded-md border px-3 py-1.5 text-sm">
          悬停查看
        </button>
      </WarmTooltip>
    </div>
  )
}
