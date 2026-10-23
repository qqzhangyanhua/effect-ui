"use client"

import { useRef, useState } from "react"
import { BellIcon } from "lucide-react"
import { motion, useMotionValueEvent, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "../hooks/use-prefers-reduced-motion"
import { AnimatedGradient } from "../effects/animated-gradient-with-svg"
import { Announcement, AnnouncementTag, AnnouncementTitle } from "../effects/announcement"
import { Banner, BannerAction, BannerClose, BannerIcon, BannerTitle } from "../effects/banner"
import { Choicebox, ChoiceboxIndicator, ChoiceboxItem, ChoiceboxItemDescription, ChoiceboxItemHeader, ChoiceboxItemSubtitle, ChoiceboxItemTitle } from "../effects/choicebox"
import { CSSBox, type CSSBoxRef } from "../effects/css-box"
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
} from "../effects/dialog-stack"
import { DragElements } from "../effects/drag-elements"
import { GooeySvgFilter } from "../effects/gooey-svg-filter"
import { Floating, FloatingElement } from "../effects/parallax-floating"
import { Pill, PillDelta, PillIndicator, PillStatus } from "../effects/pill"
import { PixelateSvgFilter } from "../effects/pixelate-svg-filter"
import { RelativeTime, RelativeTimeZone, RelativeTimeZoneDate, RelativeTimeZoneDisplay, RelativeTimeZoneLabel } from "../effects/relative-time"
import { ScrollAndSwapText } from "../effects/scroll-and-swap-text"
import { Ticker, TickerPrice, TickerPriceChange, TickerSymbol } from "../effects/ticker"
import { UnderlineToBackground } from "../effects/underline-to-background"

const face = (label: string, color: string) => (
  <div className="grid h-full w-full place-items-center text-sm text-white" style={{ background: color }}>
    {label}
  </div>
)

export function CssBoxDemo({
  width = 120,
  height = 120,
  depth = 72,
}: { width?: number; height?: number; depth?: number } = {}) {
  const boxRef = useRef<CSSBoxRef>(null)
  return (
    <div className="flex flex-col items-center gap-4">
      <CSSBox
        depth={depth}
        height={height}
        width={width}
        faces={{
          front: face("前", "#312e81"),
          back: face("后", "#1e1b4b"),
          left: face("左", "#4338ca"),
          right: face("右", "#6366f1"),
          top: face("上", "#818cf8"),
          bottom: face("下", "#3730a3"),
        }}
        ref={boxRef}
      />
      <button className="rounded-md border px-3 py-1 text-sm" onClick={() => boxRef.current?.showRight()} type="button">
        转到右侧
      </button>
    </div>
  )
}

export function DragElementsDemo({
  dragMomentum = true,
  dragPropagation = true,
  selectedOnTop = true,
}: { dragMomentum?: boolean; dragPropagation?: boolean; selectedOnTop?: boolean } = {}) {
  return (
    <DragElements className="h-48 w-full rounded-2xl border" dragMomentum={dragMomentum} dragPropagation={dragPropagation} selectedOnTop={selectedOnTop}>
      <span className="bg-indigo-500 mt-8 ml-8 inline-block rounded-md px-3 py-2 text-sm text-white">夜航</span>
      <span className="bg-amber-400 mt-16 ml-36 inline-block rounded-md px-3 py-2 text-sm">航线</span>
      <span className="bg-emerald-500 mt-6 ml-56 inline-block rounded-md px-3 py-2 text-sm text-white">北窗</span>
    </DragElements>
  )
}

export function ScrollAndSwapTextDemo() {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div className="h-40 overflow-auto rounded-2xl border" ref={containerRef}>
      <div className="h-80 px-6 pt-16">
        <ScrollAndSwapText className="text-3xl font-semibold" containerRef={containerRef}>
          北窗换字
        </ScrollAndSwapText>
      </div>
    </div>
  )
}

export function UnderlineToBackgroundDemo({
  as = "a",
  href = "#north",
  targetTextColor = "#1e1b4b",
}: { as?: "span" | "a"; href?: string; targetTextColor?: string } = {}) {
  return (
    <UnderlineToBackground as={as} className="text-3xl font-semibold" href={href} targetTextColor={targetTextColor}>
      北窗航线
    </UnderlineToBackground>
  )
}

export function ParallaxFloatingDemo() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl border">
      <Floating>
        <FloatingElement className="top-10 left-10" depth={0.4}>
          <span className="rounded-md bg-indigo-500 px-3 py-1 text-sm text-white">近处</span>
        </FloatingElement>
        <FloatingElement className="top-20 left-48" depth={1.6}>
          <span className="rounded-md bg-amber-300 px-3 py-1 text-sm">远处</span>
        </FloatingElement>
      </Floating>
    </div>
  )
}

