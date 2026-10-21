"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface PixelCanvasCardProps {
  className?: string
  colors?: string[]
  gap?: number
  speed?: number
  children?: React.ReactNode
}

class Pixel {
  x: number
  y: number
  color: string
  speed: number
  size = 0
  sizeStep = Math.random() * 0.4
  minSize = 0.5
  maxSize: number
  delay: number
  counter = 0
  counterStep: number
  isIdle = false
  isReverse = false
  isShimmer = false

  constructor(width: number, height: number, x: number, y: number, color: string, speed: number, delay: number) {
    this.x = x
    this.y = y
    this.color = color
    this.speed = (Math.random() * 0.8 + 0.1) * speed
    this.maxSize = Math.random() * 1.5 + 0.5
    this.delay = delay
    this.counterStep = Math.random() * 4 + (width + height) * 0.01
  }

  draw(ctx: CanvasRenderingContext2D) {
    const offset = 1 - this.size * 0.5
    ctx.fillStyle = this.color
    ctx.fillRect(this.x + offset, this.y + offset, this.size, this.size)
  }

  appear(ctx: CanvasRenderingContext2D) {
    this.isIdle = false
    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }
    if (this.size >= this.maxSize) this.isShimmer = true
    if (this.isShimmer) this.shimmer()
    else this.size += this.sizeStep
    this.draw(ctx)
  }

  disappear(ctx: CanvasRenderingContext2D) {
    this.isShimmer = false
    this.counter = 0
    if (this.size <= 0) {
      this.isIdle = true
      return
    }
    this.size -= 0.1
    this.draw(ctx)
  }

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) this.isReverse = false
    this.size += this.isReverse ? -this.speed : this.speed
  }
}

function PixelCanvasCard({
  className,
  colors = ["#e0f2fe", "#7dd3fc", "#0ea5e9"],
  gap = 6,
  speed = 35,
  children,
}: PixelCanvasCardProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(canvasRef)
  const pixels = React.useRef<Pixel[]>([])
  const mode = React.useRef<"appear" | "disappear" | null>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const clampedGap = Math.min(50, Math.max(4, gap))
    const pixelSpeed = reduced ? 0 : Math.min(100, Math.max(0, speed)) * 0.001

    const init = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width)
      canvas.height = Math.floor(rect.height)
      pixels.current = []
      for (let x = 0; x < canvas.width; x += clampedGap) {
        for (let y = 0; y < canvas.height; y += clampedGap) {
          const color = colors[Math.floor(Math.random() * colors.length)] ?? "#e0f2fe"
          const delay = reduced ? 0 : Math.hypot(x - canvas.width / 2, y - canvas.height / 2)
          pixels.current.push(new Pixel(canvas.width, canvas.height, x, y, color, pixelSpeed, delay))
        }
      }
    }

    init()
    const observer = new ResizeObserver(init)
    observer.observe(canvas)
    if (!active) {
      return () => observer.disconnect()
    }
    let frame = 0
    const tick = () => {
      const current = mode.current
      if (current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        for (const pixel of pixels.current) pixel[current](ctx)
        if (pixels.current.every((pixel) => pixel.isIdle)) mode.current = null
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [colors, gap, speed, active])

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border bg-card", className)}
      onMouseEnter={() => {
        mode.current = "appear"
      }}
      onMouseLeave={() => {
        mode.current = "disappear"
      }}
      onFocus={() => {
        mode.current = "appear"
      }}
      onBlur={() => {
        mode.current = "disappear"
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="relative z-10 p-6">{children}</div>
    </div>
  )
}

export { PixelCanvasCard }
