"use client"

import { useState } from "react"

import { CountBadge } from "../effects/count-badge"
import { DepthParallaxWords } from "../effects/depth-parallax-words"
import { ExpandableNavbar } from "../effects/expandable-navbar"
import { GitHubStarsAnimation } from "../effects/github-stars-animation"
import { HoverExpand } from "../effects/hover-expand"

import { MorphIcon } from "../effects/morph-icon"

import { PrismSweepTransition } from "../effects/prism-sweep-transition"

import { ScrollImageReveal } from "../effects/scroll-image-reveal"
import { SplashMask } from "../effects/splash-mask"


const swatch = (color: string, width = 640, height = 400) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`,
  )}`

const face = swatch("#312e81", 80, 80)

export function ScrollImageRevealDemo({
  direction = "left",
  mask = "wipe",
  parallax = 60,
}: {
  direction?: "left" | "right" | "up" | "down"
  mask?: "wipe" | "curtain" | "circle" | "blinds" | "scale"
  parallax?: number
} = {}) {
  return (
    <div className="h-64 w-full overflow-auto rounded-2xl border">
      <div className="h-[150%] px-4 pt-24">
        <ScrollImageReveal
          alt="靛蓝夜空"
          className="h-40"
          direction={direction}
          mask={mask}
          offset={["start 0.95", "start 0.4"]}
          parallax={parallax}
          src={swatch("#1e1b4b")}
        />
      </div>
    </div>
  )
}
export function DepthParallaxWordsDemo({
  delay = 0,
  stagger = 80,
  triggerOnView = false,
}: { delay?: number; stagger?: number; triggerOnView?: boolean } = {}) {
  return (
    <DepthParallaxWords className="text-3xl font-semibold" delay={delay} stagger={stagger} triggerOnView={triggerOnView}>
      雾散以后还能看见港口
    </DepthParallaxWords>
  )
}

export function PrismSweepTransitionDemo({
  direction = "left",
  duration = 1240,
  tone = "prism",
}: {
  direction?: "left" | "right" | "up" | "down"
  duration?: number
  tone?: "prism" | "chroma" | "aperture" | "beam"
} = {}) {
  const scenes = ["洋红", "香槟", "海沫"]
  const [page, setPage] = useState(0)
  return (
    <div className="w-full space-y-3">
      <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setPage((value) => (value + 1) % scenes.length)} type="button">
        下一幕
      </button>
      <PrismSweepTransition className="h-40" direction={direction} duration={duration} tone={tone} transitionKey={page}>
        <div className="flex h-40 items-center justify-center text-3xl font-semibold">{scenes[page] ?? "洋红"}</div>
      </PrismSweepTransition>
    </div>
  )
}
export function SplashMaskDemo() {
  return (
    <SplashMask className="mx-auto h-56 w-full max-w-sm">
      <div className="h-full w-full bg-gradient-to-br from-sky-400 via-cyan-200 to-indigo-700" />
    </SplashMask>
  )
}

export function MorphIconDemo({
  duration = 0.3,
  size = 24,
  variant = "menu",
}: {
  duration?: number
  size?: number
  variant?: "sidebar" | "list" | "grid" | "compact" | "menu" | "search" | "play" | "check"
} = {}) {
  const [open, setOpen] = useState(false)
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
      onClick={() => setOpen((value) => !value)}
      type="button"
    >
      <MorphIcon active={open} duration={duration} label={open ? "关闭菜单" : "打开菜单"} size={size} variant={variant} />
      {open ? "关闭" : "菜单"}
    </button>
  )
}

export function HoverExpandDemo({
  collapsedFlex = 1,
  expandedFlex = 4,
  orientation = "horizontal",
  showLabelsWhenCollapsed = true,
}: {
  collapsedFlex?: number
  expandedFlex?: number
  orientation?: "horizontal" | "vertical"
  showLabelsWhenCollapsed?: boolean
} = {}) {
  return (
    <HoverExpand
      collapsedFlex={collapsedFlex}
      expandedFlex={expandedFlex}
      items={[
        { alt: "靛蓝", id: "indigo", image: swatch("#312e81"), title: "靛蓝" },
        { alt: "琥珀", id: "amber", image: swatch("#b45309"), title: "琥珀" },
        { alt: "青绿", id: "teal", image: swatch("#0f766e"), title: "青绿" },
      ]}
      orientation={orientation}
      showLabelsWhenCollapsed={showLabelsWhenCollapsed}
    />
  )
}
export function CountBadgeDemo({
  count = 128,
  ping = true,
  variant = "count",
}: {
  count?: number
  ping?: boolean
  variant?: "dot" | "count" | "status"
} = {}) {
  return (
    <CountBadge count={count} ping={ping} variant={variant}>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm">信</span>
    </CountBadge>
  )
}

export function GitHubStarsAnimationDemo({
  maxAvatars = 5,
  repo = "effect-ui",
  starCount = 1280,
}: {
  maxAvatars?: number
  repo?: string
  starCount?: number
} = {}) {
  return (
    <GitHubStarsAnimation
      maxAvatars={maxAvatars}
      repo={repo}
      starCount={starCount}
      stargazers={[
        { avatar_url: face, html_url: "https://github.com/north", login: "north" },
        { avatar_url: swatch("#9f1239", 80, 80), html_url: "https://github.com/harbor", login: "harbor" },
      ]}
    />
  )
}

export function ExpandableNavbarDemo() {
  return (
    <ExpandableNavbar
      items={[
        { id: "work", label: "作品", panel: <p>夜航、港口、雾。</p> },
        { id: "notes", label: "笔记", panel: <p>把批注留在句子里面。</p> },
      ]}
    />
  )
}
