"use client"

// Ported from Neobrutalism components (MIT, (c) 2023 Samuel Breznjak) — https://github.com/ekmas/neobrutalism-components/blob/main/src/components/ui/image-card.tsx. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CaptionImageCardProps extends HTMLAttributes<HTMLElement> {
  imageUrl: string
  caption: string
  alt?: string
}

export function CaptionImageCard({ imageUrl, caption, alt, className, ...props }: CaptionImageCardProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)

  return (
    <figure
      {...props}
      ref={ref}
      data-slot="caption-image-card"
      data-reduced={reduced ? "true" : "false"}
      data-motion={motionOn && !reduced ? "on" : "off"}
      className={cn(
        "w-[250px] overflow-hidden rounded-[5px] border-2 border-border bg-background text-foreground shadow-[4px_4px_0_0_var(--border)]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image */}
      <img className="aspect-4/3 w-full object-cover" src={imageUrl} alt={alt ?? caption} />
      <figcaption className="border-t-2 border-border p-4">{caption}</figcaption>
    </figure>
  )
}
