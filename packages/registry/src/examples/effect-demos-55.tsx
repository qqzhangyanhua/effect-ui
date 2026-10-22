"use client"

import { useState } from "react"
import { ActionSwap } from "../effects/action-swap"
import { ArcPicker } from "../effects/arc-picker"
import { BlurUpImage } from "../effects/blur-up-image"
import { ChromaticTextReveal } from "../effects/chromatic-text-reveal"
import { KnockoutBracket, type Match, type Round } from "../effects/knockout-bracket"
import { NewItemsPill, useNewItems } from "../effects/new-items-pill"
import { OverflowActions } from "../effects/overflow-actions"
import { PressDepth } from "../effects/press-depth"
import { PreviewRail } from "../effects/preview-rail"
import { PullToRefresh } from "../effects/pull-to-refresh"
import { RulerSlider } from "../effects/ruler-slider"
import { TypingIndicator } from "../effects/typing-indicator"
import { ValueFlash } from "../effects/value-flash"
import { WalletCard } from "../effects/wallet-card"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const hillside =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="#78716c"/><circle cx="500" cy="84" r="36" fill="#fafaf9"/><path d="M0 270 L150 170 L270 230 L430 110 L640 250 V400 H0 Z" fill="#44403c"/></svg>`,
  )

const hours = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

function side(name: string, score: number) {
  return { team: { name }, score }
}

function match(id: string, home: string, away: string): Match {
  return {
    id,
    home: side(home, 2),
    away: side(away, 1),
    winner: "home",
    status: "finished",
  }
}

const rounds: Round[] = [
  {
    name: "四分之一决赛",
    matches: [match("q1", "青队", "赤队"), match("q2", "白队", "黑队")],
  },
  { name: "半决赛", matches: [match("s1", "青队", "白队")] },
  { name: "决赛", matches: [match("f1", "青队", "待定")] },
]

export function PressDepthDemo({
  color = "var(--foreground)",
  duration = 180,
  size = 36,
  intensity = 7,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <PressDepth color={color} duration={duration} size={size} intensity={intensity}>
        按下
      </PressDepth>
    </div>
  )
}

export function ValueFlashDemo({
  duration = 900,
  color = "var(--primary)",
  fontSize = 13,
  intensity = 1,
}: {
  duration?: number
  color?: string
  fontSize?: number
  intensity?: number
} = {}) {
  const [value, setValue] = useState(1280)
  return (
    <div className={frame}>
      <div className="flex flex-col items-center gap-4">
        <ValueFlash
          value={value}
          duration={duration}
          color={color}
          fontSize={fontSize}
          intensity={intensity}
          label="余额"
          format={(next) => `¥${next}`}
        />
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onClick={() => setValue((next) => next + 40)}
        >
          加四十
        </button>
      </div>
    </div>
  )
}

export function BlurUpImageDemo({
  color = "var(--muted)",
  intensity = 14,
  duration = 650,
  size = 11,
}: {
  color?: string
  intensity?: number
  duration?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <div className="w-full max-w-md">
        <BlurUpImage
          src={hillside}
          alt="山坡"
          width={640}
          height={400}
          placeholder={hillside}
          color={color}
          intensity={intensity}
          duration={duration}
          size={size}
        />
      </div>
    </div>
  )
}

export function ChromaticTextRevealDemo({
  colors = ["var(--primary)", "var(--ring)", "var(--accent)"],
  color = "var(--foreground)",
  duration = 1200,
  delay = 0,
  interval = 800,
  loop = true,
  fontSize = 48,
}: {
  colors?: string[]
  color?: string
  duration?: number
  delay?: number
  interval?: number
  loop?: boolean
  fontSize?: number
} = {}) {
  return (
    <div className={frame}>
      <ChromaticTextReveal
        prefix="动效要显得"
        words={["自然。", "克制。", "有生命。"]}
        colors={colors}
        color={color}
        duration={duration}
        delay={delay}
        interval={interval}
        loop={loop}
        fontSize={fontSize}
      />
    </div>
  )
}

const swapItems = [
  { id: "copy", label: "复制链接", ariaLabel: "复制链接" },
  { id: "copied", label: "已复制", ariaLabel: "已复制" },
]

export function ActionSwapDemo({
  color = "var(--foreground)",
  duration = 280,
  size = 40,
  intensity = 1,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  return (
    <div className={`${frame} flex-wrap gap-3`}>
      <ActionSwap variant="blur" items={swapItems} color={color} duration={duration} size={size} intensity={intensity} />
      <ActionSwap variant="roll" items={swapItems} color={color} duration={duration} size={size} intensity={intensity} />
      <ActionSwap variant="cascade" items={swapItems} color={color} duration={duration} size={size} intensity={intensity} />
    </div>
  )
}

export function PullToRefreshDemo({
  color = "var(--foreground)",
  duration = 420,
  size = 36,
  intensity = 1,
}: {
  color?: string
  duration?: number
  size?: number
  intensity?: number
} = {}) {
  const [count, setCount] = useState(3)
  return (
    <div className="mx-auto h-80 w-full max-w-sm px-6 py-6">
      <PullToRefresh
        color={color}
        duration={duration}
        size={size}
        intensity={intensity}
        pullingLabel="下拉刷新"
        releaseLabel="松开刷新"
        refreshingLabel="正在刷新"
        ariaLabel="可刷新的列表"
        onRefresh={() => setCount((next) => next + 1)}
      >
        <ul className="space-y-2 p-4 text-sm">
          {Array.from({ length: count }, (_, index) => (
            <li key={index} className="rounded-lg border border-border px-3 py-2">
              第 {index + 1} 条
            </li>
          ))}
        </ul>
      </PullToRefresh>
    </div>
  )
}

export function ArcPickerDemo({
  color = "var(--primary)",
  duration = 180,
  size = 48,
  count = 7,
}: {
  color?: string
  duration?: number
  size?: number
  count?: number
} = {}) {
  return (
    <div className="flex min-h-[28rem] w-full items-center justify-center px-6 py-8">
      <ArcPicker
        options={hours.map((label) => ({ value: label, label }))}
        defaultValue="午"
        side="right"
        color={color}
        duration={duration}
        size={size}
        count={count}
        aria-label="时辰"
      />
    </div>
  )
}

export function NewItemsPillDemo() {
  const [items, setItems] = useState(["清晨", "午后", "傍晚", "夜里"])
  const { scrollProps, unread, jump } = useNewItems<HTMLDivElement>({ itemCount: items.length })
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-3 px-6 py-8">
      <button
        type="button"
        className="self-start rounded-md border border-border px-3 py-1.5 text-sm"
        onClick={() => setItems((prev) => [`新的一条 ${prev.length + 1}`, ...prev])}
      >
        加一条
      </button>
      <div className="relative h-64">
        <NewItemsPill count={unread} onJump={jump} label={(count) => `${count} 条新内容`} />
        <div {...scrollProps} className="h-full overflow-auto rounded-xl border border-border">
          {items.map((item, index) => (
            <div key={`${item}-${index}`} className="border-b border-border px-3 py-3 text-sm">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicatorDemo() {
  return (
    <div className={frame}>
      <div className="w-full max-w-sm">
        <TypingIndicator typists={["林", "周"]} />
      </div>
    </div>
  )
}

export function KnockoutBracketDemo() {
  return (
    <div className="w-full overflow-x-auto px-4 py-8">
      <KnockoutBracket rounds={rounds} initialRound={0} />
    </div>
  )
}

export function RulerSliderDemo() {
  return (
    <div className={frame}>
      <div className="w-full max-w-md">
        <RulerSlider min={40} max={120} step={0.5} defaultValue={72.5} unit="kg" aria-label="体重" />
      </div>
    </div>
  )
}

export function OverflowActionsDemo() {
  return (
    <div className={frame}>
      <OverflowActions
        openLabel="展开更多"
        closeLabel="收起"
        primaryActions={[
          { id: "preview", label: "预览" },
          { id: "pin", label: "置顶" },
        ]}
        overflowActions={[
          { id: "branch", label: "分支" },
          { id: "schedule", label: "定时" },
        ]}
      />
    </div>
  )
}

export function PreviewRailDemo() {
  return (
    <div className="flex min-h-80 w-full items-center justify-center px-6 py-10">
      <div className="relative h-64 w-full max-w-md">
        <PreviewRail
          label="章节"
          items={[
            { id: "intro", label: "序言", description: "从这里开始。" },
            { id: "materials", label: "材料", description: "清单与用量。" },
            { id: "steps", label: "步骤", description: "按顺序做。" },
          ]}
        />
      </div>
    </div>
  )
}

export function WalletCardDemo() {
  return (
    <div className={frame}>
      <WalletCard
        className="w-full max-w-sm"
        accounts={[
          { id: "daily", name: "日常", address: "0x12ab34cd90ef" },
          { id: "save", name: "储蓄", address: "0x98cd10ab34ef" },
        ]}
        balance={12840.5}
        defaultChange={2.4}
        searchPlaceholder="搜索"
        searchRecent={["午餐", "地铁"]}
        hasNotifications
      />
    </div>
  )
}
