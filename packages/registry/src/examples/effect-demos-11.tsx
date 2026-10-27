"use client"

import { AnchorPopover } from "../ui/anchor-popover"
import { DitherGradient } from "../effects/dither-gradient"

import { InfiniteCanvasGallery } from "../effects/infinite-canvas-gallery"
import { IntroPreloader } from "../effects/intro-preloader"
import { Keycap3D } from "../ui/keycap-3d"
import { LiquidGlassTabbar } from "../ui/liquid-glass-tabbar"
import { ScrollTimelineReveal } from "../effects/scroll-timeline-reveal"
import { HeroScrollZoom } from "../sections/hero-scroll-zoom"
import { SectionHorizontalScroll } from "../sections/section-horizontal-scroll"
import { ViewTransitionGallery } from "../ui/view-transition-gallery"

export function ViewTransitionGalleryDemo({ gap, size }: { gap?: number; size?: number } = {}) {
  return <ViewTransitionGallery className="w-full" gap={gap} size={size} />
}

export function ScrollTimelineRevealDemo({
  mode = "reveal",
  speed,
  intensity,
}: {
  mode?: "reveal" | "parallax"
  speed?: number
  intensity?: number
} = {}) {
  return <ScrollTimelineReveal className="w-full" mode={mode} speed={speed} intensity={intensity} />
}

export function HeroScrollZoomDemo() {
  return <HeroScrollZoom className="w-full" />
}

export function SectionHorizontalScrollDemo() {
  return <SectionHorizontalScroll className="w-full" />
}

export function IntroPreloaderDemo({
  interval,
  duration,
  delay,
  count,
  color,
}: {
  interval?: number
  duration?: number
  delay?: number
  count?: number
  color?: string
} = {}) {
  return <IntroPreloader className="w-full" interval={interval} duration={duration} delay={delay} count={count} color={color} />
}

export function Keycap3DDemo({ duration, angle, intensity, gap }: { duration?: number; angle?: number; intensity?: number; gap?: number } = {}) {
  return <Keycap3D className="w-full" duration={duration} angle={angle} intensity={intensity} gap={gap} />
}

export function InfiniteCanvasGalleryDemo({ gap, size }: { gap?: number; size?: number } = {}) {
  return <InfiniteCanvasGallery className="w-full" gap={gap} size={size} />
}
export function LiquidGlassTabbarDemo({ speed, intensity, scale }: { speed?: number; intensity?: number; scale?: number } = {}) {
  return <LiquidGlassTabbar className="w-full" speed={speed} intensity={intensity} scale={scale} />
}

export function DitherGradientDemo({
  colors = ["#1a0d47", "#f57338", "#33bfd1"],
  speed = 1,
  count = 5,
  intensity = 1,
}: {
  colors?: string[]
  speed?: number
  count?: number
  intensity?: number
} = {}) {
  return (
    <DitherGradient className="w-full" colors={colors} speed={speed} count={count} intensity={intensity} />
  )
}

export function AnchorPopoverDemo() {
  return <AnchorPopover className="w-full" />
}
