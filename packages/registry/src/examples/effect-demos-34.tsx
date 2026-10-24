"use client"

import { useState } from "react"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentImage,
  AttachmentMedia,
  AttachmentTitle,
} from "../effects/attachment"
import { BarList } from "../effects/bar-list"
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "../effects/bubble"
import { CategoryBar } from "../effects/category-bar"
import { EcoModeButton } from "../effects/eco-mode-button"
import { HoverAttentionButton } from "../effects/hover-attention-button"
import { HoverSpringFeatures } from "../effects/hover-spring-features"
import { Marker, MarkerContent } from "../effects/marker"
import { MorphingShapesLoader } from "../effects/morphing-shapes-loader"
import { NeonGlowLoader } from "../effects/neon-glow-loader"
import { RippleWaveLoader } from "../effects/ripple-wave-loader"
import { RotatingCompleteButton } from "../effects/rotating-complete-button"
import { StitchesButton } from "../effects/stitches-button"
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceLine,
  TraceTitle,
} from "../effects/trace"

function swatch(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="100%" height="100%" fill="${color}"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function HoverAttentionButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <HoverAttentionButton effect="shake">摇一下</HoverAttentionButton>
      <HoverAttentionButton effect="tada">欢呼</HoverAttentionButton>
    </div>
  )
}

export function EcoModeButtonDemo({
  defaultActive = false,
  offLabel = "节能关",
  onLabel = "节能开",
}: { defaultActive?: boolean; offLabel?: string; onLabel?: string } = {}) {
  return (
    <div className="grid h-24 place-items-center">
      <EcoModeButton defaultActive={defaultActive} offLabel={offLabel} onLabel={onLabel} />
    </div>
  )
}

export function RotatingCompleteButtonDemo({
  idleLabel = "标为完成",
  loadingLabel = "处理中",
  doneLabel = "完成 ✓",
  duration = 700,
}: { idleLabel?: string; loadingLabel?: string; doneLabel?: string; duration?: number } = {}) {
  return (
    <div className="grid h-24 place-items-center">
      <RotatingCompleteButton doneLabel={doneLabel} duration={duration} idleLabel={idleLabel} loadingLabel={loadingLabel} />
    </div>
  )
}

export function MorphingShapesLoaderDemo({
  count = 4,
  size = 28,
  colors = ["#fb3a5d", "#6366f1", "#22c55e", "#f59e0b"],
}: { count?: number; size?: number; colors?: string[] } = {}) {
  return (
    <div className="grid h-24 place-items-center">
      <MorphingShapesLoader colors={colors} count={count} size={size} />
    </div>
  )
}

export function NeonGlowLoaderDemo({
  colors = ["#fb3a5d", "#00ffff", "#ffff00"],
  size = 18,
  duration = 1,
}: { colors?: string[]; size?: number; duration?: number } = {}) {
  return (
    <div className="grid h-24 place-items-center">
      <NeonGlowLoader colors={colors} duration={duration} size={size} />
    </div>
  )
}

export function RippleWaveLoaderDemo({
  count = 7,
  color = "#ef4444",
  duration = 1,
}: { count?: number; color?: string; duration?: number } = {}) {
  return (
    <div className="grid h-24 place-items-center">
      <RippleWaveLoader color={color} count={count} duration={duration} />
    </div>
  )
}

export function HoverSpringFeaturesDemo() {
  return (
    <HoverSpringFeatures
      className="px-6"
      items={[
        { id: "night", title: "夜航", description: "沿航线慢慢亮起来。", image: swatch("#312e81"), alt: "夜航" },
        { id: "light", title: "灯塔", description: "靠港前的最后一盏。", image: swatch("#b45309"), alt: "灯塔" },
        { id: "deck", title: "甲板", description: "日出时分的脚步声。", image: swatch("#0f766e"), alt: "甲板" },
      ]}
    />
  )
}

export function StitchesButtonDemo() {
  return (
    <div className="grid h-24 place-items-center">
      <StitchesButton>缝线</StitchesButton>
    </div>
  )
}

export function AttachmentDemo() {
  return (
    <Attachment orientation="horizontal" state="done">
      <AttachmentMedia variant="image">
        <AttachmentImage alt="航图" src={swatch("#312e81")} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>航图.png</AttachmentTitle>
        <AttachmentDescription>128 KB</AttachmentDescription>
      </AttachmentContent>
    </Attachment>
  )
}

export function BubbleDemo() {
  return (
    <BubbleGroup className="w-full max-w-sm">
      <Bubble align="start" variant="muted">
        <BubbleContent>灯塔还亮着吗？</BubbleContent>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>看到了，靠港。</BubbleContent>
        <BubbleReactions>🎉</BubbleReactions>
      </Bubble>
    </BubbleGroup>
  )
}

export function MarkerDemo() {
  return (
    <Marker variant="separator">
      <MarkerContent>今天</MarkerContent>
    </Marker>
  )
}

export function TraceDemo() {
  return (
    <Trace className="max-w-sm">
      <TraceCollapsible>
        <TraceCollapsibleTrigger>
          <TraceLine status="running">
            <TraceTitle>核对航线</TraceTitle>
            <TraceDescription>2 步</TraceDescription>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent>先看北窗，再对灯塔。</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  )
}

export function CategoryBarDemo() {
  return (
    <div className="w-full max-w-md">
      <CategoryBar
        colors={["#6366f1", "#22c55e", "#f59e0b"]}
        marker={{ value: 62, tooltip: "62" }}
        values={[40, 35, 25]}
      />
    </div>
  )
}

export function BarListDemo() {
  const [picked, setPicked] = useState("灯塔")
  return (
    <div className="w-full max-w-md space-y-3">
      <BarList
        data={[
          { name: "夜航", value: 42 },
          { name: "灯塔", value: 28 },
          { name: "甲板", value: 16 },
        ]}
        onValueChange={(item) => setPicked(item.name)}
      />
      <p className="text-sm text-muted-foreground">选中 {picked}</p>
    </div>
  )
}
