"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FuzzyTextProps {
  text?: string
  className?: string
  /** 抖动幅度。不传则保持原来的幅度。 */
  intensity?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  color?: string
  align?: "left" | "center" | "right"
}

function FuzzyText({
  text = "SIGNAL",
  className,
  intensity,
  fontSize,
  fontWeight,
  letterSpacing,
  color,
  align,
}: FuzzyTextProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const hoverRef = React.useRef(false)
  const active = useAnimationActive(canvasRef)

  React.useEffect(() => {
    if (!active) return
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
      const size = fontSize === undefined ? Math.floor(height * 0.42) : Math.floor(fontSize * dpr)
      const weight = fontWeight === undefined ? 700 : fontWeight
      const canvasAlign = align === "left" ? "left" : align === "right" ? "right" : "center"
      const x = canvasAlign === "left" ? width * 0.08 : canvasAlign === "right" ? width * 0.92 : width / 2
      context.font = `${weight} ${size}px ${family}`
      context.fillStyle = color === undefined ? "#f4f4f5" : color
      context.textAlign = canvasAlign
      context.textBaseline = "middle"
      if (letterSpacing !== undefined) context.letterSpacing = `${letterSpacing}em`
      if (reduced) {
        context.fillText(text, x, height / 2)
        return
      }
      const gain = intensity === undefined ? 1 : intensity
      const amplitude = (hoverRef.current ? 22 : 6) * dpr * gain
      const row = Math.max(1, Math.floor(2 * dpr))
      for (let y = 0; y < height; y += row) {
        const wave = 0.45 + 0.55 * Math.sin(time * 0.012 + y * 0.04)
        const jitter = (Math.random() - 0.5) * amplitude * wave
        context.save()
        context.beginPath()
        context.rect(0, y, width, row)
        context.clip()
        context.fillText(text, x + jitter, height / 2)
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
  }, [active, align, color, fontSize, fontWeight, intensity, letterSpacing, reduced, text])

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
