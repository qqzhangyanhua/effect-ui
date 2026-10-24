"use client"

import { useState } from "react"

import { ArcCards } from "../effects/arc-cards"
import { BlurGlideMenu } from "../effects/blur-glide-menu"
import { CursorEdgeGlowButton } from "../effects/cursor-edge-glow-button"
import { HoverGlideCards } from "../effects/hover-glide-cards"
import { ProgressRingCheck, type ProgressRingCheckStatus } from "../effects/progress-ring-check"
import { RollingLettersAnimation } from "../effects/rolling-letters-animation"
import { SecurePurchaseButton } from "../effects/secure-purchase-button"
import { SpotlightIndicator } from "../effects/spotlight-indicator"
import { TiltImageCarousel } from "../effects/tilt-image-carousel"
import { WavyThreadsBackground } from "../effects/wavy-threads-background"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const arcItems = [
  { id: "dawn", title: "清晨", detail: "光还停在窗台。" },
  { id: "noon", title: "午后", detail: "笔记摊开一页。" },
  { id: "dusk", title: "黄昏", detail: "把今天收好。" },
]

const tiltItems = [{ title: "港湾" }, { title: "街角" }, { title: "室内" }, { title: "夜色" }]

const ringOrder: ProgressRingCheckStatus[] = ["pending", "running", "done", "failed", "cancelled"]

export function WavyThreadsBackgroundDemo({
  color = "var(--muted-foreground)",
  count = 10,
  speed = 1,
  intensity = 50,
}: {
  color?: string
  count?: number
  speed?: number
  intensity?: number
} = {}) {
  return (
    <div className="relative min-h-80 w-full overflow-hidden bg-background">
      <WavyThreadsBackground color={color} count={count} speed={speed} intensity={intensity} />
      <p className="relative z-[1] px-6 py-16 text-center text-sm text-foreground">细线在后面慢慢走。</p>
    </div>
  )
}

export function RollingLettersAnimationDemo({
  color = "var(--foreground)",
  duration = 1600,
  size = 32,
  gap = 2,
  count = 8,
  speed = 1,
}: {
  color?: string
  duration?: number
  size?: number
  gap?: number
  count?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <RollingLettersAnimation text="Hello" color={color} duration={duration} size={size} gap={gap} count={count} speed={speed} />
    </div>
  )
}

export function ArcCardsDemo({
  color = "var(--primary)",
  intensity = 48,
  angle = 18,
  speed = 1,
  size = 220,
}: {
  color?: string
  intensity?: number
  angle?: number
  speed?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <ArcCards items={arcItems} color={color} intensity={intensity} angle={angle} speed={speed} size={size} />
    </div>
  )
}

export function TiltImageCarouselDemo({
  color = "var(--primary)",
  size = 220,
  intensity = 48,
  angle = 42,
  speed = 1,
}: {
  color?: string
  size?: number
  intensity?: number
  angle?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <TiltImageCarousel items={tiltItems} color={color} size={size} intensity={intensity} angle={angle} speed={speed} />
    </div>
  )
}

export function HoverGlideCardsDemo({
  color = "var(--primary)",
  duration = 300,
  intensity = 10,
  speed = 1,
}: {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <HoverGlideCards color={color} duration={duration} intensity={intensity} speed={speed} />
    </div>
  )
}

export function ProgressRingCheckDemo({
  color = "var(--foreground)",
  size = 22,
  duration = 1100,
  speed = 1,
}: {
  color?: string
  size?: number
  duration?: number
  speed?: number
} = {}) {
  const [index, setIndex] = useState(1)
  const status = ringOrder[index] ?? "running"
  return (
    <div className={frame}>
      <button type="button" className="rounded-xl px-3 py-2 hover:bg-muted" onClick={() => setIndex((value) => (value + 1) % ringOrder.length)}>
        <ProgressRingCheck status={status} label="生成周报" color={color} size={size} duration={duration} speed={speed} />
      </button>
    </div>
  )
}

export function CursorEdgeGlowButtonDemo({
  color = "var(--primary)",
  intensity = 12,
  speed = 1,
  size = 40,
}: {
  color?: string
  intensity?: number
  speed?: number
  size?: number
} = {}) {
  return (
    <div className={frame}>
      <CursorEdgeGlowButton color={color} intensity={intensity} speed={speed} size={size} />
    </div>
  )
}

export function SecurePurchaseButtonDemo({
  color = "var(--primary)",
  duration = 1600,
  size = 48,
  speed = 1,
}: {
  color?: string
  duration?: number
  size?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <SecurePurchaseButton color={color} duration={duration} size={size} speed={speed} />
    </div>
  )
}

export function BlurGlideMenuDemo() {
  return (
    <div className={frame}>
      <BlurGlideMenu />
    </div>
  )
}

export function SpotlightIndicatorDemo() {
  return (
    <div className={frame}>
      <SpotlightIndicator />
    </div>
  )
}


