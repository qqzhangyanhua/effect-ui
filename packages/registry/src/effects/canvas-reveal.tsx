"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CanvasRevealProps {
  className?: string
  gap?: number
  children?: React.ReactNode
}

function CanvasReveal({ className, gap = 10, children }: CanvasRevealProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const ripples = React.useRef<{ x: number; y: number; r: number }[]>([])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width)
      canvas.height = Math.floor(rect.height)
    }
    resize()

    let frame = 0
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#09090b"
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          const covered = ripples.current.some((ripple) => Math.hypot(x - ripple.x, y - ripple.y) < ripple.r)
          const size = covered ? 0.4 : 2.2
          ctx.globalAlpha = covered ? 0.15 : 0.9
          ctx.fillRect(x, y, size, size)
        }
      }
      if (!reduced) {
        ripples.current = ripples.current
          .map((ripple) => ({ ...ripple, r: ripple.r + 3.2 }))
          .filter((ripple) => ripple.r < Math.max(canvas.width, canvas.height))
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    window.addEventListener("resize", resize)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [gap])

  return (
    <div
      className={cn("relative min-h-48 overflow-hidden rounded-xl border", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        ripples.current.push({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          r: 8,
        })
      }}
    >
      <div className="relative z-0 p-6">{children}</div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" />
    </div>
  )
}

export { CanvasReveal }
