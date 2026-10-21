"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/glyph-matrix.tsx

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GlyphMatrixProps {
  text?: string
  glyphs?: string
  cellSize?: number
  color?: string
  className?: string
}

function GlyphMatrix({
  text,
  glyphs = "01·•+*/\\<>=",
  cellSize = 16,
  color,
  className,
}: GlyphMatrixProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const reducedRef = React.useRef(reduced)

  React.useEffect(() => {
    reducedRef.current = reduced
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let cols = 0
    let rows = 0
    let cells: string[] = []
    let frame = 0
    let last = 0
    let visible = false
    const alphabet = glyphs.length > 0 ? glyphs : "01"

    const pick = (index: number) => {
      if (text && text.length > 0) return text[index % text.length] ?? " "
      return alphabet[Math.floor(Math.random() * alphabet.length)] ?? "0"
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.max(1, Math.ceil(width / cellSize))
      rows = Math.max(1, Math.ceil(height / cellSize))
      cells = Array.from({ length: cols * rows }, (_, index) => pick(index))
    }

    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)
      ctx.font = `${Math.max(8, cellSize - 2)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textBaseline = "top"
      ctx.fillStyle = color || getComputedStyle(canvas).color
      for (let y = 0; y < rows; y += 1) {
        const fade = 1 - (y / rows) * 0.55
        ctx.globalAlpha = fade
        for (let x = 0; x < cols; x += 1) {
          ctx.fillText(cells[y * cols + x] ?? " ", x * cellSize, y * cellSize)
        }
      }
      ctx.globalAlpha = 1
    }

    const tick = (time: number) => {
      if (!visible || reducedRef.current) {
        frame = 0
        return
      }
      if (time - last > 90) {
        last = time
        const mutations = Math.max(1, Math.floor(cols * rows * 0.04))
        for (let n = 0; n < mutations; n += 1) {
          const index = Math.floor(Math.random() * cells.length)
          cells[index] = pick(index + n)
        }
        if (cols > 0) {
          cells = cells.slice(cols).concat(Array.from({ length: cols }, (_, index) => pick(cells.length + index)))
        }
        draw()
      }
      frame = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (frame === 0 && visible && !reducedRef.current) frame = window.requestAnimationFrame(tick)
    }

    resize()
    draw()
    const observer = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? false
      if (visible) start()
    })
    observer.observe(canvas)
    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    resizeObserver.observe(canvas)

    return () => {
      visible = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
    }
  }, [text, glyphs, cellSize, color, reduced])

  return (
    <canvas
      ref={canvasRef}
      data-slot="glyph-matrix"
      aria-label={text ? `字符点阵 ${text}` : "字符点阵图案"}
      className={cn("block h-64 w-full text-muted-foreground", className)}
    />
  )
}

export { GlyphMatrix }
