"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */
import * as React from "react"

import { cn } from "@/lib/utils"

export interface ImageTrailProps {
  images: string[]
  className?: string
  gap?: number
  count?: number
  size?: number
  intensity?: number
}

interface TrailPoint {
  id: number
  x: number
  y: number
  src: string
}

function ImageTrail({ images, className, gap, count, size, intensity }: ImageTrailProps) {
  const [points, setPoints] = React.useState<TrailPoint[]>([])
  const last = React.useRef({ x: 0, y: 0, i: 0 })
  const id = React.useRef(0)
  const threshold = gap === undefined ? 28 : gap
  const keep = count === undefined ? 8 : count
  const keepSize = size === undefined || size === 64
  const keepOpacity = intensity === undefined || intensity === 0.8

  return (
    <div
      data-slot="image-trail"
      className={cn("relative overflow-hidden", className)}
      onPointerMove={(event) => {
        const media = window.matchMedia
        if (media("(prefers-reduced-motion: reduce)").matches || media("(pointer: coarse)").matches) return
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const dx = x - last.current.x
        const dy = y - last.current.y
        if (Math.hypot(dx, dy) < threshold) return
        last.current = { x, y, i: last.current.i + 1 }
        const next: TrailPoint = {
          id: (id.current += 1),
          x,
          y,
          src: images[last.current.i % images.length] ?? images[0] ?? "",
        }
        setPoints((prev) => [...prev.slice(-keep), next])
      }}
    >
      {points.map((point) => (
        <img
          key={point.id}
          src={point.src}
          alt=""
          className={cn(
            "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-lg object-cover shadow",
            keepSize && "size-16",
            keepOpacity && "opacity-80",
          )}
          style={{
            left: point.x,
            top: point.y,
            width: keepSize ? undefined : size,
            height: keepSize ? undefined : size,
            opacity: keepOpacity ? undefined : intensity,
          }}
        />
      ))}
    </div>
  )
}

export { ImageTrail }
