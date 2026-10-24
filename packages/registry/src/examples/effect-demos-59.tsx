"use client"

import { WaxSealButton } from "../effects/wax-seal-button"
import { DispatchTruckButton } from "../effects/dispatch-truck-button"
import { GooglyGazeButton } from "../effects/googly-gaze-button"
import { WeatherVaneToggle } from "../effects/weather-vane-toggle"
import { BookSpineShelf } from "../effects/book-spine-shelf"
import { CookLoading } from "../effects/cook-loading"
import { UsageQuotaMeter } from "../effects/usage-quota-meter"
import { SmartWidgetStack } from "../effects/smart-widget-stack"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

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




export function SmartWidgetStackDemo() {
  return (
    <div className={frame}>
      <SmartWidgetStack />
    </div>
  )
}


