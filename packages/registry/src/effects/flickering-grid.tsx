"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
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
  const active = useAnimationActive(canvasRef)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let frame = 0
    let running = false
    let width = 0
    let height = 0
    let dpr = 0
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionMedia.matches

    const syncSize = (nextWidth: number, nextHeight: number) => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
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
      if (!reducedMotion) frame = window.requestAnimationFrame(paint)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }

    const start = () => {
      if (width <= 0 || height <= 0) return
      if (reducedMotion) {
        stop()
        paint()
        return
      }
      if (running) return
      running = true
      frame = window.requestAnimationFrame(paint)
    }

    const onMotionChange = () => {
      reducedMotion = motionMedia.matches
      if (reducedMotion) {
        stop()
        if (width > 0 && height > 0) paint()
        return
      }
      start()
    }
    motionMedia.addEventListener("change", onMotionChange)

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      syncSize(entry.contentRect.width, entry.contentRect.height)
      start()
    })

    const stopDprWatch = watchDevicePixelRatio(() => {
      syncSize(width, height)
      if (reducedMotion) start()
    })

    resizeObserver.observe(canvas)

    return () => {
      stop()
      resizeObserver.disconnect()
      stopDprWatch()
      motionMedia.removeEventListener("change", onMotionChange)
    }
  }, [active, color, flickerChance, gridGap, maxOpacity, squareSize])

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
