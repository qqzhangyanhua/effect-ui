"use client"

import { BlurFade } from "../effects/blur-fade"
import { FadeIn } from "../effects/fade-in"
import { Parallax } from "../effects/parallax"
import { SlideIn } from "../effects/slide-in"
import { StaggerList } from "../effects/stagger-list"

export function FadeInDemo() {
  return (
    <FadeIn className="rounded-xl border bg-card p-6">
      滚动到这里时淡入
    </FadeIn>
  )
}

export function SlideInDemo() {
  return (
    <div className="flex gap-4">
      <SlideIn from="left" className="rounded-xl border bg-card p-4">
        从左滑入
      </SlideIn>
      <SlideIn from="right" delay={0.1} className="rounded-xl border bg-card p-4">
        从右滑入
      </SlideIn>
    </div>
  )
}

export function StaggerListDemo() {
  return (
    <StaggerList className="w-full max-w-sm">
      <div className="rounded-lg border bg-card px-3 py-2">第一项</div>
      <div className="rounded-lg border bg-card px-3 py-2">第二项</div>
      <div className="rounded-lg border bg-card px-3 py-2">第三项</div>
    </StaggerList>
  )
}

export function ParallaxDemo() {
  return (
    <div className="h-40 w-full overflow-auto rounded-xl border">
      <div className="flex h-80 items-center justify-center bg-muted/40">
        <Parallax offset={40}>
          <p className="text-lg font-medium">滚动这块区域看视差</p>
        </Parallax>
      </div>
    </div>
  )
}

export function BlurFadeDemo() {
  return (
    <BlurFade className="rounded-xl border bg-card p-6">
      从模糊到清晰
    </BlurFade>
  )
}
