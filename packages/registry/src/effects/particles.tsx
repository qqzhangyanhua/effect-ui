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
  const frame = React.useRef(0)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      const { width, height } = canvas.getBoundingClientRect()
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

      frame.current = window.requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener("resize", resize)
    canvas.addEventListener("mousemove", onMove)
    return () => {
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousemove", onMove)
      window.cancelAnimationFrame(frame.current)
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
