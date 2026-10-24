"use client"

import { useState } from "react"
import { Github } from "lucide-react"

import { AgentIntroSequence, type AgentIntroPhase } from "../effects/agent-intro-sequence"
import { CharShimmerLoader } from "../effects/char-shimmer-loader"
import { ChatMessageList } from "../effects/chat-message-list"
import { ExpandableChat, ExpandableChatBody, ExpandableChatFooter, ExpandableChatHeader } from "../effects/expandable-chat"
import { HoverBlocksGrid } from "../effects/hover-blocks-grid"


import { LiquidGradientButton } from "../effects/liquid-gradient-button"
import { MessageLoading } from "../effects/message-loading"
import { ProgressiveCarousel } from "../effects/progressive-carousel"
import { ScrollBlurText } from "../effects/scroll-blur-text"

import { TimelineReveal } from "../effects/timeline-reveal"

const liquidColors = ["#FFFFFF", "#1E10C5", "#9089E2", "#FCFCFE", "#F9F9FD", "#B2B8E7", "#0E2DCB", "#0017E9", "#4743EF", "#7D7BF4", "#0B06FC", "#C5C1EA", "#1403DE", "#B6BAF6", "#C1BEEB", "#290ECB", "#3F4CC0"]

function swatch(color: string, label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='400'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='54%' fill='white' font-size='42' font-family='sans-serif' text-anchor='middle'>${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const slides = [
  { value: "bridge", title: "桥", description: "夜里的桥只剩下灯。", imageUrl: swatch("#1e3a8a", "桥"), imageAlt: "深蓝色块，写着桥" },
  { value: "ridge", title: "山脊", description: "云贴着山脊走。", imageUrl: swatch("#3f6212", "山脊"), imageAlt: "绿色色块，写着山脊" },
  { value: "fog", title: "雾", description: "雾把远处收成一层。", imageUrl: swatch("#57534e", "雾"), imageAlt: "灰色色块，写着雾" },
]

const sequence: readonly AgentIntroPhase[] = [
  { type: "divider" },
  { type: "bar", labels: ["扫描", "分析", "完成"], icons: ["✦", "◆", "✶"], duration: 1600, tokenTarget: 0.4, showPercent: true },
  { type: "lines", lines: ["读到许可", "开始移植"] },
  { type: "message", text: "可以开始了" },
]

export function LiquidGradientButtonDemo() {
  return (
    <div className="flex justify-center px-6 py-10">
      <LiquidGradientButton colors={liquidColors} href="https://github.com/ui-layouts/uilayouts">
        <Github className="size-4" />
        Github
      </LiquidGradientButton>
    </div>
  )
}

export function HoverBlocksGridDemo() {
  return (
    <HoverBlocksGrid
      active={[[0, 2], [0, 4], [1, 0], [2, 1], [2, 3], [4, 2], [5, 0]]}
      className="h-64"
    />
  )
}

export function CharShimmerLoaderDemo({
  duration = 2400,
  fontSize = 14,
  showPercent = true,
}: { duration?: number; fontSize?: number; showPercent?: boolean } = {}) {
  const [round, setRound] = useState(0)
  return (
    <div className="bg-neutral-950 px-6 py-10 text-white">
      <CharShimmerLoader
        duration={duration}
        fontSize={fontSize}
        icons={["✦", "◆", "✶"]}
        key={round}
        labels={["分析中", "还在分析", "分析完成"]}
        onComplete={() => setRound((value) => value + 1)}
        showPercent={showPercent}
        textClassName="text-violet-100"
        tokenTarget={0.16}
      />
    </div>
  )
}
export function TimelineRevealDemo({
  animationNum = 0,
  as = "div",
  once = true,
}: {
  animationNum?: number
  as?: "div" | "p" | "h2" | "h3" | "li" | "span"
  once?: boolean
} = {}) {
  return (
    <div className="space-y-3 px-6 py-10">
      <TimelineReveal animationNum={animationNum} as={as} once={once}>
        先读许可
      </TimelineReveal>
      <TimelineReveal animationNum={1}>再写组件</TimelineReveal>
      <TimelineReveal animationNum={2}>最后登记</TimelineReveal>
    </div>
  )
}

export function ScrollBlurTextDemo({
  text = "按词出现的一行句子",
  direction = "down",
  as = "h2",
}: {
  text?: string
  direction?: "up" | "down" | "left" | "right"
  as?: "h1" | "h2" | "p" | "span" | "div"
} = {}) {
  return (
    <div className="px-6 py-10">
      <ScrollBlurText as={as} direction={direction} text={text} />
    </div>
  )
}

export function ExpandableChatDemo() {
  return (
    <div className="relative h-[28rem] w-full">
      <ExpandableChat>
        <ExpandableChatHeader>值班助手</ExpandableChatHeader>
        <ExpandableChatBody className="p-4 text-sm">有什么要处理的？</ExpandableChatBody>
        <ExpandableChatFooter>
          <input aria-label="消息" className="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="写一句" />
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  )
}

export function ChatMessageListDemo() {
  const [lines, setLines] = useState(["第一句已经在底部。", "第二句紧跟着。"])
  return (
    <div className="h-72 rounded-xl border">
      <ChatMessageList smooth>
        {lines.map((line) => (
          <p key={line} className="rounded-lg bg-muted px-3 py-2 text-sm">{line}</p>
        ))}
        <button className="self-start text-sm underline" onClick={() => setLines((current) => [...current, `补充 ${current.length + 1}`])} type="button">
          再加一句
        </button>
      </ChatMessageList>
    </div>
  )
}
export function ProgressiveCarouselDemo({
  defaultActive = "bridge",
  duration = 4000,
  fastDuration = 400,
}: { defaultActive?: string; duration?: number; fastDuration?: number } = {}) {
  return (
    <div className="px-6 py-8">
      <ProgressiveCarousel defaultActive={defaultActive} duration={duration} fastDuration={fastDuration} slides={slides} />
    </div>
  )
}

export function AgentIntroSequenceDemo() {
  const [done, setDone] = useState(false)
  return (
    <div className="px-6 py-8">
      <AgentIntroSequence onComplete={() => setDone(true)} sequence={sequence} />
      {done ? <p className="mt-3 text-sm text-muted-foreground">序列已结束</p> : null}
    </div>
  )
}
export function MessageLoadingDemo() {
  return (
    <div className="flex items-center gap-3 px-6 py-10">
      <MessageLoading />
      <span className="text-sm text-muted-foreground">正在输入</span>
    </div>
  )
}
