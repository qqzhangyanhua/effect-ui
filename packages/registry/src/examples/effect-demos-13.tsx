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

export function TextPressureDemo({
  text = "PRESSURE",
  radius = 160,
  fontSize,
  letterSpacing,
  align,
}: {
  text?: string
  radius?: number
  fontSize?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TextPressure
      className="w-full"
      text={text}
      radius={radius}
      fontSize={fontSize}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function TrueFocusDemo({
  sentence = "把注意力交给正在发光的词",
  interval = 1400,
  color,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  sentence?: string
  interval?: number
  color?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TrueFocus
      className="w-full"
      sentence={sentence}
      interval={interval}
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function SplitFlapTextDemo({
  target = "GATE 12",
  speed,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  target?: string
  speed?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <SplitFlapText
      className="w-full"
      target={target}
      speed={speed}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function CurvedLoopDemo({
  text = "CURVED LOOP · ",
  speed,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  speed?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <CurvedLoop
      className="w-full"
      text={text}
      speed={speed}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function FuzzyTextDemo({
  text = "SIGNAL",
  intensity,
  color,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  intensity?: number
  color?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <FuzzyText
      className="w-full"
      text={text}
      intensity={intensity}
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function ElectricBorderDemo() {
  return <ElectricBorder className="w-full" />
}

export function StickerPeelDemo({ intensity, speed, size }: { intensity?: number; speed?: number; size?: number } = {}) {
  return <StickerPeel intensity={intensity} speed={speed} size={size} />
}

export function ClickSparkDemo() {
  return <ClickSpark className="w-full" />
}

export function GlareHoverDemo({
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
  return <GlareHover className="w-full" speed={speed} intensity={intensity} scale={scale} color={color} />
}

export function CardSwapDemo({ interval, duration, angle, scale }: { interval?: number; duration?: number; angle?: number; scale?: number } = {}) {
  return <CardSwap className="w-full" interval={interval} duration={duration} angle={angle} scale={scale} />
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
