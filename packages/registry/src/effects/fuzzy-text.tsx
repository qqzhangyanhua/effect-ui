"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FuzzyTextProps {
  text?: string
  className?: string
}

function FuzzyText({ text = "SIGNAL", className }: FuzzyTextProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const hoverRef = React.useRef(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    let frame = 0

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.floor(rect.width * dpr))
      const height = Math.max(1, Math.floor(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      context.clearRect(0, 0, width, height)
      const family = getComputedStyle(canvas).fontFamily || "sans-serif"
      const size = Math.floor(height * 0.42)
      context.font = `700 ${size}px ${family}`
      context.fillStyle = "#f4f4f5"
      context.textAlign = "center"
      context.textBaseline = "middle"
      if (reduced) {
        context.fillText(text, width / 2, height / 2)
        return
      }
      const amplitude = (hoverRef.current ? 22 : 6) * dpr
      const row = Math.max(1, Math.floor(2 * dpr))
      for (let y = 0; y < height; y += row) {
        const wave = 0.45 + 0.55 * Math.sin(time * 0.012 + y * 0.04)
        const jitter = (Math.random() - 0.5) * amplitude * wave
        context.save()
        context.beginPath()
        context.rect(0, y, width, row)
        context.clip()
        context.fillText(text, width / 2 + jitter, height / 2)
        context.restore()
      }
      frame = window.requestAnimationFrame(draw)
    }

    if (reduced) {
      draw(0)
      return
    }
    frame = window.requestAnimationFrame(draw)
    return () => window.cancelAnimationFrame(frame)
  }, [reduced, text])

  return (
    <div
      data-slot="fuzzy-text"
      className={cn("relative h-40 w-full overflow-hidden rounded-xl bg-zinc-950", className)}
      onPointerEnter={() => {
        hoverRef.current = true
      }}
      onPointerLeave={() => {
        hoverRef.current = false
      }}
    >
      <canvas ref={canvasRef} className="size-full" aria-label={text} />
    </div>
  )
}

export { FuzzyText }
