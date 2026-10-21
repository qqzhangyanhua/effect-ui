"use client"

import { CardSwap } from "../effects/card-swap"
import { ClickSpark } from "../effects/click-spark"
import { CurvedLoop } from "../effects/curved-loop"
import { DomeGallery } from "../effects/dome-gallery"
import { ElasticSlider } from "../effects/elastic-slider"
import { ElectricBorder } from "../effects/electric-border"
import { FlowingMenu } from "../effects/flowing-menu"
import { FuzzyText } from "../effects/fuzzy-text"
import { GlareHover } from "../effects/glare-hover"
import { Hyperspeed } from "../effects/hyperspeed"
import { LightRays } from "../effects/light-rays"
import { SplitFlapText } from "../effects/split-flap-text"
import { StickerPeel } from "../effects/sticker-peel"
import { TextPressure } from "../effects/text-pressure"
import { TrueFocus } from "../effects/true-focus"

export function TextPressureDemo() {
  return <TextPressure className="w-full" />
}

export function TrueFocusDemo() {
  return <TrueFocus className="w-full" />
}

export function SplitFlapTextDemo() {
  return <SplitFlapText className="w-full" />
}

export function CurvedLoopDemo() {
  return <CurvedLoop className="w-full" />
}

export function FuzzyTextDemo() {
  return <FuzzyText className="w-full" />
}

export function ElectricBorderDemo() {
  return <ElectricBorder className="w-full" />
}

export function StickerPeelDemo() {
  return <StickerPeel />
}

export function ClickSparkDemo() {
  return <ClickSpark className="w-full" />
}

export function GlareHoverDemo() {
  return <GlareHover className="w-full" />
}

export function CardSwapDemo() {
  return <CardSwap className="w-full" />
}

export function FlowingMenuDemo() {
  return <FlowingMenu className="w-full" />
}

export function DomeGalleryDemo() {
  return <DomeGallery className="w-full" />
}

export function ElasticSliderDemo() {
  return <ElasticSlider className="w-full" />
}

export function LightRaysDemo({
  followMouse = true,
  count = 14,
  speed = 1,
  colors = ["#ffc261", "#73adff"],
}: {
  followMouse?: boolean
  count?: number
  speed?: number
  colors?: string[]
} = {}) {
  return <LightRays className="w-full" followMouse={followMouse} count={count} speed={speed} colors={colors} />
}

export function HyperspeedDemo({
  speed = 1,
  count = 46,
  colors = ["#ff526b", "#6bc7ff"],
  intensity = 1,
}: {
  speed?: number
  count?: number
  colors?: string[]
  intensity?: number
} = {}) {
  return <Hyperspeed className="w-full" speed={speed} count={count} colors={colors} intensity={intensity} />
}
