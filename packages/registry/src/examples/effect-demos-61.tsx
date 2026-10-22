"use client"

import { useState } from "react"
import { Music, Sparkles, WandSparkles } from "lucide-react"
import { Award } from "../effects/award"
import { BudgetCard } from "../effects/budget-card"
import { CarouselNavigator } from "../effects/carousel-navigator"
import { ContextualAiBar } from "../effects/contextual-ai-bar"
import { EmojiSpreeChoiceChips } from "../effects/emoji-spree-choice-chips"
import { FeatureTour } from "../effects/feature-tour"
import { FrequencySelector, type FrequencyData } from "../effects/frequency-selector"
import { InlineAction } from "../effects/inline-action"
import { JournalNavigation } from "../effects/journal-navigation"
import { LabeledProgressIndicator } from "../effects/labeled-progress-indicator"
import { PredictiveText } from "../effects/predictive-text"
import { QuickPaste } from "../effects/quick-paste"
import { StatusPicker } from "../effects/status-picker"
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

const tourSteps = [
  { id: "mark", title: "标一笔", description: "把还没决定的句子留在边上。", icon: <WandSparkles className="size-10" /> },
  { id: "note", title: "注释", description: "点开之后可以改，也可以收起。", icon: <Sparkles className="size-10" /> },
]

const breakdown = [
  { label: "房租", amount: 1600, color: "var(--chart-1)" },
  { label: "餐饮", amount: 420, color: "var(--chart-2)" },
  { label: "其他", amount: 180, color: "var(--chart-4)" },
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

export function JournalNavigationDemo({
  color = "var(--accent)",
  duration = 300,
  intensity = 1.2,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  return <JournalNavigation entries={journal} color={color} duration={duration} intensity={intensity} speed={speed} />
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

export function CarouselNavigatorDemo({
  color = "var(--primary)",
  duration = 5000,
  intensity = 48,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  const [index, setIndex] = useState(0)
  return (
    <div className={frame}>
      <CarouselNavigator currentIndex={index} onIndexChange={setIndex} color={color} duration={duration} intensity={intensity} speed={speed} />
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

export function FrequencySelectorDemo() {
  const [value, setValue] = useState<FrequencyData>({ type: "Weekly", subValue: "Mon" })
  return (
    <div className={frame}>
      <FrequencySelector value={value} onChange={setValue} />
    </div>
  )
}

export function StatusPickerDemo() {
  return (
    <div className={`${frame} min-h-72`}>
      <StatusPicker
        items={[
          { id: 1, emoji: "🎯", name: "专注" },
          { id: 2, emoji: "💬", name: "会议" },
          { id: 3, emoji: "🌙", name: "离开" },
        ]}
      />
    </div>
  )
}

export function QuickPasteDemo() {
  return (
    <div className={frame}>
      <QuickPaste
        placeholder="邮箱"
        submitText="粘贴"
        onPaste={(value) => (value.trim() ? { name: value.trim() } : null)}
      />
    </div>
  )
}

export function ContextualAiBarDemo() {
  return (
    <div className={frame}>
      <ContextualAiBar
        placeholder="用 AI 改一改"
        musicIcon={<Music className="size-5" />}
        sparkleIcon={<Sparkles className="size-5" />}
        tools={[<span key="a">剪</span>, <span key="b">调</span>]}
      />
    </div>
  )
}

export function PredictiveTextDemo() {
  return (
    <div className={frame}>
      <PredictiveText placeholder="写一句" />
    </div>
  )
}

export function FeatureTourDemo() {
  const [open, setOpen] = useState(true)
  if (!open) {
    return (
      <div className={frame}>
        <button type="button" className="rounded-full bg-primary px-4 py-2 text-primary-foreground" onClick={() => setOpen(true)}>
          再看一遍
        </button>
      </div>
    )
  }
  return (
    <div className={frame}>
      <FeatureTour steps={tourSteps} onClose={() => setOpen(false)} onLearnMore={() => setOpen(false)} />
    </div>
  )
}

export function BudgetCardDemo() {
  return (
    <div className="mx-auto w-full max-w-lg px-6 py-10">
      <BudgetCard month="July" totalBudget={2400} spentAmount={2200} breakdown={breakdown} />
    </div>
  )
}
