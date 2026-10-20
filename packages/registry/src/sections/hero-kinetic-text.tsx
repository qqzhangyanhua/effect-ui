"use client"

import { Button } from "@/components/ui/button"
import { RoughAnnotation } from "@/components/ui/rough-annotation"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { SplitText } from "@/components/ui/split-text"
import { WordRotate } from "@/components/ui/word-rotate"
import { cn } from "@/lib/utils"

export interface HeroKineticTextProps {
  lead?: string
  words?: string[]
  annotation?: string
  subtitle?: string
  className?: string
}

function HeroKineticText({
  lead = "Interfaces that",
  words = ["move", "delight", "convert", "ship"],
  annotation = "hand-drawn",
  subtitle = "词组逐词显现，关键词轮换，再用 rough-annotation 圈出重点。",
  className,
}: HeroKineticTextProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_48%)] px-6 py-20",
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Hero Kinetic</p>
        <h2 className="font-display flex flex-wrap items-baseline justify-center gap-x-3 text-4xl tracking-tight sm:text-6xl">
          <SplitText text={lead} by="word" className="justify-center gap-x-2" />
          <WordRotate words={words} className="text-primary" />
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {subtitle} Try the{" "}
          <RoughAnnotation type="circle" color="var(--primary)">
            {annotation}
          </RoughAnnotation>{" "}
          mark.
        </p>
        <div className="flex gap-2">
          <ShimmerButton>开始构建</ShimmerButton>
          <Button variant="ghost">示例</Button>
        </div>
      </div>
    </section>
  )
}

export { HeroKineticText }
