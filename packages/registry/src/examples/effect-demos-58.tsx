"use client"

import { useState } from "react"

import { ApiRequestInspector } from "../effects/api-request-inspector"
import { CopperplateHatch } from "../effects/copperplate-hatch"
import { CoreStrata } from "../effects/core-strata"
import { EnvironmentSwitcher } from "../effects/environment-switcher"
import { EventPropagationMatrix } from "../effects/event-propagation-matrix"
import { FilmstripScrub } from "../effects/filmstrip-scrub"
import { KineticEmphasis } from "../effects/kinetic-emphasis"
import { LiquidFillHeadline } from "../effects/liquid-fill-headline"
import { LiveLogStream } from "../effects/live-log-stream"
import { QueuePulseLanes } from "../effects/queue-pulse-lanes"
import { VelocitySkewFeed } from "../effects/velocity-skew-feed"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

export function QueuePulseLanesDemo({
  color = "var(--primary)",
  duration = 5200,
  intensity = 1,
  speed = 1,
  count = 4,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  count?: number
} = {}) {
  return (
    <div className={frame}>
      <QueuePulseLanes color={color} duration={duration} intensity={intensity} speed={speed} count={count} className="w-full" />
    </div>
  )
}

export function EventPropagationMatrixDemo({
  color = "var(--primary)",
  duration = 1800,
  intensity = 1,
  count = 10,
}: {
  color?: string
  duration?: number
  intensity?: number
  count?: number
} = {}) {
  return (
    <div className={frame}>
      <EventPropagationMatrix color={color} duration={duration} intensity={intensity} count={count} className="w-full" />
    </div>
  )
}

export function CopperplateHatchDemo({
  color = "var(--primary)",
  duration = 8000,
  intensity = 1,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <CopperplateHatch color={color} duration={duration} intensity={intensity} speed={speed} className="w-full">
        <div className="flex min-h-72 items-end p-6 text-sm text-muted-foreground">按住画面移动光源</div>
      </CopperplateHatch>
    </div>
  )
}

export function CoreStrataDemo({
  color = "var(--primary)",
  duration = 9000,
  intensity = 1,
  count = 3,
}: {
  color?: string
  duration?: number
  intensity?: number
  count?: number
} = {}) {
  return (
    <div className={frame}>
      <CoreStrata color={color} duration={duration} intensity={intensity} count={count} className="w-full">
        <div className="flex min-h-72 items-end p-6 text-sm text-muted-foreground">岩芯扫描</div>
      </CoreStrata>
    </div>
  )
}

export function KineticEmphasisDemo({
  color = "var(--primary)",
  duration = 500,
  intensity = 0.6,
  fontSize = 32,
  trigger = "inView",
}: {
  color?: string
  duration?: number
  intensity?: number
  fontSize?: number
  trigger?: "mount" | "inView"
} = {}) {
  return (
    <div className={frame}>
      <KineticEmphasis color={color} duration={duration} intensity={intensity} fontSize={fontSize} trigger={trigger}>
        队列在<em>拥塞时放慢</em>，空闲时再加速。
      </KineticEmphasis>
    </div>
  )
}

export function LiquidFillHeadlineDemo({
  color = "var(--primary)",
  duration = 3000,
  intensity = 4.5,
  fontSize = 56,
  loop = true,
}: {
  color?: string
  duration?: number
  intensity?: number
  fontSize?: number
  loop?: boolean
} = {}) {
  return (
    <div className={frame}>
      <LiquidFillHeadline text="液面升起" color={color} duration={duration} intensity={intensity} fontSize={fontSize} loop={loop} />
    </div>
  )
}

export function VelocitySkewFeedDemo({
  color = "var(--primary)",
  duration = 1000,
  intensity = 6.5,
  speed = 1,
  size = 420,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
} = {}) {
  const cards = ["入库", "压缩", "分发", "回执", "归档", "对账"].map((name) => (
    <div key={name}>
      <div className="text-sm font-medium">{name}</div>
      <div className="text-xs text-muted-foreground">快速滚动，卡片会跟着倾斜</div>
    </div>
  ))
  return (
    <div className="w-full px-6 py-10">
      <VelocitySkewFeed items={cards} color={color} duration={duration} intensity={intensity} speed={speed} size={size} label="活动流。快速滚动查看卡片反应。" />
    </div>
  )
}

const frames = [
  { id: "dawn", label: "黎明", tone: "var(--chart-4)" },
  { id: "noon", label: "正午", tone: "var(--chart-2)" },
  { id: "dusk", label: "黄昏", tone: "var(--chart-1)" },
  { id: "night", label: "夜色", tone: "var(--chart-5)" },
].map((frameItem) => ({
  id: frameItem.id,
  label: frameItem.label,
  node: (
    <div className="grid h-full w-full place-items-center text-2xl text-primary-foreground" style={{ background: frameItem.tone }}>
      {frameItem.label}
    </div>
  ),
}))

export function FilmstripScrubDemo({
  color = "var(--primary)",
  duration = 1000,
  speed = 0.9,
  loop = true,
}: {
  color?: string
  duration?: number
  speed?: number
  loop?: boolean
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <FilmstripScrub frames={frames} color={color} duration={duration} speed={speed} loop={loop} />
    </div>
  )
}

export function LiveLogStreamDemo() {
  return (
    <div className="w-full px-6 py-10">
      <LiveLogStream
        title="实时日志"
        label="日志"
        status="streaming"
        entries={[
          { id: "1", level: "info", source: "web", message: "已接收 webhook" },
          { id: "2", level: "warning", source: "queue", message: "image-resize 排队 23" },
          { id: "3", level: "error", source: "mail", message: "digest 被阻塞" },
          { id: "4", level: "success", source: "cdn", message: "缩略图已完成" },
        ]}
      />
    </div>
  )
}

export function EnvironmentSwitcherDemo() {
  const [current, setCurrent] = useState("dev")
  return (
    <div className={frame}>
      <EnvironmentSwitcher
        label="环境"
        value={current}
        onValueChange={(id) => setCurrent(id)}
        requireProductionConfirmation
        environments={[
          { id: "dev", name: "开发", type: "development", status: "active", region: "local" },
          { id: "preview", name: "预览", type: "preview", status: "available", region: "fra" },
          { id: "prod", name: "生产", type: "production", status: "available", region: "iad", warning: "会碰到真实流量" },
          { id: "lock", name: "锁定", type: "staging", status: "locked" },
        ]}
      />
    </div>
  )
}

export function ApiRequestInspectorDemo() {
  return (
    <div className="w-full px-6 py-10">
      <ApiRequestInspector
        title="请求检查"
        state="success"
        request={{
          method: "POST",
          url: "https://api.example.test/orders",
          headers: { Authorization: "secret-token", Accept: "application/json" },
          query: { limit: 20 },
          body: { sku: "tote", token: "hidden" },
        }}
        response={{ status: 201, statusText: "Created", durationMs: 86, body: { id: "ord_19", ok: true } }}
      />
    </div>
  )
}

