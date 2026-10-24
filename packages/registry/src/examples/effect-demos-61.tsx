"use client"

import { Award } from "../effects/award"
import { EmojiSpreeChoiceChips } from "../effects/emoji-spree-choice-chips"
import { InlineAction } from "../effects/inline-action"
import { LabeledProgressIndicator } from "../effects/labeled-progress-indicator"
import { TooltipNavbar } from "../effects/tooltip-navbar"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const interests = [
  { id: "read", label: "阅读", emoji: "📚" },
  { id: "walk", label: "散步", emoji: "🚶" },
  { id: "cook", label: "下厨", emoji: "🍳" },
  { id: "film", label: "电影", emoji: "🎬" },
  { id: "music", label: "音乐", emoji: "🎵" },
  { id: "note", label: "笔记", emoji: "📝" },
]

const journal = [
  { id: "dawn", day: 12, month: "十月", content: "清晨的光停在桌上。" },
  { id: "noon", day: 13, month: "十月", content: "午后把笔记补完。" },
]

export function InlineActionDemo({
  color = "var(--primary)",
  duration = 800,
  intensity = 120,
  speed = 1,
  size = 48,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <InlineAction
        label="草稿已保存"
        icon={<span className="text-sm font-bold">存</span>}
        actionText="同步"
        color={color}
        duration={duration}
        intensity={intensity}
        speed={speed}
        size={size}
        onAction={() => new Promise((resolve) => window.setTimeout(resolve, 700))}
      />
    </div>
  )
}

export function EmojiSpreeChoiceChipsDemo({
  color = "var(--primary)",
  duration = 1000,
  intensity = 12,
  count = 3,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  count?: number
  speed?: number
} = {}) {
  return (
    <EmojiSpreeChoiceChips interests={interests} color={color} duration={duration} intensity={intensity} count={count} speed={speed} />
  )
}

export function AwardDemo({
  color = "var(--primary)",
  duration = 700,
  intensity = 1,
  size = 192,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <Award title="年度手账" subtitle="写给还没写完的一周" recipient="周宁" date="2026" color={color} duration={duration} intensity={intensity} size={size} />
    </div>
  )
}

export function TooltipNavbarDemo({
  direction = "up",
  color = "var(--muted)",
  duration = 300,
  intensity = 40,
  speed = 1,
}: {
  direction?: "up" | "down" | "left" | "right"
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  return (
    <div className={`${frame} min-h-96`}>
      <TooltipNavbar direction={direction} color={color} duration={duration} intensity={intensity} speed={speed} />
    </div>
  )
}

export function LabeledProgressIndicatorDemo({
  color = "var(--primary)",
  duration = 2000,
  intensity = 60,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <LabeledProgressIndicator labels={["整理", "写入", "核对"]} color={color} duration={duration} intensity={intensity} speed={speed} />
    </div>
  )
}







