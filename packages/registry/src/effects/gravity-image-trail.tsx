"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GravityImageTrailProps {
  className?: string
}

interface Tile {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  label: string
  life: number
  bounced: boolean
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + width, y, x + width, y + height, radius)
  ctx.arcTo(x + width, y + height, x, y + height, radius)
  ctx.arcTo(x, y + height, x, y, radius)
  ctx.arcTo(x, y, x + width, y, radius)
  ctx.closePath()
}

function GravityImageTrail({ className }: GravityImageTrailProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const tiles = React.useRef<Tile[]>([])
  const last = React.useRef({ x: -999, y: -999 })
  const count = React.useRef(0)
  const reducedRef = React.useRef(reduced)
  const apiRef = React.useRef<{ start: () => void; draw: () => void } | null>(null)

  React.useEffect(() => {
    reducedRef.current = reduced
  }, [reduced])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0
    let width = 0
    let height = 0
    let running = false

    const sync = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      if (rect.width < 2 || rect.height < 2) return
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const tile of tiles.current) {
        ctx.save()
        ctx.globalAlpha = Math.max(0, tile.life)
        ctx.fillStyle = `hsl(${tile.hue} 72% 58%)`
        roundRect(ctx, tile.x, tile.y, tile.size, tile.size * 0.72, 8)
        ctx.fill()
        ctx.fillStyle = "white"
        ctx.font = "600 12px sans-serif"
        ctx.fillText(tile.label, tile.x + 8, tile.y + tile.size * 0.42)
        ctx.restore()
      }
    }

    const step = () => {
      if (width < 2) return
      const floor = height - 8
      const next: Tile[] = []
      for (const tile of tiles.current) {
        if (!reducedRef.current) {
          tile.vy += 0.42
          tile.x += tile.vx
          tile.y += tile.vy
          if (tile.y + tile.size * 0.72 > floor) {
            tile.y = floor - tile.size * 0.72
            tile.vy *= -0.48
            tile.vx *= 0.86
            tile.bounced = true
          }
          if (tile.x < 0 || tile.x + tile.size > width) tile.vx *= -0.8
          if (tile.bounced) tile.life -= 0.008
        }
        if (tile.life > 0.04) next.push(tile)
      }
      tiles.current = next
      draw()
      if (!reducedRef.current && next.length > 0) frame = window.requestAnimationFrame(step)
      else running = false
    }

    const start = () => {
      if (running || reducedRef.current) {
        draw()
        return
      }
      running = true
      frame = window.requestAnimationFrame(step)
    }

    const observer = new ResizeObserver(() => {
      sync()
      draw()
    })
    observer.observe(canvas)
    sync()
    draw()

    apiRef.current = { start, draw }

    return () => {
      running = false
      apiRef.current = null
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  const spawn = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (Math.hypot(x - last.current.x, y - last.current.y) < 28) return
    last.current = { x, y }
    count.current += 1
    tiles.current.push({
      x: x - 28,
      y: y - 18,
      vx: (Math.random() - 0.5) * 3.2,
      vy: Math.random() * -1.2,
      size: 64,
      hue: (count.current * 37) % 360,
      label: String(count.current).padStart(2, "0"),
      life: 1,
      bounced: false,
    })
    if (reduced) apiRef.current?.draw()
    else apiRef.current?.start()
  }

  return (
    <div className={cn("relative h-80 w-full", className)}>
      <canvas
        ref={canvasRef}
        data-slot="gravity-image-trail"
        aria-label="沿指针落下的图片。移动指针生成色块，它们会下落并弹起。"
        className="size-full rounded-xl border bg-zinc-950"
        onPointerMove={spawn}
      />
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs text-zinc-400">移动指针，色块沿路径落下</p>
    </div>
  )
}

export { GravityImageTrail }
