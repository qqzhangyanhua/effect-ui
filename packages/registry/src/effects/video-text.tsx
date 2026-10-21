"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/video-text.tsx

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface VideoTextProps {
  src: string
  poster?: string
  children?: React.ReactNode
  fontSize?: number
  fontWeight?: number
  className?: string
}

function VideoText({
  src,
  poster,
  children = "北窗",
  fontSize = 18,
  fontWeight = 700,
  className,
}: VideoTextProps) {
  const reduced = usePrefersReducedMotion()
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const content = React.Children.toArray(children).join("")
  const mask = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle' font-size='${fontSize}vw' font-weight='${fontWeight}' font-family='sans-serif'>${content}</text></svg>`,
  )}")`

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (reduced) {
      video.pause()
      return
    }
    void video.play().catch(() => undefined)
  }, [reduced, src])

  return (
    <div data-slot="video-text" className={cn("relative h-48 w-full overflow-hidden rounded-xl bg-muted", className)}>
      <div
        className="absolute inset-0"
        style={{
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      >
        {reduced && poster ? (
          <img src={poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            autoPlay={!reduced}
          />
        )}
      </div>
      <span className="sr-only">{content}</span>
    </div>
  )
}

export { VideoText }
