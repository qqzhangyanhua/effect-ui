"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FlowFieldProps {
  density?: number
  className?: string
}

interface Dot {
  x: number
  y: number
}

function FlowField({ density = 70, className }: FlowFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const dots: Dot[] = Array.from({ length: density }, () => {
      const { width, height } = canvas.getBoundingClientRect()
      return { x: Math.random() * width, y: Math.random() * height }
    })

    let frame = 0
    let time = 0
    const tick = () => {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.fillStyle = "color-mix(in oklab, var(--background) 18%, transparent)"
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = "color-mix(in oklab, var(--primary) 70%, transparent)"
      ctx.lineWidth = 1
      time += 0.006
      for (const dot of dots) {
        const angle = Math.sin(dot.x * 0.02 + time) + Math.cos(dot.y * 0.02 - time)
        const nx = dot.x + Math.cos(angle) * 1.6
        const ny = dot.y + Math.sin(angle) * 1.6
        ctx.beginPath()
        ctx.moveTo(dot.x, dot.y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        dot.x = nx
        dot.y = ny
        if (dot.x < 0 || dot.x > width || dot.y < 0 || dot.y > height) {
          dot.x = Math.random() * width
          dot.y = Math.random() * height
        }
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    window.addEventListener("resize", resize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [density])

  return <canvas ref={canvasRef} className={cn("size-full min-h-48 rounded-xl border bg-background", className)} />
}

export { FlowField }
