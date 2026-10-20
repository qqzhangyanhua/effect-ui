"use client"

import { useState } from "react"

import { FooterCurtainReveal } from "../sections/footer-curtain-reveal"
import { FooterGiantWordmark } from "../sections/footer-giant-wordmark"
import { FooterInteractiveWordmark } from "../sections/footer-interactive-wordmark"
import { FooterShaderWordmark } from "../sections/footer-shader-wordmark"
import { HeroAiPrompt } from "../sections/hero-ai-prompt"
import { HeroGlobe } from "../sections/hero-globe"
import { HeroKineticText } from "../sections/hero-kinetic-text"
import { HeroParallaxWall } from "../sections/hero-parallax-wall"
import { HeroProductMockup } from "../sections/hero-product-mockup"
import { HeroShader, type HeroShaderBackground } from "../sections/hero-shader"
import { NavMorphing } from "../sections/nav-morphing"
import { SectionAnimatedBento } from "../sections/section-animated-bento"
import { SectionLogoCloud } from "../sections/section-logo-cloud"
import { SectionPricingFlow } from "../sections/section-pricing-flow"
import { SectionStickyFeatureScroll } from "../sections/section-sticky-feature-scroll"

const shaderVariants: HeroShaderBackground[] = ["silk", "iridescence", "lightning", "mesh", "aurora"]

export function HeroShaderDemo() {
  const [variant, setVariant] = useState<HeroShaderBackground>("silk")
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap justify-center gap-2">
        {shaderVariants.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setVariant(item)}
            className={
              item === variant
                ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                : "rounded-full border px-3 py-1 text-xs"
            }
          >
            {item}
          </button>
        ))}
      </div>
      <HeroShader backgroundVariant={variant} className="w-full" />
    </div>
  )
}

export function HeroGlobeDemo() {
  return <HeroGlobe className="w-full" />
}

export function HeroProductMockupDemo() {
  return <HeroProductMockup className="w-full" />
}

export function HeroKineticTextDemo() {
  return <HeroKineticText className="w-full" />
}

export function HeroAiPromptDemo() {
  return <HeroAiPrompt className="w-full" />
}

export function HeroParallaxWallDemo() {
  return <HeroParallaxWall className="w-full" />
}

export function FooterCurtainRevealDemo() {
  return (
    <div className="h-80 w-full overflow-auto rounded-xl border">
      <FooterCurtainReveal>
        <div className="space-y-3 px-6 py-16">
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">Scroll the pane</p>
          <p className="font-display text-2xl">向下滚，页脚会像幕布一样露出来。</p>
          <div className="h-40 rounded-xl border bg-muted/40" />
          <div className="h-40 rounded-xl border bg-muted/20" />
        </div>
      </FooterCurtainReveal>
    </div>
  )
}

export function FooterGiantWordmarkDemo() {
  return <FooterGiantWordmark className="w-full" />
}

export function FooterInteractiveWordmarkDemo() {
  return <FooterInteractiveWordmark className="w-full" />
}

export function FooterShaderWordmarkDemo() {
  return <FooterShaderWordmark className="w-full" />
}

export function NavMorphingDemo() {
  return (
    <div className="h-80 w-full overflow-auto rounded-xl border">
      <NavMorphing className="rounded-none border-0" />
      <div className="space-y-3 px-6 pb-10">
        <div className="h-32 rounded-xl border bg-muted/30" />
        <div className="h-32 rounded-xl border bg-muted/20" />
      </div>
    </div>
  )
}

export function SectionLogoCloudDemo() {
  return <SectionLogoCloud className="w-full" />
}

export function SectionStickyFeatureScrollDemo() {
  return (
    <div className="h-[32rem] w-full overflow-auto rounded-xl border">
      <SectionStickyFeatureScroll className="rounded-none border-0" />
    </div>
  )
}

export function SectionAnimatedBentoDemo() {
  return <SectionAnimatedBento className="w-full" />
}

export function SectionPricingFlowDemo() {
  return <SectionPricingFlow className="w-full" />
}
