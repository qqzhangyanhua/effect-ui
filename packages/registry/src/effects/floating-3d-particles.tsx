"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/floating-3d-particles.tsx

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface Floating3DParticlesProps {
  quantity?: number
  color?: string
  size?: number
  depth?: number
  className?: string
}

interface Particle {
  angle: number
  radius: number
  y: number
  size: number
  spin: number
  opacity: number
}

function Floating3DParticles({
  quantity = 90,
  color = "#8b5cf6",
  size = 4,
  depth = 0.6,
  className,
}: Floating3DParticlesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const reducedRef = React.useRef(reduced)

  React.useEffect(() => {
    reducedRef.current = reduced
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 1
    let height = 1
    let frame = 0
    let visible = false
    let particles: Particle[] = []
    const pointer = { x: 0, y: 0 }
    const depthClamped = Math.max(0, Math.min(1, depth))
    const fov = 800 - depthClamped * 500
    const distance = 180 + depthClamped * 420

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = window.innerWidth < 768 ? Math.max(12, Math.round(quantity * 0.35)) : quantity
      particles = Array.from({ length: count }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * Math.max(width, height),
        y: (Math.random() - 0.5) * height * 2,
        size: Math.max(1, size * (0.6 + Math.random() * 0.8)),
        spin: 0.004 + Math.random() * 0.01,
        opacity: 0.25 + Math.random() * 0.55,
      }))
    }

    const paint = (still: boolean) => {
      ctx.clearRect(0, 0, width, height)
      const cx = width / 2 + pointer.x * 70 * depthClamped
      const cy = height / 2 + pointer.y * 48 * depthClamped
      const drawn = particles.map((particle) => {
        if (!still) {
          particle.angle += particle.spin
          particle.y -= 0.45
          if (particle.y < -height) particle.y = height
        }
        const denom = Math.max(1, fov + distance + Math.sin(particle.angle) * depthClamped * 280)
        const scale = fov / denom
        return {
          x: cx + Math.cos(particle.angle) * particle.radius * scale,
          y: cy + particle.y * scale,
          r: particle.size * scale,
          opacity: particle.opacity,
          scale,
        }
      })
      drawn.sort((a, b) => a.scale - b.scale)
      for (const particle of drawn) {
        ctx.beginPath()
        ctx.fillStyle = color
        ctx.globalAlpha = particle.opacity
        ctx.arc(particle.x, particle.y, Math.max(0.4, particle.r), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const tick = () => {
      if (!visible) {
        frame = 0
        return
      }
      if (reducedRef.current) {
        paint(true)
        frame = 0
        return
      }
      paint(false)
      frame = window.requestAnimationFrame(tick)
    }

    const start = () => {
      if (visible && frame === 0) frame = window.requestAnimationFrame(tick)
    }

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) / rect.width - 0.5
      pointer.y = (event.clientY - rect.top) / rect.height - 0.5
    }

    resize()
    paint(true)
    const observer = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? false
      if (visible) start()
    })
    observer.observe(canvas)
    const resizeObserver = new ResizeObserver(() => {
      resize()
      paint(reducedRef.current)
      start()
    })
    resizeObserver.observe(canvas)
    window.addEventListener("pointermove", onPointer)

    return () => {
      visible = false
      if (frame) window.cancelAnimationFrame(frame)
      observer.disconnect()
      resizeObserver.disconnect()
      window.removeEventListener("pointermove", onPointer)
    }
  }, [quantity, color, size, depth, reduced])

  return <canvas ref={canvasRef} data-slot="floating-3d-particles" aria-hidden className={cn("absolute inset-0 h-full w-full", className)} />
}

export { Floating3DParticles }
