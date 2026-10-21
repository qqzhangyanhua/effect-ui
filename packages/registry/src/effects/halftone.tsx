"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface HalftoneProps {
  gap?: number
  color?: string
  intensity?: number
  size?: number
  className?: string
}

function halftoneFill(color: string | undefined, intensity: number) {
  if (color === undefined && intensity === 0.55) {
    return "color-mix(in oklab, var(--foreground) 55%, transparent)"
  }
  const percent = Math.round(intensity * 100)
  return `color-mix(in oklab, ${color ?? "var(--foreground)"} ${percent}%, transparent)`
}

function Halftone({ gap = 14, color, intensity = 0.55, size = 180, className }: HalftoneProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const mouse = React.useRef({ x: 0.5, y: 0.5 })

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const paint = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const mx = mouse.current.x * width
      const my = mouse.current.y * height
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          const dist = Math.hypot(x - mx, y - my)
          const radius = Math.max(1.1, (1 - Math.min(dist / size, 1)) * (gap * 0.42) + 1.2)
          ctx.beginPath()
          ctx.fillStyle = halftoneFill(color, intensity)
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    paint()
    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      }
      paint()
    }
    window.addEventListener("resize", paint)
    canvas.addEventListener("mousemove", onMove)
    return () => {
      window.removeEventListener("resize", paint)
      canvas.removeEventListener("mousemove", onMove)
    }
  }, [color, gap, intensity, size])

  return <canvas ref={canvasRef} className={cn("size-full min-h-48 rounded-xl border bg-background", className)} />
}

export { Halftone }
