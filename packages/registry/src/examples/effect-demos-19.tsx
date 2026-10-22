"use client"

import { AudioSpectrum } from "../effects/audio-spectrum"
import { CouponInput } from "../effects/coupon-input"
import { CreditCardForm } from "../effects/credit-card-form"
import { GradientCarousel3d } from "../effects/gradient-carousel-3d"
import { LiquidMorphSlideshow } from "../effects/liquid-morph-slideshow"
import { RollingTextHover } from "../effects/rolling-text-hover"
import { Singularity } from "../effects/singularity"
import { Text3dScroll } from "../effects/text-3d-scroll"
import { TubesCursor } from "../effects/tubes-cursor"
import { WavefieldNeon } from "../effects/wavefield-neon"
import { GanttTimeline } from "../sections/gantt-timeline"
import { OrgChart } from "../sections/org-chart"

export function TubesCursorDemo({
  tubes = 4,
  speed,
  intensity,
  scale,
}: {
  tubes?: number
  speed?: number
  intensity?: number
  scale?: number
} = {}) {
  return <TubesCursor className="w-full" tubes={tubes} speed={speed} intensity={intensity} scale={scale} />
}

export function LiquidMorphSlideshowDemo({ interval, intensity, speed }: { interval?: number; intensity?: number; speed?: number } = {}) {
  return <LiquidMorphSlideshow className="w-full" interval={interval} intensity={intensity} speed={speed} />
}

export function WavefieldNeonDemo({
  color = "#22d3ee",
  density = 18,
  amplitude = 0.28,
}: {
  color?: string
  density?: number
  amplitude?: number
} = {}) {
  return <WavefieldNeon className="w-full" color={color} density={density} amplitude={amplitude} />
}

export function GradientCarousel3dDemo({ speed, angle, scale, intensity }: { speed?: number; angle?: number; scale?: number; intensity?: number } = {}) {
  return <GradientCarousel3d className="w-full" speed={speed} angle={angle} scale={scale} intensity={intensity} />
}

export function Text3dScrollDemo({
  text = "把句子从平面里翻出来",
  angle,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  text?: string
  angle?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <Text3dScroll
      className="w-full"
      text={text}
      angle={angle}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function RollingTextHoverDemo({
  label = "开始使用",
  delay,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  label?: string
  delay?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <RollingTextHover
      label={label}
      delay={delay}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function AudioSpectrumDemo({ mode, size, color }: { mode?: "bars" | "circle" | "wave"; size?: number; color?: string } = {}) {
  return <AudioSpectrum className="w-full" mode={mode} size={size} color={color} />
}

export function SingularityDemo() {
  return <Singularity className="w-full" />
}

export function CreditCardFormDemo() {
  return <CreditCardForm />
}

export function CouponInputDemo() {
  return (
    <CouponInput
      validate={async (code) => {
        await new Promise((resolve) => setTimeout(resolve, 350))
        return code.trim().toUpperCase() === "NORTH"
          ? { ok: true, label: "北窗九折" }
          : { ok: false, message: "没有这张优惠券" }
      }}
    />
  )
}

export function GanttTimelineDemo() {
  return <GanttTimeline className="w-full" />
}

export function OrgChartDemo() {
  return <OrgChart className="w-full" />
}
