"use client"

import { CssAccordionAuto } from "../ui/css-accordion-auto"
import { AnchorPopover } from "../ui/anchor-popover"
import { DitherGradient } from "../effects/dither-gradient"
import { HoverImageList } from "../ui/hover-image-list"
import { InfiniteCanvasGallery } from "../effects/infinite-canvas-gallery"
import { IntroPreloader } from "../effects/intro-preloader"
import { Keycap3D } from "../ui/keycap-3d"
import { LiquidGlassTabbar } from "../ui/liquid-glass-tabbar"
import { ScrollTimelineReveal } from "../effects/scroll-timeline-reveal"
import { Hero3DModel } from "../sections/hero-3d-model"
import { HeroScrollZoom } from "../sections/hero-scroll-zoom"
import { SectionHorizontalScroll } from "../sections/section-horizontal-scroll"
import { SmoothScrollProvider } from "../ui/smooth-scroll-provider"
import { TextVariableScroll } from "../effects/text-variable-scroll"
import { ViewTransitionGallery } from "../ui/view-transition-gallery"

export function ViewTransitionGalleryDemo() {
  return <ViewTransitionGallery className="w-full" />
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

export function SmoothScrollProviderDemo() {
  return <SmoothScrollProvider className="w-full" />
}

export function HeroScrollZoomDemo() {
  return <HeroScrollZoom className="w-full" />
}

export function SectionHorizontalScrollDemo() {
  return <SectionHorizontalScroll className="w-full" />
}

export function IntroPreloaderDemo() {
  return <IntroPreloader className="w-full" />
}

export function Hero3DModelDemo() {
  return <Hero3DModel className="w-full" />
}

export function Keycap3DDemo() {
  return <Keycap3D className="w-full" />
}

export function InfiniteCanvasGalleryDemo() {
  return <InfiniteCanvasGallery className="w-full" />
}

export function HoverImageListDemo() {
  return <HoverImageList className="w-full" />
}

export function TextVariableScrollDemo({
  text = "Weight moves through the letters",
  intensity,
  fontSize,
  letterSpacing,
  align,
}: {
  text?: string
  intensity?: number
  fontSize?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TextVariableScroll
      className="w-full"
      text={text}
      intensity={intensity}
      fontSize={fontSize}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function LiquidGlassTabbarDemo() {
  return <LiquidGlassTabbar className="w-full" />
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

export function CssAccordionAutoDemo() {
  return <CssAccordionAuto className="w-full" />
}
