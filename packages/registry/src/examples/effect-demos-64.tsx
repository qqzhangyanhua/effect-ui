"use client"

import { FlipRevealCard } from "../effects/flip-reveal-card"
import { HoverLiftGlow } from "../effects/hover-lift-glow"
import { HoverOverlayReveal } from "../effects/hover-overlay-reveal"
import { PointerTiltGlare } from "../effects/pointer-tilt-glare"
import { StaggerCardGrid } from "../effects/stagger-card-grid"
import { TwistInCard } from "../effects/twist-in-card"

const frame = "flex min-h-80 w-full items-center justify-center px-6 py-10"

const places = [
  { name: "清晨", note: "谷底还有雾" },
  { name: "午后", note: "山脊开始亮" },
  { name: "黄昏", note: "影子拉得很长" },
  { name: "海岸", note: "风从左边来" },
  { name: "城墙", note: "砖是暖的" },
  { name: "车站", note: "末班还没走" },
]

export function TwistInCardDemo({
  pace = 1,
  intensity = 1,
  delay = 0,
}: {
  pace?: number
  intensity?: number
  delay?: number
} = {}) {
  return (
    <div className={frame}>
      <TwistInCard pace={pace} intensity={intensity} delay={delay} className="max-w-sm p-6">
        <p className="text-xs tracking-[0.18em] text-muted-foreground">行程</p>
        <p className="mt-2 font-display text-3xl tracking-tight">山脊路线</p>
        <p className="mt-3 text-sm text-muted-foreground">卡片从缩小、微微侧转和下移，一起回到正体。</p>
      </TwistInCard>
    </div>
  )
}

export function StaggerCardGridDemo({
  pace = 1,
  stagger = 0.08,
  intensity = 1,
  columns = 3,
}: {
  pace?: number
  stagger?: number
  intensity?: number
  columns?: number
} = {}) {
  return (
    <div className="w-full px-6 py-10">
      <StaggerCardGrid pace={pace} stagger={stagger} intensity={intensity} columns={columns}>
        {places.map((place) => (
          <div key={place.name} className="p-4">
            <div className="mb-4 h-16 rounded-lg bg-primary/15" />
            <p className="font-medium">{place.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{place.note}</p>
          </div>
        ))}
      </StaggerCardGrid>
    </div>
  )
}

export function HoverLiftGlowDemo({
  lift = 8,
  glow = 1,
  duration = 280,
}: {
  lift?: number
  glow?: number
  duration?: number
} = {}) {
  return (
    <div className={frame}>
      <HoverLiftGlow lift={lift} glow={glow} duration={duration} className="max-w-sm p-6">
        <p className="text-xs tracking-[0.18em] text-muted-foreground">会员</p>
        <p className="mt-2 font-display text-3xl tracking-tight">把卡片抬起来</p>
        <p className="mt-3 text-sm text-muted-foreground">细指针悬停或聚焦时抬起，并亮起一圈主题色。粗指针改为按下时轻轻缩放。</p>
        <button type="button" className="mt-5 rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          了解方案
        </button>
      </HoverLiftGlow>
    </div>
  )
}

export function FlipRevealCardDemo({
  duration = 560,
  perspective = 1100,
  axis = "y",
}: {
  duration?: number
  perspective?: number
  axis?: "x" | "y"
} = {}) {
  return (
    <div className={frame}>
      <FlipRevealCard
        duration={duration}
        perspective={perspective}
        axis={axis}
        front={
          <div>
            <p className="font-display text-3xl tracking-tight">本周菜单</p>
            <p className="mt-2 text-sm text-muted-foreground">点一下，或按 Enter、Space。</p>
          </div>
        }
        back={
          <div>
            <p className="font-display text-3xl tracking-tight">芝麻叶</p>
            <p className="mt-2 text-sm text-muted-foreground">柑橘、烤南瓜、烤芝麻。</p>
          </div>
        }
      />
    </div>
  )
}

export function HoverOverlayRevealDemo({
  overlayOpacity = 0.55,
  duration = 320,
  from = "bottom",
}: {
  overlayOpacity?: number
  duration?: number
  from?: "bottom" | "center"
} = {}) {
  return (
    <div className={frame}>
      <HoverOverlayReveal
        overlayOpacity={overlayOpacity}
        duration={duration}
        from={from}
        title="田野站点"
        action="预约参观"
        href="#visit"
        className="w-full max-w-md"
      />
    </div>
  )
}

export function PointerTiltGlareDemo({
  maxTilt = 12,
  glare = 0.55,
  speed = 1,
}: {
  maxTilt?: number
  glare?: number
  speed?: number
} = {}) {
  return (
    <div className={frame}>
      <PointerTiltGlare maxTilt={maxTilt} glare={glare} speed={speed} className="w-full max-w-sm p-6">
        <p className="text-xs tracking-[0.18em] text-muted-foreground">货架</p>
        <p className="mt-2 font-display text-3xl tracking-tight">新季</p>
        <p className="mt-3 text-sm text-muted-foreground">指针带动倾斜，眩光跟着走。粗指针和减弱动效都保持平放。</p>
      </PointerTiltGlare>
    </div>
  )
}
