"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FlickeringGridProps extends React.HTMLAttributes<HTMLCanvasElement> {
  squareSize?: number
  gridGap?: number
  flickerChance?: number
  color?: string
  maxOpacity?: number
}

function FlickeringGrid({
  className,
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.18,
  color = "var(--foreground)",
  maxOpacity = 0.28,
  ...props
}: FlickeringGridProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0

    const paint = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      ctx.clearRect(0, 0, width, height)
      const step = squareSize + gridGap
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          if (Math.random() > flickerChance) continue
          ctx.globalAlpha = Math.random() * maxOpacity
          ctx.fillStyle = color
          ctx.fillRect(x, y, squareSize, squareSize)
        }
      }
      frame = window.requestAnimationFrame(paint)
    }

    paint()
    return () => window.cancelAnimationFrame(frame)
  }, [color, flickerChance, gridGap, maxOpacity, squareSize])

  return (
    <canvas
      ref={canvasRef}
      data-slot="flickering-grid"
      className={cn("pointer-events-none absolute inset-0 size-full", className)}
      {...props}
    />
  )
}

export { FlickeringGrid }
