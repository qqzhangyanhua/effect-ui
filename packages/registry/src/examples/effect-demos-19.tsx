"use client"

import { AudioSpectrum } from "../effects/audio-spectrum"
import { CartDrawer } from "../effects/cart-drawer"
import { CouponInput } from "../effects/coupon-input"
import { CreditCardForm } from "../effects/credit-card-form"
import { FunnelChart } from "../effects/funnel-chart"
import { GradientCarousel3d } from "../effects/gradient-carousel-3d"
import { LiquidMorphSlideshow } from "../effects/liquid-morph-slideshow"
import { RadialGauge } from "../effects/radial-gauge"
import { RollingTextHover } from "../effects/rolling-text-hover"
import { Singularity } from "../effects/singularity"
import { Text3dScroll } from "../effects/text-3d-scroll"
import { TubesCursor } from "../effects/tubes-cursor"
import { WavefieldNeon } from "../effects/wavefield-neon"
import { GanttTimeline } from "../sections/gantt-timeline"
import { OrgChart } from "../sections/org-chart"

export function TubesCursorDemo() {
  return <TubesCursor className="w-full" />
}

export function LiquidMorphSlideshowDemo() {
  return <LiquidMorphSlideshow className="w-full" />
}

export function WavefieldNeonDemo() {
  return <WavefieldNeon className="w-full" />
}

export function GradientCarousel3dDemo() {
  return <GradientCarousel3d className="w-full" />
}

export function Text3dScrollDemo() {
  return <Text3dScroll className="w-full" />
}

export function RollingTextHoverDemo() {
  return <RollingTextHover />
}

export function AudioSpectrumDemo() {
  return <AudioSpectrum className="w-full" />
}

export function SingularityDemo() {
  return <Singularity className="w-full" />
}

export function CreditCardFormDemo() {
  return <CreditCardForm />
}

export function CartDrawerDemo() {
  return <CartDrawer className="w-full" />
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

export function RadialGaugeDemo() {
  return <RadialGauge value={64} thresholds={[80]} />
}

export function FunnelChartDemo() {
  return <FunnelChart />
}

export function GanttTimelineDemo() {
  return <GanttTimeline className="w-full" />
}

export function OrgChartDemo() {
  return <OrgChart className="w-full" />
}
