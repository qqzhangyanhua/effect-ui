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

export function PixelTrailDemo() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl border bg-zinc-950">
      <p className="pointer-events-none absolute top-4 left-4 z-10 text-sm text-zinc-300">指针划过会点亮格子</p>
      <PixelTrail fadeDuration={700} pixelClassName="bg-indigo-400" pixelSize={16} />
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

export function MediaBetweenTextDemo() {
  return (
    <MediaBetweenText
      alt="靛蓝色块"
      className="items-center text-3xl font-semibold"
      firstText="北"
      mediaContainerClassName="mx-2 h-12 overflow-hidden rounded-md"
      mediaType="image"
      mediaUrl={swatch("#312e81")}
      secondText="窗"
    />
  )
}

export function Letter3DSwapDemo() {
  return (
    <Letter3DSwap mainClassName="text-4xl font-semibold" rotateDirection="top" staggerDuration={0.03}>
      翻面
    </Letter3DSwap>
  )
}

export function VerticalCutRevealDemo() {
  return (
    <VerticalCutReveal containerClassName="text-3xl font-semibold" splitBy="characters">
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

export function ElasticLineDemo() {
  return (
    <div className="h-32 w-full text-indigo-500">
      <ElasticLine grabThreshold={28} releaseThreshold={90} strokeWidth={2} />
    </div>
  )
}

export function BreathingTextDemo() {
  return (
    <BreathingText className="text-4xl" fromFontVariationSettings="'wght' 420" staggerFrom="center" toFontVariationSettings="'wght' 820">
      呼吸
    </BreathingText>
  )
}

export function AutosizeTextareaDemo() {
  return <AutosizeTextarea className="w-full" defaultValue="夜航记录可以继续往下写。" minHeight={52} placeholder="写下一段" />
}

export function LoadingButtonDemo() {
  const [loading, setLoading] = useState(false)
  return (
    <LoadingButton
      loading={loading}
      onClick={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 1200)
      }}
      type="button"
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

export function TextHighlighterDemo() {
  return (
    <TextHighlighter className="text-2xl" direction="ltr" highlightColor="hsl(48, 96%, 76%)" triggerType="auto">
      这段话被荧光笔标出来
    </TextHighlighter>
  )
}
