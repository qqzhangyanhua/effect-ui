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

function watchDevicePixelRatio(onChange: () => void) {
  let media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
  const handle = () => {
    media.removeEventListener("change", handle)
    media = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
    media.addEventListener("change", handle)
    onChange()
  }
  media.addEventListener("change", handle)
  return () => media.removeEventListener("change", handle)
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
    let running = false
    let visible = false
    let width = 0
    let height = 0
    let dpr = 0

    const syncSize = (nextWidth: number, nextHeight: number) => {
      const nextDpr = window.devicePixelRatio || 1
      if (nextWidth * nextDpr < 1 || nextHeight * nextDpr < 1) return
      if (nextWidth === width && nextHeight === height && nextDpr === dpr) return
      width = nextWidth
      height = nextHeight
      dpr = nextDpr
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const paint = () => {
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

    const start = () => {
      if (running || width <= 0 || height <= 0) return
      running = true
      frame = window.requestAnimationFrame(paint)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      syncSize(entry.contentRect.width, entry.contentRect.height)
      if (visible) start()
    })

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
      if (visible) start()
      else stop()
    })

    const stopDprWatch = watchDevicePixelRatio(() => {
      syncSize(width, height)
    })

    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      stopDprWatch()
    }
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
