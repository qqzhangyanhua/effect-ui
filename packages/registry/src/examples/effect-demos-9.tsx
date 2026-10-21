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

export function CoverflowCarouselDemo() {
  return <CoverflowCarousel className="max-w-xl" />
}

export function BookFlipDemo() {
  return <BookFlip />
}

export function FolderRevealDemo() {
  return <FolderReveal />
}

export function BoxCarouselDemo() {
  return <BoxCarousel />
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

export function OrbitingItems3DDemo() {
  return <OrbitingItems3D />
}

export function AppleActivityCardDemo() {
  return <AppleActivityCard />
}

export function AppleCardsCarouselDemo() {
  return <AppleCardsCarousel />
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
