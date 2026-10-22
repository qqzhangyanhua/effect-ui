"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/image.tsx. Modified for effect-ui.

import { useEffect, useState, type ImgHTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GeneratedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  alt: string
  base64?: string
  uint8Array?: Uint8Array
  mediaType?: string
}

export function GeneratedImage({ base64, uint8Array, mediaType = "image/png", className, alt, ...props }: GeneratedImageProps) {
  const reduced = usePrefersReducedMotion()
  const [objectUrl, setObjectUrl] = useState<string | undefined>()
  const base64Src = base64 ? `data:${mediaType};base64,${base64}` : undefined

  useEffect(() => {
    if (!uint8Array || base64Src) return
    const copy = new Uint8Array(uint8Array.byteLength)
    copy.set(uint8Array)
    const url = URL.createObjectURL(new Blob([copy], { type: mediaType }))
    const timer = window.setTimeout(() => setObjectUrl(url), 0)
    return () => {
      window.clearTimeout(timer)
      URL.revokeObjectURL(url)
    }
  }, [base64Src, mediaType, uint8Array])

  const src = base64Src ?? objectUrl
  if (!src) {
    return <div aria-label={alt} className={cn("h-24 max-w-full overflow-hidden rounded-md bg-muted", !reduced && "animate-pulse", className)} data-reduced={reduced ? "true" : "false"} data-slot="generated-image" role="img" />
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
    <img {...props} alt={alt} className={cn("h-auto max-w-full overflow-hidden rounded-md", className)} data-reduced={reduced ? "true" : "false"} data-slot="generated-image" role="img" src={src} />
  )
}
