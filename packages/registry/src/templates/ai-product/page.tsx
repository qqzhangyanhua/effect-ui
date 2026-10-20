"use client"

import * as React from "react"

import { ChatMessage } from "@/components/ui/chat-message"
import { FooterGiantWordmark } from "@/components/ui/footer-giant-wordmark"
import { HeroAiPrompt } from "@/components/ui/hero-ai-prompt"
import { SectionPricingFlow } from "@/components/ui/section-pricing-flow"
import { ShimmerText } from "@/components/ui/shimmer-text"
import { SiriOrb } from "@/components/ui/siri-orb"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

import { aiContent } from "./content"
import { aiTheme } from "./theme"

const Iridescence = React.lazy(() =>
  import("@/components/ui/iridescence").then((mod) => ({ default: mod.Iridescence })),
)

function AiProductTemplate() {
  const reduced = usePrefersReducedMotion()

  return (
    <div style={aiTheme} className="bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          {reduced ? (
            <div className="size-full bg-[linear-gradient(160deg,#312e81,#111827)]" />
          ) : (
            <React.Suspense fallback={<div className="size-full bg-[linear-gradient(160deg,#312e81,#111827)]" />}>
              <Iridescence className="min-h-full rounded-none" />
            </React.Suspense>
          )}
        </div>
        <HeroAiPrompt backdrop={false} title={aiContent.title} subtitle={aiContent.subtitle} className="relative border-0 bg-transparent" />
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3 rounded-2xl border p-4">
          {aiContent.messages.map((message) => (
            <ChatMessage key={message.content} role={message.role} content={message.content} />
          ))}
          <ShimmerText>正在组织界面…</ShimmerText>
        </div>
        <div className="grid place-items-center rounded-2xl border p-6">
          <SiriOrb />
          <p className="mt-3 text-sm text-muted-foreground">语音能力用现有光球演示。</p>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <SectionPricingFlow />
      </div>
      <FooterGiantWordmark word="northwind" />
    </div>
  )
}

export { AiProductTemplate }
