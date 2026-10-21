"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface FlowFieldProps {
  density?: number
  speed?: number
  color?: string
  size?: number
  className?: string
}

interface Dot {
  x: number
  y: number
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

function FlowField({ density = 70, speed = 1, color, size = 1, className }: FlowFieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(canvasRef)

  React.useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let frame = 0
    let running = false
    let width = 0
    let height = 0
    let dpr = 0
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionMedia.matches
    let time = 0
    const dots: Dot[] = []

    const syncSize = (nextWidth: number, nextHeight: number) => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2)
      if (nextWidth * nextDpr < 1 || nextHeight * nextDpr < 1) return
      if (nextWidth !== width || nextHeight !== height || nextDpr !== dpr) {
        width = nextWidth
        height = nextHeight
        dpr = nextDpr
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      if (dots.length > 0) return
      dots.push(
        ...Array.from({ length: density }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
        })),
      )
    }

    const tick = () => {
      ctx.fillStyle = "color-mix(in oklab, var(--background) 18%, transparent)"
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = color ?? "color-mix(in oklab, var(--primary) 70%, transparent)"
      ctx.lineWidth = size
      const rate = Number.isFinite(speed) && speed > 0 ? speed : 1
      time += 0.006 * rate
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
      if (!reducedMotion) frame = window.requestAnimationFrame(tick)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }

    const start = () => {
      if (!active || width <= 0 || height <= 0) return
      if (reducedMotion) {
        stop()
        tick()
        return
      }
      if (running) return
      running = true
      frame = window.requestAnimationFrame(tick)
    }

    const onMotionChange = () => {
      reducedMotion = motionMedia.matches
      if (reducedMotion) {
        stop()
        if (width > 0 && height > 0) tick()
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
  }, [active, color, density, size, speed])

  return <canvas ref={canvasRef} className={cn("size-full min-h-48 rounded-xl border bg-background", className)} />
}

export { FlowField }
