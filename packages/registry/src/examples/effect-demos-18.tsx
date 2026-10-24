"use client"

import { useState } from "react"

import { CurvedScrollbar } from "../effects/curved-scrollbar"
import { FireworksShow } from "../effects/fireworks-show"
import { ImageTubeScroll } from "../effects/image-tube-scroll"
import { InvoicePreview } from "../effects/invoice-preview"

import { MentionTextarea } from "../effects/mention-textarea"
import { ParticleHourglass } from "../effects/particle-hourglass"
import { ShortcutsDialog } from "../effects/shortcuts-dialog"
import { TimezoneClock } from "../effects/timezone-clock"
import { WobbleLineCursor } from "../effects/wobble-line-cursor"
import { DepthFogGallery } from "../sections/depth-fog-gallery"
import { PlanCompareTable } from "../sections/plan-compare-table"
import { PricingCalculator } from "../sections/pricing-calculator"
import { TelescopeZoomScroll } from "../sections/telescope-zoom-scroll"

export function ImageTubeScrollDemo({
  radius = 1.35,
  speed,
  intensity,
}: {
  radius?: number
  speed?: number
  intensity?: number
} = {}) {
  return <ImageTubeScroll className="w-full" radius={radius} speed={speed} intensity={intensity} />
}

export function DepthFogGalleryDemo() {
  return <DepthFogGallery className="w-full" />
}

export function FireworksShowDemo({ colors, auto, intensity }: { colors?: string[]; auto?: boolean; intensity?: number } = {}) {
  return <FireworksShow className="w-full" colors={colors} auto={auto} intensity={intensity} />
}

export function WobbleLineCursorDemo({
  lines = 5,
  speed,
  intensity,
  color,
}: {
  lines?: number
  speed?: number
  intensity?: number
  color?: string
} = {}) {
  return <WobbleLineCursor className="w-full" lines={lines} speed={speed} intensity={intensity} color={color} />
}
export function TelescopeZoomScrollDemo() {
  return <TelescopeZoomScroll className="w-full" />
}

export function CurvedScrollbarDemo({ radius = 28 }: { radius?: number } = {}) {
  return (
    <CurvedScrollbar className="h-64 w-full" radius={radius}>
      <div className="space-y-3 p-4 pr-8 text-sm">
        {Array.from({ length: 12 }, (_, index) => (
          <p key={index}>第 {index + 1} 段。轨道沿着圆角走，滑块跟着这段内容移动。</p>
        ))}
      </div>
    </CurvedScrollbar>
  )
}

export function ParticleHourglassDemo({
  count,
  colors,
  speed,
  size,
  gap,
}: {
  count?: number
  colors?: string[]
  speed?: number
  size?: number
  gap?: number
} = {}) {
  const [progress, setProgress] = useState(0.35)
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 text-sm">
        进度
        <input aria-label="沙漏进度" type="range" min={0} max={1} step={0.01} value={progress} onChange={(event) => setProgress(Number(event.target.value))} />
      </label>
      <ParticleHourglass progress={progress} count={count} colors={colors} speed={speed} size={size} gap={gap} />
    </div>
  )
}

export function InvoicePreviewDemo() {
  return <InvoicePreview />
}

export function ShortcutsDialogDemo() {
  return <ShortcutsDialog />
}

export function PricingCalculatorDemo() {
  return <PricingCalculator className="w-full" />
}

export function PlanCompareTableDemo() {
  return <PlanCompareTable className="w-full" />
}

export function MentionTextareaDemo() {
  return <MentionTextarea className="w-full" />
}

export function TimezoneClockDemo() {
  return <TimezoneClock className="w-full" />
}
