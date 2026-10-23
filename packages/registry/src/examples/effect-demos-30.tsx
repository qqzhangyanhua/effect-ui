"use client"

import { useState } from "react"

import { CountBadge } from "../effects/count-badge"
import { DepthParallaxWords } from "../effects/depth-parallax-words"
import { ExpandableNavbar } from "../effects/expandable-navbar"
import { GitHubStarsAnimation } from "../effects/github-stars-animation"
import { HoverExpand } from "../effects/hover-expand"
import { InlineTestimonials } from "../effects/inline-testimonials"
import { MorphIcon } from "../effects/morph-icon"
import { Orb } from "../effects/orb"
import { PerspectiveText3D } from "../effects/perspective-text-3d"
import { PrismSweepTransition } from "../effects/prism-sweep-transition"
import { ReviewsCarousel } from "../effects/reviews-carousel"
import { ScrollImageReveal } from "../effects/scroll-image-reveal"
import { SocialSelector } from "../effects/social-selector"
import { SplashMask } from "../effects/splash-mask"
import { SvgClipMask } from "../effects/svg-clip-mask"

const swatch = (color: string, width = 640, height = 400) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${color}"/></svg>`,
  )}`

const face = swatch("#312e81", 80, 80)

export function PerspectiveText3DDemo({
  depth = 48,
  driver = "pointer",
  text = "北窗夜航",
}: { depth?: number; driver?: "scroll" | "pointer" | "static"; text?: string } = {}) {
  return <PerspectiveText3D className="text-4xl font-semibold" depth={depth} driver={driver} text={text} />
}

export function ScrollImageRevealDemo() {
  return (
    <div className="h-64 w-full overflow-auto rounded-2xl border">
      <div className="h-[150%] px-4 pt-24">
        <ScrollImageReveal
          alt="靛蓝夜空"
          className="h-40"
          offset={["start 0.95", "start 0.4"]}
          src={swatch("#1e1b4b")}
        />
      </div>
    </div>
  )
}

export function SvgClipMaskDemo() {
  return (
    <SvgClipMask
      animate="morph"
      className="h-48 w-full"
      morphPaths={[
        "M0.5,0.05 C0.8,0.05 0.95,0.28 0.95,0.5 C0.95,0.78 0.75,0.95 0.5,0.95 C0.22,0.95 0.05,0.72 0.05,0.5 C0.05,0.22 0.25,0.05 0.5,0.05 Z",
        "M0.5,0.02 C0.9,0.12 0.98,0.4 0.9,0.62 C0.8,0.9 0.55,0.98 0.32,0.88 C0.08,0.76 0.02,0.42 0.16,0.22 C0.28,0.04 0.32,-0.02 0.5,0.02 Z",
      ]}
      shape="blob"
    >
      <div className="h-full w-full bg-gradient-to-br from-fuchsia-500 to-indigo-700" />
    </SvgClipMask>
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

export function PrismSweepTransitionDemo() {
  const scenes = ["洋红", "香槟", "海沫"]
  const [page, setPage] = useState(0)
  return (
    <div className="w-full space-y-3">
      <button className="rounded-md border px-3 py-1 text-sm" onClick={() => setPage((value) => (value + 1) % scenes.length)} type="button">
        下一幕
      </button>
      <PrismSweepTransition className="h-40" transitionKey={page}>
        <div className="flex h-40 items-center justify-center text-3xl font-semibold">{scenes[page] ?? "洋红"}</div>
      </PrismSweepTransition>
    </div>
  )
}

export function OrbDemo() {
  return <Orb className="mx-auto" colors={["#7c3aed", "#fde68a"]} size={220} />
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

export function InlineTestimonialsDemo() {
  return (
    <InlineTestimonials
      testimonials={[
        {
          avatar: face,
          id: "lin",
          name: "林",
          quote: "夜航那一段把港口写清楚了。",
          rating: 5,
          role: "编辑",
        },
      ]}
      text="这一段是 {{lin}} 留下的批注，读完还能看见灯。"
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

export function SocialSelectorDemo() {
  return <SocialSelector handle="northwindow" />
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

export function ReviewsCarouselDemo({
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
}: { autoPlay?: boolean; autoPlayInterval?: number; showIndicators?: boolean } = {}) {
  return (
    <ReviewsCarousel
      autoPlay={autoPlay}
      autoPlayInterval={autoPlayInterval}
      className="h-72"
      reviews={[
        { author: "林", body: "港口的灯还在。", id: "a", title: "夜航" },
        { author: "周", body: "雾散得很干净。", id: "b", title: "清晨" },
        { author: "许", body: "句子里还能点开头像。", id: "c", title: "批注" },
      ]}
      showIndicators={showIndicators}
    />
  )
}
