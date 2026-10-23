"use client"

import { useState, useRef } from "react"

import { AutosizeTextarea } from "../effects/autosize-textarea"
import { BreathingText } from "../effects/breathing-text"
import { DualRangeSlider } from "../effects/dual-range-slider"
import { ElasticLine } from "../effects/elastic-line"
import { HeadingWithAnchor } from "../effects/heading-with-anchor"
import { Letter3DSwap } from "../effects/letter-3d-swap"
import { LoadingButton } from "../effects/loading-button"
import { MediaBetweenText } from "../effects/media-between-text"
import { PixelTrail } from "../effects/pixel-trail"
import { ProgressWithValue } from "../effects/progress-with-value"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "../effects/responsive-modal"
import { Screensaver } from "../effects/screensaver"
import { TextCursorProximity } from "../effects/text-cursor-proximity"
import { TextHighlighter } from "../effects/text-highlighter"
import { VerticalCutReveal } from "../effects/vertical-cut-reveal"

const swatch = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80"><rect width="160" height="80" fill="${color}"/></svg>`,
  )}`

export function PixelTrailDemo({
  pixelSize = 16,
  fadeDuration = 700,
  delay = 0,
}: {
  pixelSize?: number
  fadeDuration?: number
  delay?: number
} = {}) {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl border bg-zinc-950">
      <p className="pointer-events-none absolute top-4 left-4 z-10 text-sm text-zinc-300">指针划过会点亮格子</p>
      <PixelTrail pixelSize={pixelSize} fadeDuration={fadeDuration} delay={delay} pixelClassName="bg-indigo-400" />
    </div>
  )
}

export function ScreensaverDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl border" ref={containerRef}>
      <Screensaver containerRef={containerRef} speed={2} startAngle={35} startPosition={{ x: 8, y: 20 }}>
        <span className="bg-primary text-primary-foreground rounded-md px-3 py-1 text-sm">北窗</span>
      </Screensaver>
    </div>
  )
}

export function MediaBetweenTextDemo({
  firstText = "北",
  secondText = "窗",
  mediaType = "image",
}: { firstText?: string; secondText?: string; mediaType?: "image" | "video" } = {}) {
  return (
    <MediaBetweenText
      alt="靛蓝色块"
      className="items-center text-3xl font-semibold"
      firstText={firstText}
      mediaContainerClassName="mx-2 h-12 overflow-hidden rounded-md"
      mediaType={mediaType}
      mediaUrl={swatch("#312e81")}
      secondText={secondText}
    />
  )
}

export function Letter3DSwapDemo({
  staggerDuration = 0.03,
  staggerFrom = "first",
  rotateDirection = "top",
}: {
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | "random"
  rotateDirection?: "top" | "right" | "bottom" | "left"
} = {}) {
  return (
    <Letter3DSwap
      mainClassName="text-4xl font-semibold"
      rotateDirection={rotateDirection}
      staggerDuration={staggerDuration}
      staggerFrom={staggerFrom}
    >
      翻面
    </Letter3DSwap>
  )
}

export function VerticalCutRevealDemo({
  reverse = false,
  splitBy = "characters",
  staggerDuration = 0.2,
}: { reverse?: boolean; splitBy?: "words" | "characters" | "lines"; staggerDuration?: number } = {}) {
  return (
    <VerticalCutReveal
      containerClassName="text-3xl font-semibold"
      reverse={reverse}
      splitBy={splitBy}
      staggerDuration={staggerDuration}
    >
      雾散以后
    </VerticalCutReveal>
  )
}

export function TextCursorProximityDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div className="w-full rounded-2xl border p-8 text-3xl" ref={containerRef}>
      <TextCursorProximity
        containerRef={containerRef}
        falloff="gaussian"
        radius={120}
        styles={{
          scale: { from: 1, to: 1.6 },
          color: { from: "rgb(100, 116, 139)", to: "rgb(79, 70, 229)" },
        }}
      >
        指针靠近时字母变大
      </TextCursorProximity>
    </div>
  )
}

export function ElasticLineDemo({
  grabThreshold = 28,
  releaseThreshold = 90,
  strokeWidth = 2,
}: { grabThreshold?: number; releaseThreshold?: number; strokeWidth?: number } = {}) {
  return (
    <div className="h-32 w-full text-indigo-500">
      <ElasticLine grabThreshold={grabThreshold} releaseThreshold={releaseThreshold} strokeWidth={strokeWidth} />
    </div>
  )
}

export function BreathingTextDemo({
  fromFontVariationSettings = "'wght' 420",
  toFontVariationSettings = "'wght' 820",
  staggerFrom = "center",
}: {
  fromFontVariationSettings?: string
  toFontVariationSettings?: string
  staggerFrom?: "first" | "last" | "center"
} = {}) {
  return (
    <BreathingText
      className="text-4xl"
      fromFontVariationSettings={fromFontVariationSettings}
      staggerFrom={staggerFrom}
      toFontVariationSettings={toFontVariationSettings}
    >
      呼吸
    </BreathingText>
  )
}

export function AutosizeTextareaDemo() {
  return <AutosizeTextarea className="w-full" defaultValue="夜航记录可以继续往下写。" minHeight={52} placeholder="写下一段" />
}

export function LoadingButtonDemo({
  asChild = false,
  variant = "default",
  size = "default",
}: {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
} = {}) {
  const [loading, setLoading] = useState(false)
  return (
    <LoadingButton
      asChild={asChild}
      loading={loading}
      onClick={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 1200)
      }}
      size={size}
      type="button"
      variant={variant}
    >
      保存记录
    </LoadingButton>
  )
}

export function ProgressWithValueDemo() {
  return <ProgressWithValue className="w-full" position="follow" value={64} />
}

export function DualRangeSliderDemo() {
  const [value, setValue] = useState([20, 80])
  return (
    <div className="w-full px-2 pt-8">
      <DualRangeSlider
        label={(thumb) => thumb}
        max={100}
        min={0}
        onValueChange={setValue}
        value={value}
      />
    </div>
  )
}

export function HeadingWithAnchorDemo() {
  return (
    <HeadingWithAnchor anchor="night-log" anchorVisibility="always" variant="h2">
      夜航记录
    </HeadingWithAnchor>
  )
}

export function ResponsiveModalDemo() {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger className="rounded-md border px-3 py-1 text-sm">打开抽屉</ResponsiveModalTrigger>
      <ResponsiveModalContent side="bottom">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>夜航记录</ResponsiveModalTitle>
          <ResponsiveModalDescription>窄屏从底部进入，宽屏保持居中。</ResponsiveModalDescription>
        </ResponsiveModalHeader>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

export function TextHighlighterDemo({
  triggerType = "auto",
  highlightColor = "hsl(48, 96%, 76%)",
  direction = "ltr",
}: {
  triggerType?: "hover" | "ref" | "inView" | "auto"
  highlightColor?: string
  direction?: "ltr" | "rtl" | "ttb" | "btt"
} = {}) {
  return (
    <TextHighlighter className="text-2xl" direction={direction} highlightColor={highlightColor} triggerType={triggerType}>
      这段话被荧光笔标出来
    </TextHighlighter>
  )
}