export function PixelateSvgFilterDemo() {
  const reduced = usePrefersReducedMotion()
  const size = useSpring(6, { stiffness: 180, damping: 22 })
  const [pixels, setPixels] = useState(6)
  useMotionValueEvent(size, "change", (latest) => setPixels(latest))
  return (
    <div
      className="relative grid h-40 w-full place-items-center overflow-hidden rounded-2xl border bg-zinc-950"
      onMouseEnter={() => {
        if (!reduced) size.set(14)
      }}
      onMouseLeave={() => size.set(6)}
    >
      <PixelateSvgFilter id="pixelate-demo" size={pixels} />
      <p className="text-6xl font-semibold tracking-widest text-indigo-200" style={{ filter: "url(#pixelate-demo)" }}>
        北窗
      </p>
    </div>
  )
}

export function GooeySvgFilterDemo() {
  const reduced = usePrefersReducedMotion()
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-2xl border">
      <GooeySvgFilter id="gooey-demo" strength={14} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ filter: "url(#gooey-demo)" }}>
        <motion.span
          animate={reduced ? undefined : { x: [-36, 36, -36] }}
          className="size-16 rounded-full bg-indigo-500"
          transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="absolute size-16 rounded-full bg-indigo-300" />
      </div>
    </div>
  )
}

export function AnimatedGradientDemo({
  colors = ["#312e81", "#6366f1", "#f59e0b"],
  speed = 8,
  blur = "medium",
}: {
  colors?: string[]
  speed?: number
  blur?: "light" | "medium" | "heavy"
} = {}) {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl border">
      <AnimatedGradient colors={colors} speed={speed} blur={blur} />
    </div>
  )
}

export function AnnouncementDemo() {
  return (
    <Announcement themed>
      <AnnouncementTag>新</AnnouncementTag>
      <AnnouncementTitle>夜航窗口已打开</AnnouncementTitle>
    </Announcement>
  )
}

export function BannerDemo() {
  return (
    <Banner inset>
      <BannerIcon icon={BellIcon} />
      <BannerTitle>今晚 23:00 有一条航线提醒</BannerTitle>
      <BannerAction>查看</BannerAction>
      <BannerClose />
    </Banner>
  )
}

export function PillDemo() {
  return (
    <Pill>
      <PillStatus>
        <PillIndicator pulse variant="success" />
        在航
      </PillStatus>
      <span>北窗</span>
      <PillDelta delta={12} />
    </Pill>
  )
}

export function RelativeTimeDemo() {
  return (
    <RelativeTime className="max-w-sm">
      <RelativeTimeZone zone="Asia/Shanghai">
        <RelativeTimeZoneLabel>上海</RelativeTimeZoneLabel>
        <RelativeTimeZoneDate />
        <RelativeTimeZoneDisplay />
      </RelativeTimeZone>
      <RelativeTimeZone zone="UTC">
        <RelativeTimeZoneLabel>UTC</RelativeTimeZoneLabel>
        <RelativeTimeZoneDate />
        <RelativeTimeZoneDisplay />
      </RelativeTimeZone>
    </RelativeTime>
  )
}

export function TickerDemo({
  currency = "USD",
  isPercent = true,
  price = 128.4,
}: {
  currency?: string
  isPercent?: boolean
  price?: number
} = {}) {
  return (
    <Ticker currency={currency} locale="en-US">
      <TickerSymbol symbol="nwin" />
      <TickerPrice price={price} />
      <TickerPriceChange change={2.35} isPercent={isPercent} />
    </Ticker>
  )
}

export function DialogStackDemo() {
  return (
    <DialogStack clickable>
      <DialogStackTrigger>打开航线</DialogStackTrigger>
      <DialogStackOverlay />
      <DialogStackBody>
        <DialogStackContent>
          <DialogStackHeader>
            <DialogStackTitle>选择港口</DialogStackTitle>
          </DialogStackHeader>
          <DialogStackFooter>
            <DialogStackNext className="bg-primary text-primary-foreground h-9 px-3">下一步</DialogStackNext>
          </DialogStackFooter>
        </DialogStackContent>
        <DialogStackContent>
          <DialogStackHeader>
            <DialogStackTitle>确认出发</DialogStackTitle>
          </DialogStackHeader>
          <DialogStackFooter>
            <DialogStackPrevious className="h-9 px-3">返回</DialogStackPrevious>
          </DialogStackFooter>
        </DialogStackContent>
      </DialogStackBody>
    </DialogStack>
  )
}

export function ChoiceboxDemo() {
  return (
    <Choicebox defaultValue="night">
      <ChoiceboxItem id="choice-night" value="night">
        <ChoiceboxItemHeader>
          <ChoiceboxItemTitle>夜航</ChoiceboxItemTitle>
          <ChoiceboxItemSubtitle>静音</ChoiceboxItemSubtitle>
          <ChoiceboxItemDescription>只保留航线灯。</ChoiceboxItemDescription>
        </ChoiceboxItemHeader>
        <ChoiceboxIndicator />
      </ChoiceboxItem>
      <ChoiceboxItem id="choice-day" value="day">
        <ChoiceboxItemHeader>
          <ChoiceboxItemTitle>日航</ChoiceboxItemTitle>
          <ChoiceboxItemSubtitle>明亮</ChoiceboxItemSubtitle>
          <ChoiceboxItemDescription>打开全部甲板灯。</ChoiceboxItemDescription>
        </ChoiceboxItemHeader>
        <ChoiceboxIndicator />
      </ChoiceboxItem>
    </Choicebox>
  )
}
