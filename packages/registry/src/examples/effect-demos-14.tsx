"use client"

import { AvatarGroupTooltip } from "../effects/avatar-group-tooltip"
import { BeamsCollision } from "../effects/beams-collision"
import { CookieConsent } from "../effects/cookie-consent"
import { CountdownTimer } from "../effects/countdown-timer"
import { DiffViewer } from "../effects/diff-viewer"
import { KpiSparklineCard } from "../effects/kpi-sparkline-card"
import { LinkPreview } from "../effects/link-preview"
import { PlaceholderVanishInput } from "../effects/placeholder-vanish-input"
import { ShuffleGridHero } from "../effects/shuffle-grid-hero"
import { SortableList } from "../effects/sortable-list"
import { VortexBackground } from "../effects/vortex-background"

export function VortexBackgroundDemo({
  count = 96,
  speed = 1,
  color,
  intensity = 0.32,
}: {
  count?: number
  speed?: number
  color?: string
  intensity?: number
} = {}) {
  return <VortexBackground className="w-full" count={count} speed={speed} color={color} intensity={intensity} />
}

export function BeamsCollisionDemo({
  count = 6,
  speed = 1,
  color = "#cffafe",
  intensity = 1,
}: {
  count?: number
  speed?: number
  color?: string
  intensity?: number
} = {}) {
  return <BeamsCollision className="w-full" count={count} speed={speed} color={color} intensity={intensity} />
}

export function PlaceholderVanishInputDemo() {
  return <PlaceholderVanishInput className="w-full" />
}

export function LinkPreviewDemo({ intensity, scale, speed, size }: { intensity?: number; scale?: number; speed?: number; size?: number } = {}) {
  return (
    <div className="flex min-h-56 w-full items-start justify-center">
      <LinkPreview
        href="#link-preview"
        title="效果预览"
        description="悬停或聚焦时弹出卡片，图片是内置色块。"
        intensity={intensity}
        scale={scale}
        speed={speed}
        size={size}
      >
        查看组件
      </LinkPreview>
    </div>
  )
}

export function AvatarGroupTooltipDemo({ max, scale, intensity, size, speed }: { max?: number; scale?: number; intensity?: number; size?: number; speed?: number } = {}) {
  return <AvatarGroupTooltip className="w-full justify-center py-8" max={max} scale={scale} intensity={intensity} size={size} speed={speed} />
}

export function ShuffleGridHeroDemo({ interval = 1800 }: { interval?: number } = {}) {
  return <ShuffleGridHero className="w-full" interval={interval} />
}

export function SortableListDemo({ gap }: { gap?: number } = {}) {
  return <SortableList className="w-full" gap={gap} />
}

export function KpiSparklineCardDemo({
  label = "本周访问",
  value = 12840,
  delta = 12.4,
  color,
  size,
}: {
  label?: string
  value?: number
  delta?: number
  color?: string
  size?: number
} = {}) {
  return <KpiSparklineCard className="w-full" label={label} value={value} delta={delta} color={color} size={size} />
}

export function CookieConsentDemo() {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl border bg-muted/40">
      <CookieConsent className="absolute right-4 bottom-4" />
    </div>
  )
}

export function CountdownTimerDemo({
  durationSeconds = 36,
  confetti = false,
  gap,
  speed,
  duration,
  fontSize,
}: {
  durationSeconds?: number
  confetti?: boolean
  gap?: number
  speed?: number
  duration?: number
  fontSize?: number
} = {}) {
  return (
    <CountdownTimer
      className="w-full"
      durationSeconds={durationSeconds}
      confetti={confetti}
      gap={gap}
      speed={speed}
      duration={duration}
      fontSize={fontSize}
    />
  )
}

export function DiffViewerDemo() {
  return <DiffViewer className="w-full" />
}
