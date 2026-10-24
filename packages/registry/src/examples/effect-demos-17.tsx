"use client"

import { useState } from "react"

import { ClothWindBanner } from "../effects/cloth-wind-banner"
import { DataTunnel } from "../effects/data-tunnel"
import { EmbedCodeGenerator } from "../effects/embed-code-generator"
import { FileUploadQueue } from "../effects/file-upload-queue"
import { GalaxySpiral } from "../effects/galaxy-spiral"
import { PetalDissolveText } from "../effects/petal-dissolve-text"
import { PolaroidScrollStack } from "../sections/polaroid-scroll-stack"
import { PollVote } from "../effects/poll-vote"
import { ReactionBar, type ReactionItem } from "../effects/reaction-bar"
import { ProximityScaleGrid } from "../effects/proximity-scale-grid"
import { ScrollSvgGraph } from "../effects/scroll-svg-graph"
import { SignaturePad } from "../effects/signature-pad"
import { SocialPostFeed } from "../effects/social-post-feed"


export function GalaxySpiralDemo({
  arms = 3,
  radius = 1,
  count = 1800,
  randomness = 0.45,
  speed = 0.7,
  colors = ["#f8e7b0", "#7dd3fc"],
}: {
  arms?: number
  radius?: number
  count?: number
  randomness?: number
  speed?: number
  colors?: string[]
} = {}) {
  return (
    <GalaxySpiral
      className="w-full"
      arms={arms}
      radius={radius}
      count={count}
      randomness={randomness}
      speed={speed}
      colors={colors}
    />
  )
}

export function ProximityScaleGridDemo({ count, size, speed, intensity, color }: { count?: number; size?: number; speed?: number; intensity?: number; color?: string } = {}) {
  return <ProximityScaleGrid className="w-full" count={count} size={size} speed={speed} intensity={intensity} color={color} />
}

export function PolaroidScrollStackDemo() {
  return <PolaroidScrollStack className="w-full" />
}

export function ScrollSvgGraphDemo({
  speed,
  intensity,
  color,
}: {
  speed?: number
  intensity?: number
  color?: string
} = {}) {
  return <ScrollSvgGraph className="w-full" speed={speed} intensity={intensity} color={color} />
}

export function ClothWindBannerDemo({
  intensity = 0.65,
  speed = 1,
  colors = ["#7c3aed", "#ea580c"],
}: {
  intensity?: number
  speed?: number
  colors?: string[]
} = {}) {
  return <ClothWindBanner className="w-full" intensity={intensity} speed={speed} colors={colors} />
}
export function PetalDissolveTextDemo({
  text = "花瓣散开",
  direction = "forward",
  duration = 1400,
  color = "#fb7185",
  trigger = "manual",
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  direction?: "forward" | "reverse"
  duration?: number
  color?: string
  trigger?: "view" | "hover" | "manual"
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <PetalDissolveText
      className="w-full"
      text={text}
      direction={direction}
      duration={duration}
      color={color}
      trigger={trigger}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function DataTunnelDemo({
  count = 10,
  speed = 1,
  colors = ["#0d3347", "#a6f2ff"],
  intensity = 1,
}: {
  count?: number
  speed?: number
  colors?: string[]
  intensity?: number
} = {}) {
  return <DataTunnel className="w-full" count={count} speed={speed} colors={colors} intensity={intensity} />
}

export function FileUploadQueueDemo() {
  return <FileUploadQueue className="w-full" />
}

export function EmbedCodeGeneratorDemo() {
  return <EmbedCodeGenerator className="w-full" />
}

export function SocialPostFeedDemo() {
  return <SocialPostFeed className="w-full" />
}

export function SignaturePadDemo() {
  return <SignaturePad className="w-full" />
}

export function PollVoteDemo() {
  return <PollVote className="w-full" />
}

export function ReactionBarDemo({
  duration,
  scale,
  gap,
  color,
}: {
  duration?: number
  scale?: number
  gap?: number
  color?: string
} = {}) {
  const [items, setItems] = useState<ReactionItem[]>([
    { emoji: "👍", count: 3 },
    { emoji: "❤️", count: 1 },
    { emoji: "🎉", count: 0 },
  ])
  return (
    <ReactionBar
      items={items}
      duration={duration}
      scale={scale}
      gap={gap}
      color={color}
      onToggle={(emoji) =>
        setItems((current) =>
          current.map((item) =>
            item.emoji === emoji ? { ...item, active: !item.active, count: item.count + (item.active ? -1 : 1) } : item,
          ),
        )
      }
    />
  )
}
