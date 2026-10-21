"use client"

import * as React from "react"

import { ClipRevealMenu } from "../effects/clip-reveal-menu"
import { ColumnConfigPanel } from "../effects/column-config-panel"
import { DualWaveTextList } from "../effects/dual-wave-text-list"
import { FacetedFilterBar } from "../effects/faceted-filter-bar"
import { GhostTrailText } from "../effects/ghost-trail-text"
import { GravityImageTrail } from "../effects/gravity-image-trail"
import { GroupedChecklist } from "../effects/grouped-checklist"
import { HeatmapCalendar } from "../effects/heatmap-calendar"
import { JsonViewer } from "../effects/json-viewer"
import { MacbookScroll } from "../effects/macbook-scroll"
import { ResourceSearchHero } from "../effects/resource-search-hero"
import { SquareLensDistortion } from "../effects/square-lens-distortion"
import { StickyGridScroll } from "../effects/sticky-grid-scroll"
import { SvgMaskScrollTransition } from "../effects/svg-mask-scroll-transition"
import { TextGenerate } from "../effects/text-generate"

const STREAM = ["把", "句子", "逐词", "从", "模糊", "里", "显出来"]

export function GhostTrailTextDemo({
  text = "GHOST",
  count,
  intensity,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  count?: number
  intensity?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <GhostTrailText
      className="w-full"
      text={text}
      count={count}
      intensity={intensity}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function GravityImageTrailDemo({
  size,
  gap,
  intensity,
  speed,
}: {
  size?: number
  gap?: number
  intensity?: number
  speed?: number
} = {}) {
  return <GravityImageTrail className="w-full" size={size} gap={gap} intensity={intensity} speed={speed} />
}

export function SquareLensDistortionDemo({
  speed,
  intensity,
  scale,
  color,
}: {
  speed?: number
  intensity?: number
  scale?: number
  color?: string
} = {}) {
  return <SquareLensDistortion className="w-full" speed={speed} intensity={intensity} scale={scale} color={color} />
}

export function DualWaveTextListDemo({ scale }: { scale?: number } = {}) {
  return <DualWaveTextList className="w-full" scale={scale} />
}

export function ClipRevealMenuDemo({ duration, delay, intensity }: { duration?: number; delay?: number; intensity?: number } = {}) {
  return <ClipRevealMenu className="w-full" duration={duration} delay={delay} intensity={intensity} />
}

export function StickyGridScrollDemo({
  intensity,
  speed,
}: {
  intensity?: number
  speed?: number
} = {}) {
  return <StickyGridScroll className="w-full" intensity={intensity} speed={speed} />
}

export function SvgMaskScrollTransitionDemo({
  intensity,
  speed,
  count,
}: {
  intensity?: number
  speed?: number
  count?: number
} = {}) {
  return <SvgMaskScrollTransition className="w-full" intensity={intensity} speed={speed} count={count} />
}

export function MacbookScrollDemo({
  intensity,
  scale,
  speed,
}: {
  intensity?: number
  scale?: number
  speed?: number
} = {}) {
  return <MacbookScroll className="w-full" intensity={intensity} scale={scale} speed={speed} />
}

export function FacetedFilterBarDemo() {
  return <FacetedFilterBar className="w-full" />
}

export function JsonViewerDemo() {
  return <JsonViewer className="w-full" />
}

export function HeatmapCalendarDemo() {
  return <HeatmapCalendar className="w-full" />
}

export function GroupedChecklistDemo() {
  return <GroupedChecklist className="w-full" />
}

export function TextGenerateDemo({
  duration,
  delay,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  duration?: number
  delay?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  const [count, setCount] = React.useState(1)

  React.useEffect(() => {
    if (count >= STREAM.length) return
    const id = window.setTimeout(() => setCount((current) => current + 1), 520)
    return () => window.clearTimeout(id)
  }, [count])

  return (
    <TextGenerate
      className="w-full"
      text={STREAM.slice(0, count).join(" ")}
      duration={duration}
      delay={delay}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function ColumnConfigPanelDemo() {
  return <ColumnConfigPanel className="w-full" />
}

export function ResourceSearchHeroDemo() {
  return <ResourceSearchHero className="w-full" />
}
