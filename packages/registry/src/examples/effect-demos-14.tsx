"use client"

import { AvatarGroupTooltip } from "../effects/avatar-group-tooltip"
import { BeamsCollision } from "../effects/beams-collision"
import { CookieConsent } from "../effects/cookie-consent"
import { CountdownTimer } from "../effects/countdown-timer"
import { DiffViewer } from "../effects/diff-viewer"
import { ImageCropper } from "../effects/image-cropper"
import { KpiSparklineCard } from "../effects/kpi-sparkline-card"
import { LensZoom } from "../effects/lens-zoom"
import { LinkPreview } from "../effects/link-preview"
import { PlaceholderVanishInput } from "../effects/placeholder-vanish-input"
import { ShuffleGridHero } from "../effects/shuffle-grid-hero"
import { SortableList } from "../effects/sortable-list"
import { TocScrollspy } from "../effects/toc-scrollspy"
import { VortexBackground } from "../effects/vortex-background"
import { WorldMapArcs } from "../effects/world-map-arcs"

export function LensZoomDemo({
  zoom = 2.3,
  lensSize = 148,
  intensity,
  color,
}: {
  zoom?: number
  lensSize?: number
  intensity?: number
  color?: string
} = {}) {
  return <LensZoom className="w-full" zoom={zoom} lensSize={lensSize} intensity={intensity} color={color} />
}

export function WorldMapArcsDemo({
  colors = ["#67e8f9", "#bae6fd"],
  speed = 1,
  size = 0.7,
}: {
  colors?: string[]
  speed?: number
  size?: number
} = {}) {
  return <WorldMapArcs className="w-full" colors={colors} speed={speed} size={size} />
}

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

export function ShuffleGridHeroDemo() {
  return <ShuffleGridHero className="w-full" />
}

export function TocScrollspyDemo({ duration, gap }: { duration?: number; gap?: number } = {}) {
  return <TocScrollspy className="w-full" duration={duration} gap={gap} />
}

export function SortableListDemo({ gap }: { gap?: number } = {}) {
  return <SortableList className="w-full" gap={gap} />
}

export function KpiSparklineCardDemo({ color, size }: { color?: string; size?: number } = {}) {
  return <KpiSparklineCard className="w-full" color={color} size={size} />
}

export function CookieConsentDemo() {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl border bg-muted/40">
      <CookieConsent className="absolute right-4 bottom-4" />
    </div>
  )
}

export function CountdownTimerDemo({
  gap,
  speed,
  duration,
  fontSize,
}: {
  gap?: number
  speed?: number
  duration?: number
  fontSize?: number
} = {}) {
  return (
    <CountdownTimer
      className="w-full"
      durationSeconds={36}
      confetti
      gap={gap}
      speed={speed}
      duration={duration}
      fontSize={fontSize}
    />
  )
}

export function ImageCropperDemo() {
  return <ImageCropper className="w-full" />
}

export function DiffViewerDemo() {
  return <DiffViewer className="w-full" />
}
