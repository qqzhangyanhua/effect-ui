"use client"

import { useState } from "react"
import { AgentFlow } from "../effects/agent-flow"
import { AgentStep, AgentTimeline } from "../effects/agent-timeline"
import { BlueprintGrid } from "../effects/blueprint-grid"
import { CommentPin } from "../effects/comment-pin"
import { InertiaGallery } from "../effects/inertia-gallery"
import { LiquidMetaballs } from "../effects/liquid-metaballs"
import { MagicInput } from "../effects/magic-input"
import { MagicTab } from "../effects/magic-tab"
import { PresenceFacepile } from "../effects/presence-facepile"
import { ProgressFoldButton } from "../effects/progress-fold-button"
import { ProgressiveCardReveal } from "../effects/progressive-card-reveal"
import { SpinViewer } from "../effects/spin-viewer"
import { StackBadge } from "../effects/stack-badge"
import { StoreBadge, StoreBadgeGroup } from "../effects/store-badge"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"
const stage = "relative h-80 w-full overflow-hidden rounded-2xl border border-border bg-card"

function spinFrame(angle: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="none"/><g transform="rotate(${angle} 100 100)"><rect x="78" y="36" width="44" height="128" rx="10" fill="currentColor"/></g><circle cx="100" cy="36" r="8" fill="currentColor" opacity="0.45"/></svg>`
}

const spinFrames = [0, 45, 90, 135, 180, 225, 270, 315].map(spinFrame)

const flowNodes = [
  { id: "brief", label: "读简报", sublabel: "准备", x: 40, y: 120 },
  { id: "draft", label: "写草稿", sublabel: "进行中", x: 280, y: 40 },
  { id: "review", label: "核对", sublabel: "等待", x: 280, y: 200 },
]

const flowEdges = [
  { id: "a", from: "brief", to: "draft" },
  { id: "b", from: "brief", to: "review" },
]

const tabs = [
  { value: "draw", label: "绘图" },
  { value: "notes", label: "笔记" },
  { value: "share", label: "分享" },
]

const people = [
  { id: "lin", name: "林夏", status: "active" as const },
  { id: "zhou", name: "周宁", status: "typing" as const },
  { id: "chen", name: "陈舟", status: "idle" as const },
  { id: "wu", name: "吴青", status: "offline" as const },
]

export function ProgressFoldButtonDemo({
  color = "var(--primary)",
  duration = 1200,
  intensity = 35,
  speed = 1,
  size = 48,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
} = {}) {
  const [status, setStatus] = useState<"idle" | "loading">("loading")
  return (
    <div className={frame}>
      <ProgressFoldButton
        color={color}
        duration={duration}
        intensity={intensity}
        speed={speed}
        size={size}
        status={status}
        onClick={() => setStatus((value) => (value === "loading" ? "idle" : "loading"))}
      >
        {status === "loading" ? "折叠中" : "开始折叠"}
      </ProgressFoldButton>
    </div>
  )
}

export function MagicTabDemo({
  color = "var(--primary)",
  duration = 600,
  intensity = 4,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  const [value, setValue] = useState("draw")
  return (
    <div className={frame}>
      <MagicTab items={tabs} value={value} onValueChange={setValue} color={color} duration={duration} intensity={intensity} speed={speed} />
    </div>
  )
}

export function MagicInputDemo({
  color = "var(--primary)",
  duration = 600,
  intensity = 4,
  speed = 1,
  size = 48,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
} = {}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  return (
    <div className={frame}>
      <div className="w-full max-w-sm">
        <MagicInput
          color={color}
          duration={duration}
          intensity={intensity}
          speed={speed}
          size={size}
          depth="always"
          aria-label="魔法输入"
          placeholder="写下一句"
          submitLabel="提交"
          status={status}
          onSubmit={() => {
            setStatus("loading")
            window.setTimeout(() => setStatus("success"), 700)
          }}
        />
      </div>
    </div>
  )
}

export function BlueprintGridDemo({
  color = "var(--border)",
  duration = 8000,
  intensity = 1,
  size = 32,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  return (
    <div className={stage}>
      <BlueprintGrid color={color} duration={duration} intensity={intensity} size={size} />
      <div className="relative z-10 grid h-full place-items-center text-sm text-muted-foreground">按下格子会亮</div>
    </div>
  )
}

export function LiquidMetaballsDemo({
  colors = ["var(--primary)", "var(--chart-2)", "var(--chart-4)", "var(--chart-3)"],
  speed = 1,
  intensity = 16,
  count = 7,
  interactive = true,
}: {
  colors?: string[]
  speed?: number
  intensity?: number
  count?: number
  interactive?: boolean
} = {}) {
  return (
    <div className={stage}>
      <LiquidMetaballs colors={colors} speed={speed} intensity={intensity} count={count} interactive={interactive} />
    </div>
  )
}

export function SpinViewerDemo({
  color = "var(--primary)",
  speed = 12,
  intensity = 6,
  loop = true,
}: {
  color?: string
  speed?: number
  intensity?: number
  loop?: boolean
} = {}) {
  return (
    <div className={frame}>
      <SpinViewer frames={spinFrames} color={color} speed={speed} intensity={intensity} loop={loop} className="h-72 w-56" label="拖动这个标记旋转" />
    </div>
  )
}

export function ProgressiveCardRevealDemo({
  color = "var(--border)",
  duration = 480,
  intensity = 7,
  size = 90,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
} = {}) {
  const [active, setActive] = useState(0)
  const cards = [
    ["草图", "先把轮廓画完，再决定颜色。"],
    ["注释", "把不确定的地方标在边上。"],
    ["交付", "导出前再对一次尺寸。"],
  ]
  return (
    <div className={frame}>
      <ProgressiveCardReveal activeIndex={active} onActiveChange={setActive} color={color} duration={duration} intensity={intensity} size={size} className="w-full max-w-md">
        {cards.map(([title, body]) => (
          <ProgressiveCardReveal.Card key={title}>
            <ProgressiveCardReveal.CardCollapsed>{title}</ProgressiveCardReveal.CardCollapsed>
            <ProgressiveCardReveal.CardExpanded>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </ProgressiveCardReveal.CardExpanded>
          </ProgressiveCardReveal.Card>
        ))}
      </ProgressiveCardReveal>
    </div>
  )
}

export function InertiaGalleryDemo({
  size = 200,
  gap = 24,
  intensity = 1,
  speed = 1,
  color = "var(--primary)",
}: {
  size?: number
  gap?: number
  intensity?: number
  speed?: number
  color?: string
} = {}) {
  const slides = ["晨", "午", "暮", "夜"]
  return (
    <div className="w-full px-4 py-8">
      <InertiaGallery size={size} gap={gap} intensity={intensity} speed={speed} color={color}>
        {slides.map((label) => (
          <div key={label} className="grid size-full place-items-center bg-muted text-2xl text-foreground">
            {label}
          </div>
        ))}
      </InertiaGallery>
    </div>
  )
}

export function AgentTimelineDemo() {
  return (
    <div className="mx-auto w-full max-w-md px-6 py-8">
      <AgentTimeline>
        <AgentStep status="success" title="读取仓库" meta="1.2s">
          找到十四个待移植的文件。
        </AgentStep>
        <AgentStep status="running" title="核对许可证" meta="进行中">
          MIT，版权 2026 Lucas Bassetti。
        </AgentStep>
        <AgentStep status="pending" title="写回归" last />
      </AgentTimeline>
    </div>
  )
}

export function AgentFlowDemo() {
  return (
    <div className="h-96 w-full p-4">
      <AgentFlow nodes={flowNodes} edges={flowEdges} autoPlay continuous className="h-full" aria-label="代理流程" />
    </div>
  )
}

export function CommentPinDemo() {
  return (
    <div className="relative mx-auto h-80 w-full max-w-lg">
      <div className="absolute inset-6 rounded-2xl border border-border bg-muted" />
      <CommentPin
        x={28}
        y={36}
        comments={[{ id: "1", author: "林夏", body: "这里的折角再收一点。", time: "09:24" }]}
        onReply={() => undefined}
      />
    </div>
  )
}

export function PresenceFacepileDemo() {
  return (
    <div className={frame}>
      <PresenceFacepile users={people} max={3} />
    </div>
  )
}

export function StackBadgeDemo() {
  return (
    <div className={frame}>
      <StackBadge items={["react", "typescript", "tailwind", "vue"]} />
    </div>
  )
}

export function StoreBadgeDemo() {
  return (
    <div className={frame}>
      <StoreBadgeGroup>
        <StoreBadge store="app-store" href="#app-store" />
        <StoreBadge store="google-play" href="#play" theme="light" />
      </StoreBadgeGroup>
    </div>
  )
}
