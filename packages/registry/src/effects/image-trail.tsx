"use client"

/* eslint-disable @next/next/no-img-element -- registry 组件不能依赖 next/image */
import * as React from "react"

import { cn } from "@/lib/utils"

export interface ImageTrailProps {
  images: string[]
  className?: string
}

interface TrailPoint {
  id: number
  x: number
  y: number
  src: string
}

function ImageTrail({ images, className }: ImageTrailProps) {
  const [points, setPoints] = React.useState<TrailPoint[]>([])
  const last = React.useRef({ x: 0, y: 0, i: 0 })
  const id = React.useRef(0)

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const dx = x - last.current.x
        const dy = y - last.current.y
        if (Math.hypot(dx, dy) < 28) return
        last.current = { x, y, i: last.current.i + 1 }
        const next: TrailPoint = {
          id: (id.current += 1),
          x,
          y,
          src: images[last.current.i % images.length] ?? images[0] ?? "",
        }
        setPoints((prev) => [...prev.slice(-8), next])
      }}
    >
      {points.map((point) => (
        <img
          key={point.id}
          src={point.src}
          alt=""
          className="pointer-events-none absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-lg object-cover opacity-80 shadow"
          style={{ left: point.x, top: point.y }}
        />
      ))}
    </div>
  )
}

export { ImageTrail }
