"use client"

import { useState } from "react"
import { FooterGiantWordmark } from "../sections/footer-giant-wordmark"
import { HeroAiPrompt } from "../sections/hero-ai-prompt"
import { HeroKineticText } from "../sections/hero-kinetic-text"
import { HeroParallaxWall } from "../sections/hero-parallax-wall"
import { HeroProductMockup } from "../sections/hero-product-mockup"
import { HeroShader, type HeroShaderBackground } from "../sections/hero-shader"
import { SectionAnimatedBento } from "../sections/section-animated-bento"
import { SectionLogoCloud } from "../sections/section-logo-cloud"

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

export function FooterGiantWordmarkDemo() {
  return <FooterGiantWordmark className="w-full" />
}

export function SectionLogoCloudDemo() {
  return <SectionLogoCloud className="w-full" />
}

export function SectionAnimatedBentoDemo() {
  return <SectionAnimatedBento className="w-full" />
}
