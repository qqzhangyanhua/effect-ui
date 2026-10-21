"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface StarfieldProps extends React.HTMLAttributes<HTMLCanvasElement> {
  count?: number
  speed?: number
  color?: string
  size?: number
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

function playbackSpeed(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function Starfield({
  className,
  count = 90,
  speed = 1,
  color,
  size = 1,
  ...props
}: StarfieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(canvasRef)
  const rate = playbackSpeed(speed)

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
    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      s: 0.4 + Math.random() * 1.4,
    }))

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

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const star of stars) {
        star.z -= 0.002 * rate
        if (star.z <= 0) star.z = 1
        const x = (star.x - 0.5) * (1 / star.z) * width + width / 2
        const y = (star.y - 0.5) * (1 / star.z) * height + height / 2
        ctx.globalAlpha = 1 - star.z
        ctx.fillStyle = color ?? "currentColor"
        ctx.beginPath()
        ctx.arc(x, y, star.s * (1 - star.z + 0.2) * size, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }

    const start = () => {
      if (!active || width <= 0 || height <= 0) return
      if (reducedMotion) {
        stop()
        draw()
        return
      }
      if (running) return
      running = true
      frame = window.requestAnimationFrame(draw)
    }

    const onMotionChange = () => {
      reducedMotion = motionMedia.matches
      if (reducedMotion) {
        stop()
        if (width > 0 && height > 0) draw()
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
  }, [active, color, count, rate, size])

  return (
    <canvas
      ref={canvasRef}
      data-slot="starfield"
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        color === undefined && "text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Starfield }
