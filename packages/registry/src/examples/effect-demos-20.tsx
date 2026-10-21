"use client"

import { BlurFade } from "../effects/blur-fade"
import { FadeIn } from "../effects/fade-in"
import { Parallax } from "../effects/parallax"
import { SlideIn } from "../effects/slide-in"
import { StaggerList } from "../effects/stagger-list"

export function FadeInDemo({
  delay = 0,
  once = true,
  speed,
  intensity,
}: {
  delay?: number
  once?: boolean
  speed?: number
  intensity?: number
} = {}) {
  return (
    <FadeIn className="rounded-xl border bg-card p-6" delay={delay} once={once} speed={speed} intensity={intensity}>
      滚动到这里时淡入
    </FadeIn>
  )
}

export function SlideInDemo({
  from = "bottom",
  delay = 0,
  speed,
  intensity,
}: {
  from?: "left" | "right" | "top" | "bottom"
  delay?: number
  speed?: number
  intensity?: number
} = {}) {
  return (
    <SlideIn from={from} delay={delay} speed={speed} intensity={intensity} className="rounded-xl border bg-card p-4">
      滑入
    </SlideIn>
  )
}

export function StaggerListDemo({
  delay = 0,
  speed,
  intensity,
  gap,
}: {
  delay?: number
  speed?: number
  intensity?: number
  gap?: number
} = {}) {
  return (
    <StaggerList className="w-full max-w-sm" delay={delay} speed={speed} intensity={intensity} gap={gap}>
      <div className="rounded-lg border bg-card px-3 py-2">第一项</div>
      <div className="rounded-lg border bg-card px-3 py-2">第二项</div>
      <div className="rounded-lg border bg-card px-3 py-2">第三项</div>
    </StaggerList>
  )
}

export function ParallaxDemo({
  offset = 40,
  speed,
  intensity,
  scale,
}: {
  offset?: number
  speed?: number
  intensity?: number
  scale?: number
} = {}) {
  return (
    <div className="h-40 w-full overflow-auto rounded-xl border">
      <div className="flex h-80 items-center justify-center bg-muted/40">
        <Parallax offset={offset} speed={speed} intensity={intensity} scale={scale}>
          <p className="text-lg font-medium">滚动这块区域看视差</p>
        </Parallax>
      </div>
    </div>
  )
}

export function BlurFadeDemo({
  delay = 0,
  blur = 8,
  speed,
  intensity,
}: {
  delay?: number
  blur?: number
  speed?: number
  intensity?: number
} = {}) {
  return (
    <BlurFade className="rounded-xl border bg-card p-6" delay={delay} blur={blur} speed={speed} intensity={intensity}>
      从模糊到清晰
    </BlurFade>
  )
}
