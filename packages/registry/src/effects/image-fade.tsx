"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/effects/ImageFade.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ImgHTMLAttributes } from "react"

export type ImageFadeDirection = "left" | "right" | "up" | "down"

export interface ImageFadeProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  src: string
  alt: string
  direction?: ImageFadeDirection
  fadeSize?: number
}

const axis: Record<ImageFadeDirection, string> = {
  up: "to top",
  down: "to bottom",
  left: "to left",
  right: "to right",
}

export function ImageFade({ src, alt, direction = "up", fadeSize = 20, className, ...props }: ImageFadeProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const edge = Math.min(100, Math.max(0, fadeSize))
  const mask = prefersReducedMotion ? undefined : `linear-gradient(${axis[direction]}, transparent, black ${edge}%)`

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt}
      className={cn("h-auto w-full rounded-lg object-cover", className)}
      data-direction={direction}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="image-fade"
      src={src}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask } : undefined}
    />
  )
}
