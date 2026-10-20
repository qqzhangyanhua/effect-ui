"use client"

import * as React from "react"

import { FooterCurtainReveal } from "@/components/ui/footer-curtain-reveal"
import { MarketingTestimonials } from "@/components/ui/marketing-blocks"
import { NavMorphing } from "@/components/ui/nav-morphing"
import { SectionAnimatedBento } from "@/components/ui/section-animated-bento"
import { SectionLogoCloud } from "@/components/ui/section-logo-cloud"
import { SectionPricingFlow } from "@/components/ui/section-pricing-flow"
import { SectionStickyFeatureScroll } from "@/components/ui/section-sticky-feature-scroll"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { saasContent } from "./content"
import { saasTheme } from "./theme"

const HeroShader = React.lazy(() =>
  import("@/components/ui/hero-shader").then((mod) => ({ default: mod.HeroShader })),
)

function StaticHero() {
  return (
    <section className="grid min-h-[24rem] place-items-center bg-[linear-gradient(135deg,#1e1b4b,#312e81,#0f172a)] px-6 text-center text-white">
      <div>
        <h1 className="font-display text-4xl">{saasContent.heroTitle}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70">{saasContent.heroSubtitle}</p>
      </div>
    </section>
  )
}

function SaasTemplate() {
  const reduced = usePrefersReducedMotion()

  return (
    <div style={saasTheme} className="bg-background text-foreground">
      <FooterCurtainReveal brand={saasContent.brand} blurb={saasContent.heroSubtitle}>
        <NavMorphing brand={saasContent.brand} links={["产品", "定价", "客户", "文档"]} />
        {reduced ? (
          <StaticHero />
        ) : (
          <React.Suspense fallback={<StaticHero />}>
            <HeroShader title={saasContent.heroTitle} subtitle={saasContent.heroSubtitle} backgroundVariant="mesh" />
          </React.Suspense>
        )}
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-10">
          <SectionLogoCloud />
          <SectionAnimatedBento />
          <SectionStickyFeatureScroll />
          <SectionPricingFlow />
          <MarketingTestimonials />
        </div>
      </FooterCurtainReveal>
    </div>
  )
}

export { SaasTemplate }
