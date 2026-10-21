"use client"

import { AppleActivityCard } from "../effects/apple-activity-card"
import { AppleCardsCarousel } from "../effects/apple-cards-carousel"
import { BookFlip } from "../effects/book-flip"
import { BoxCarousel } from "../effects/box-carousel"
import { CoverflowCarousel } from "../effects/coverflow-carousel"
import { DetentDial } from "../effects/detent-dial"
import { FamilyDrawer } from "../effects/family-drawer"
import { FolderReveal } from "../effects/folder-reveal"
import { OrbitingItems3D } from "../effects/orbiting-items-3d"
import { TextMorph } from "../effects/text-morph"
import { AgencyTemplate } from "../templates/agency/page"
import { AiProductTemplate } from "../templates/ai-product/page"
import { DevtoolTemplate } from "../templates/devtool/page"
import { PortfolioTemplate } from "../templates/portfolio/page"
import { SaasTemplate } from "../templates/saas/page"

export function CoverflowCarouselDemo({ angle, scale, speed }: { angle?: number; scale?: number; speed?: number } = {}) {
  return <CoverflowCarousel className="max-w-xl" angle={angle} scale={scale} speed={speed} />
}

export function BookFlipDemo({ angle, speed, colors }: { angle?: number; speed?: number; colors?: string[] } = {}) {
  return <BookFlip angle={angle} speed={speed} colors={colors} />
}

export function FolderRevealDemo({ duration, angle, intensity }: { duration?: number; angle?: number; intensity?: number } = {}) {
  return <FolderReveal duration={duration} angle={angle} intensity={intensity} />
}

export function BoxCarouselDemo({ speed, size }: { speed?: number; size?: number } = {}) {
  return <BoxCarousel speed={speed} size={size} />
}

export function DetentDialDemo() {
  return <DetentDial />
}

export function FamilyDrawerDemo() {
  return <FamilyDrawer className="max-w-sm" />
}

export function TextMorphDemo({
  interval = 1800,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  interval?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
} = {}) {
  return (
    <TextMorph
      texts={["Design", "Delight"]}
      className="font-display text-5xl"
      interval={interval}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

export function OrbitingItems3DDemo({ speed, size }: { speed?: number; size?: number } = {}) {
  return <OrbitingItems3D speed={speed} size={size} />
}

export function AppleActivityCardDemo({ size, duration }: { size?: number; duration?: number } = {}) {
  return <AppleActivityCard size={size} duration={duration} />
}

export function AppleCardsCarouselDemo({ gap, size, intensity }: { gap?: number; size?: number; intensity?: number } = {}) {
  return <AppleCardsCarousel gap={gap} size={size} intensity={intensity} />
}

export function SaasTemplateDemo() {
  return <SaasTemplate />
}

export function AiProductTemplateDemo() {
  return <AiProductTemplate />
}

export function DevtoolTemplateDemo() {
  return <DevtoolTemplate />
}

export function PortfolioTemplateDemo() {
  return <PortfolioTemplate />
}

export function AgencyTemplateDemo() {
  return <AgencyTemplate />
}
