"use client"

import { useState } from "react"

import { ClothWindBanner } from "../effects/cloth-wind-banner"
import { CommentThread } from "../effects/comment-thread"
import { DataTunnel } from "../effects/data-tunnel"
import { EmbedCodeGenerator } from "../effects/embed-code-generator"
import { FileUploadQueue } from "../effects/file-upload-queue"
import { GalaxySpiral } from "../effects/galaxy-spiral"
import { PetalDissolveText } from "../effects/petal-dissolve-text"
import { PolaroidScrollStack } from "../sections/polaroid-scroll-stack"
import { PollVote } from "../effects/poll-vote"
import { ReactionBar, type ReactionItem } from "../effects/reaction-bar"
import { ProximityScaleGrid } from "../effects/proximity-scale-grid"
import { ScheduleSlotPicker } from "../effects/schedule-slot-picker"
import { ScrollSvgGraph } from "../effects/scroll-svg-graph"
import { SignaturePad } from "../effects/signature-pad"
import { SocialPostFeed } from "../effects/social-post-feed"
import { XrayFluidReveal } from "../effects/xray-fluid-reveal"

export function GalaxySpiralDemo() {
  return <GalaxySpiral className="w-full" />
}

export function ProximityScaleGridDemo() {
  return <ProximityScaleGrid className="w-full" />
}

export function PolaroidScrollStackDemo() {
  return <PolaroidScrollStack className="w-full" />
}

export function ScrollSvgGraphDemo() {
  return <ScrollSvgGraph className="w-full" />
}

export function ClothWindBannerDemo() {
  return <ClothWindBanner className="w-full" />
}

export function XrayFluidRevealDemo() {
  return <XrayFluidReveal className="w-full" />
}

export function PetalDissolveTextDemo() {
  return <PetalDissolveText className="w-full" />
}

export function DataTunnelDemo() {
  return <DataTunnel className="w-full" />
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

export function CommentThreadDemo() {
  return <CommentThread className="w-full" />
}

export function SignaturePadDemo() {
  return <SignaturePad className="w-full" />
}

export function PollVoteDemo() {
  return <PollVote className="w-full" />
}

export function ScheduleSlotPickerDemo() {
  return <ScheduleSlotPicker className="w-full" />
}

export function ReactionBarDemo() {
  const [items, setItems] = useState<ReactionItem[]>([
    { emoji: "👍", count: 3 },
    { emoji: "❤️", count: 1 },
    { emoji: "🎉", count: 0 },
  ])
  return (
    <ReactionBar
      items={items}
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
