"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/pixel-image.tsx

import { useEffect, useMemo, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PixelImageProps {
  src: string
  rows?: number
  cols?: number
  duration?: number
  delay?: number
  className?: string
}

function unit(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function PixelImage({ src, rows = 4, cols = 6, duration = 0.8, delay = 1.1, className }: PixelImageProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(rootRef)
  const [visible, setVisible] = useState(false)
  const [colored, setColored] = useState(reduced)
  const safeRows = Math.min(16, Math.max(1, Math.round(rows)))
  const safeCols = Math.min(16, Math.max(1, Math.round(cols)))

  const pieces = useMemo(
    () =>
      Array.from({ length: safeRows * safeCols }, (_, index) => {
        const row = Math.floor(index / safeCols)
        const col = index % safeCols
        return {
          delay: unit(index) * duration,
          clipPath: `polygon(${col * (100 / safeCols)}% ${row * (100 / safeRows)}%, ${(col + 1) * (100 / safeCols)}% ${row * (100 / safeRows)}%, ${(col + 1) * (100 / safeCols)}% ${(row + 1) * (100 / safeRows)}%, ${col * (100 / safeCols)}% ${(row + 1) * (100 / safeRows)}%)`,
        }
      }),
    [safeRows, safeCols, duration],
  )

  useEffect(() => {
    if (reduced || !active) return
    const frame = window.requestAnimationFrame(() => setVisible(true))
    const timer = window.setTimeout(() => setColored(true), delay * 1000)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [reduced, active, delay])

  if (reduced) {
    return (
      <div ref={rootRef} data-slot="pixel-image" data-reduced="true" className={cn("relative h-64 w-full overflow-hidden", className)}>
        <img src={src} alt="" className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div ref={rootRef} data-slot="pixel-image" data-reduced="false" className={cn("relative h-64 w-full overflow-hidden", className)}>
      {pieces.map((piece, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-opacity ease-out"
          style={{
            clipPath: piece.clipPath,
            opacity: visible ? 1 : 0,
            transitionDuration: `${duration}s`,
            transitionDelay: `${piece.delay}s`,
          }}
        >
          <img src={src} alt="" className={cn("size-full object-cover", colored ? "grayscale-0" : "grayscale")} style={{ transition: `filter ${duration}s ease` }} />
        </div>
      ))}
    </div>
  )
}

export { PixelImage }
