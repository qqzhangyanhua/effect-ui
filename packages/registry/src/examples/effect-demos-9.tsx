"use client"

import { AppleCardsCarousel } from "../effects/apple-cards-carousel"
import { AgencyTemplate } from "../templates/agency/page"

export function AppleCardsCarouselDemo({ gap, size, intensity }: { gap?: number; size?: number; intensity?: number } = {}) {
  return <AppleCardsCarousel gap={gap} size={size} intensity={intensity} />
}

export function AgencyTemplateDemo() {
  return <AgencyTemplate />
}
