"use client"

import { WaxSealButton } from "../effects/wax-seal-button"
import { DispatchTruckButton } from "../effects/dispatch-truck-button"
import { GooglyGazeButton } from "../effects/googly-gaze-button"
import { WeatherVaneToggle } from "../effects/weather-vane-toggle"
import { InkBleedText } from "../effects/ink-bleed-text"
import { CharmText } from "../effects/charm-text"
import { BookSpineShelf } from "../effects/book-spine-shelf"
import { CookLoading } from "../effects/cook-loading"
import { UsageQuotaMeter } from "../effects/usage-quota-meter"
import { InsetSettingsList } from "../effects/inset-settings-list"
import { CompassRail } from "../effects/compass-rail"
import { AvailabilityBadge } from "../effects/availability-badge"
import { SmartWidgetStack } from "../effects/smart-widget-stack"
import { GoalProgressCard } from "../effects/goal-progress-card"
import { MiniDesktopOS } from "../effects/mini-desktop-os"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const deskApps = [
  { id: "notes", title: "笔记", icon: <span>笔</span>, content: <p className="p-4 text-sm">今天把火漆和货车都发走。</p> },
  { id: "mail", title: "邮件", icon: <span>信</span>, content: <p className="p-4 text-sm">一封还没盖印的信。</p> },
]

export function WaxSealButtonDemo({
  color = "var(--destructive)",
  duration = 2800,
  intensity = 1.8,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <WaxSealButton color={color} duration={duration} intensity={intensity} speed={speed} label="封蜡寄出" busyLabel="正在封蜡…" sealedLabel="已封好" errorLabel="没寄出 · 重试" monogram="封" />
    </div>
  )
}

export function DispatchTruckButtonDemo({
  color = "var(--primary)",
  duration = 2600,
  speed = 1,
  intensity = 1,
}: {
  color?: string
  duration?: number
  speed?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <DispatchTruckButton color={color} duration={duration} speed={speed} intensity={intensity} label="下单发货" successLabel="已出发" errorLabel="再试一次" />
    </div>
  )
}

export function GooglyGazeButtonDemo({
  color = "var(--foreground)",
  size = 28,
  intensity = 1,
  duration = 420,
}: {
  color?: string
  size?: number
  intensity?: number
  duration?: number
} = {}) {
  return (
    <div className={frame}>
      <GooglyGazeButton color={color} size={size} intensity={intensity} duration={duration} label="联系我们" />
    </div>
  )
}

export function WeatherVaneToggleDemo({
  color = "var(--primary)",
  angle = 48,
  duration = 480,
  intensity = 1,
}: {
  color?: string
  angle?: number
  duration?: number
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <WeatherVaneToggle color={color} angle={angle} duration={duration} intensity={intensity} aria-label="风向" />
    </div>
  )
}

export function InkBleedTextDemo({
  color = "var(--primary)",
  duration = 1400,
  delay = 90,
  intensity = 1,
  trigger = "inView",
}: {
  color?: string
  duration?: number
  delay?: number
  intensity?: number
  trigger?: "mount" | "inView"
} = {}) {
  return (
    <div className={frame}>
      <InkBleedText color={color} duration={duration} delay={delay} intensity={intensity} trigger={trigger} text="好主意先慢慢洇开，然后一下子铺满。" highlight="慢慢洇开" />
    </div>
  )
}

export function CharmTextDemo({
  color = "var(--primary)",
  duration = 350,
  intensity = 1,
  fontSize = 32,
}: {
  color?: string
  duration?: number
  intensity?: number
  fontSize?: number
} = {}) {
  return (
    <div className={frame}>
      <CharmText
        color={color}
        duration={duration}
        intensity={intensity}
        fontSize={fontSize}
        segments={["界面会在你碰到时 ", { text: "发光", glyph: "spark", hint: "微交互" }, "，安静得像 ", { text: "水", glyph: "drop", hint: "平缓的动效" }, "。"]}
      />
    </div>
  )
}

export function BookSpineShelfDemo({
  color = "var(--primary)",
  duration = 700,
  intensity = 1,
  size = 190,
  count = 7,
}: {
  color?: string
  duration?: number
  intensity?: number
  size?: number
  count?: number
} = {}) {
  return (
    <div className="w-full px-4 py-8">
      <BookSpineShelf color={color} duration={duration} intensity={intensity} size={size} count={count} title="我的书架" />
    </div>
  )
}

export function CookLoadingDemo({
  size = 280,
  speed = 1,
  color = "var(--primary)",
  intensity = 1,
}: {
  size?: number
  speed?: number
  color?: string
  intensity?: number
} = {}) {
  return (
    <div className={frame}>
      <CookLoading size={size} speed={speed} color={color} intensity={intensity} progress={42} label="正在备菜…" description="进度由外面的任务决定。" />
    </div>
  )
}

export function UsageQuotaMeterDemo() {
  return (
    <div className={frame}>
      <UsageQuotaMeter title="用量" period="10 月 1 日 – 10 月 31 日" />
    </div>
  )
}

export function InsetSettingsListDemo() {
  return (
    <div className="flex w-full justify-center px-4 py-8">
      <InsetSettingsList title="设置" />
    </div>
  )
}

export function CompassRailDemo() {
  return (
    <div className={frame}>
      <CompassRail
        items={[
          { id: "north", label: "北 · 概览" },
          { id: "east", label: "东 · 作品" },
          { id: "south", label: "南 · 笔记" },
          { id: "west", label: "西 · 联系" },
        ]}
      />
    </div>
  )
}

export function AvailabilityBadgeDemo() {
  return (
    <div className={frame}>
      <AvailabilityBadge
        labels={{
          open: { title: "可以接活", detail: "十一月起可以排期" },
          limited: { title: "档期紧张", detail: "这个季度还剩一个名额" },
          booked: { title: "已经约满", detail: "一月可以排队" },
        }}
      />
    </div>
  )
}

export function SmartWidgetStackDemo() {
  return (
    <div className={frame}>
      <SmartWidgetStack />
    </div>
  )
}

export function GoalProgressCardDemo() {
  return (
    <div className={frame}>
      <GoalProgressCard title="京都之旅" />
    </div>
  )
}

export function MiniDesktopOSDemo() {
  return (
    <div className="w-full px-4 py-8">
      <MiniDesktopOS apps={deskApps} defaultOpen={["notes"]} brand="案头" />
    </div>
  )
}
