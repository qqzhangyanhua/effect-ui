"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

export interface ParticlesProps extends React.HTMLAttributes<HTMLCanvasElement> {
  quantity?: number
  staticity?: number
  ease?: number
  color?: string
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

function Particles({
  className,
  quantity = 60,
  staticity = 50,
  ease = 50,
  color = "currentColor",
  ...props
}: ParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const particles = React.useRef<Particle[]>([])
  const mouse = React.useRef({ x: 0, y: 0 })

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
      const sizeChanged = nextWidth !== width || nextHeight !== height
      if (!sizeChanged && nextDpr === dpr) return
      width = nextWidth
      height = nextHeight
      dpr = nextDpr
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!sizeChanged) return
      particles.current = Array.from({ length: quantity }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.6 + 0.4,
      }))
    }

    const onMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = color
      const attraction = (100 - staticity) / 1800
      const damping = ease / 1400

      for (const particle of particles.current) {
        const dx = mouse.current.x - particle.x
        const dy = mouse.current.y - particle.y
        particle.vx += dx * attraction
        particle.vy += dy * attraction
        particle.vx *= 1 - damping
        particle.vy *= 1 - damping
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > width) particle.vx *= -1
        if (particle.y < 0 || particle.y > height) particle.vy *= -1

        ctx.beginPath()
        ctx.globalAlpha = 0.7
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }

      frame = window.requestAnimationFrame(draw)
    }

    const start = () => {
      if (running || width <= 0 || height <= 0) return
      running = true
      frame = window.requestAnimationFrame(draw)
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
    canvas.addEventListener("mousemove", onMove)

    return () => {
      stop()
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      stopDprWatch()
      canvas.removeEventListener("mousemove", onMove)
    }
  }, [color, ease, quantity, staticity])

  return (
    <canvas
      ref={canvasRef}
      data-slot="particles"
      className={cn("pointer-events-auto absolute inset-0 size-full", className)}
      {...props}
    />
  )
}

export { Particles }
