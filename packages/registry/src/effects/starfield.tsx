"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface StarfieldProps extends React.HTMLAttributes<HTMLCanvasElement> {
  count?: number
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

function Starfield({ className, count = 90, ...props }: StarfieldProps) {
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
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = motionMedia.matches
    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      s: 0.4 + Math.random() * 1.4,
    }))

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

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      for (const star of stars) {
        star.z -= 0.002
        if (star.z <= 0) star.z = 1
        const x = (star.x - 0.5) * (1 / star.z) * width + width / 2
        const y = (star.y - 0.5) * (1 / star.z) * height + height / 2
        ctx.globalAlpha = 1 - star.z
        ctx.fillStyle = "currentColor"
        ctx.beginPath()
        ctx.arc(x, y, star.s * (1 - star.z + 0.2), 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(draw)
    }

    const stop = () => {
      running = false
      window.cancelAnimationFrame(frame)
    }

    const start = () => {
      if (width <= 0 || height <= 0) return
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
        if (visible && width > 0 && height > 0) draw()
        return
      }
      if (visible) start()
    }
    motionMedia.addEventListener("change", onMotionChange)

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
      if (reducedMotion && visible) start()
    })

    resizeObserver.observe(canvas)
    intersectionObserver.observe(canvas)

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      stopDprWatch()
      motionMedia.removeEventListener("change", onMotionChange)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      data-slot="starfield"
      className={cn("pointer-events-none absolute inset-0 size-full text-foreground", className)}
      {...props}
    />
  )
}

export { Starfield }
