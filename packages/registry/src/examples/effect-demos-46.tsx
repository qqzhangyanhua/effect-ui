"use client"

import { useState, type CSSProperties } from "react"

import { CaptionImageCard } from "../effects/caption-image-card"
import { DottedGlowBackground } from "../effects/dotted-glow-background"
import { MultiStepLoader } from "../effects/multi-step-loader"
import { NeoStarShapes } from "../effects/neo-star-shapes"
import { StarRingOrbit } from "../effects/star-ring-orbit"
import { StatefulButton } from "../effects/stateful-button"
import { StickyBanner } from "../effects/sticky-banner"
import { TweetCard } from "../effects/tweet-card"

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#3b5bdb"/><circle cx="40" cy="32" r="12" fill="#ffffff"/><rect x="18" y="50" width="44" height="20" rx="10" fill="#ffffff"/></svg>',
)}`

const scene = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#05e17a"/><circle cx="200" cy="130" r="54" fill="#111111"/><rect x="70" y="210" width="260" height="18" rx="4" fill="#111111"/></svg>',
)}`

const steps = [{ text: "核对清单" }, { text: "写入记录" }, { text: "通知相关的人" }]

export function DottedGlowBackgroundDemo({
  gap = 16,
  opacity = 0.3,
  speed = 1,
}: {
  gap?: number
  opacity?: number
  speed?: number
} = {}) {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border bg-background text-muted-foreground" style={{ ["--brand" as string]: "#3b5bdb" }}>
      <DottedGlowBackground gap={gap} opacity={opacity} speed={speed} />
      <p className="relative px-6 py-8 text-sm text-foreground">光晕从点阵上慢慢走过</p>
    </div>
  )
}

export function StarRingOrbitDemo({
  color = "#05e17a",
  count = 12,
  size = 42,
}: { color?: string; count?: number; size?: number } = {}) {
  return (
    <StarRingOrbit
      className="min-h-80 w-full"
      color={color}
      count={count}
      size={size}
      style={{ "--rx": "160px", "--ry": "120px" } as CSSProperties}
    >
      <h2 className="px-6 text-center text-xl font-semibold text-foreground">围着标题转</h2>
    </StarRingOrbit>
  )
}

export function StickyBannerDemo() {
  return (
    <div className="w-full overflow-hidden rounded-xl border">
      <StickyBanner className="bg-gradient-to-r from-[#3b5bdb] via-[#4c6ef5] to-[#22b8cf] text-white">新的公告可以钉在页面顶部</StickyBanner>
      <p className="px-4 py-6 text-sm text-muted-foreground">关掉之后，焦点会落到后面的内容。</p>
      <a href="#banner-next" className="mx-4 mb-4 inline-flex min-h-11 items-center text-sm text-primary">
        下一项
      </a>
    </div>
  )
}

export function MultiStepLoaderDemo({
  duration = 1800,
  loop = false,
  title = "正在整理",
}: { duration?: number; loop?: boolean; title?: string } = {}) {
  const [loading, setLoading] = useState(true)
  return (
    <div className="flex min-h-80 w-full items-center justify-center">
      <button type="button" className="min-h-11 rounded-full bg-primary px-4 text-sm text-primary-foreground" onClick={() => setLoading(true)}>
        重新走一遍
      </button>
      <MultiStepLoader
        duration={duration}
        loading={loading}
        loop={loop}
        steps={steps}
        title={title}
        onClose={() => setLoading(false)}
        onComplete={() => setLoading(false)}
      />
    </div>
  )
}

export function StatefulButtonDemo({
  resetAfter = 2000,
  successText = "完成",
  errorText = "失败",
}: { resetAfter?: number; successText?: string; errorText?: string } = {}) {
  return (
    <StatefulButton
      errorText={errorText}
      resetAfter={resetAfter}
      successText={successText}
      onClick={() => new Promise((resolve) => window.setTimeout(resolve, 700))}
    >
      保存更改
    </StatefulButton>
  )
}

export function TweetCardDemo({
  name = "林夏",
  handle = "linxia",
  time = "2小时",
}: { name?: string; handle?: string; time?: string } = {}) {
  return (
    <TweetCard avatar={portrait} content="这条卡片只渲染传入的文字和头像，不会去请求时间线。" handle={handle} name={name} time={time} verified />
  )
}

export function NeoStarShapesDemo({
  color = "#05e17a",
  shape = 1,
  size = 72,
}: { color?: string; shape?: number; size?: number } = {}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[#05e17a]">
      <NeoStarShapes color={color} shape={shape} size={size} stroke="#111111" strokeWidth={3} />
      <NeoStarShapes color="#05e17a" shape={19} size={72} stroke="#111111" strokeWidth={3} />
      <NeoStarShapes color="#05e17a" shape={32} size={72} stroke="#111111" strokeWidth={3} />
    </div>
  )
}

export function CaptionImageCardDemo({
  imageUrl = scene,
  caption = "现场记下的颜色",
  alt = "一块绿色底板和黑色圆点",
}: { imageUrl?: string; caption?: string; alt?: string } = {}) {
  return <CaptionImageCard alt={alt} caption={caption} imageUrl={imageUrl} />
}
