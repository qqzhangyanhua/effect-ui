"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PetalDissolveTextProps {
  text?: string
  direction?: "forward" | "reverse"
  duration?: number
  color?: string
  trigger?: "view" | "hover" | "manual"
  className?: string
}

interface Particle {
  x: number
  y: number
  noise: number
}

function sampleText(text: string, color: string) {
  const width = 640
  const height = 180
  const offscreen = document.createElement("canvas")
  offscreen.width = width
  offscreen.height = height
  const context = offscreen.getContext("2d")
  const particles: Particle[] = []
  if (!context) return { width, height, particles }
  context.clearRect(0, 0, width, height)
  context.fillStyle = color
  context.font = "72px sans-serif"
  context.textBaseline = "middle"
  context.fillText(text, 24, height / 2)
  const pixels = context.getImageData(0, 0, width, height).data
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      if ((pixels[(y * width + x) * 4 + 3] ?? 0) > 140) {
        particles.push({ x, y, noise: Math.sin(x * 0.17 + y * 0.31) })
      }
    }
  }
  return { width, height, particles: particles.slice(0, 900) }
}

function PetalDissolveText({
  text = "花瓣散开",
  direction = "forward",
  duration = 1400,
  color = "#fb7185",
  trigger = "manual",
  className,
}: PetalDissolveTextProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const particlesRef = React.useRef<Particle[]>([])
  const sizeRef = React.useRef({ width: 640, height: 180 })
  const progressRef = React.useRef(direction === "reverse" ? 1 : 0)
  const targetRef = React.useRef(direction === "reverse" ? 1 : 0)
  const kickRef = React.useRef<() => void>(() => {})
  const [playing, setPlaying] = React.useState(direction === "reverse")

  React.useEffect(() => {
    const sampled = sampleText(text, color)
    particlesRef.current = sampled.particles
    sizeRef.current = { width: sampled.width, height: sampled.height }
  }, [text, color])

  React.useEffect(() => {
    if (trigger !== "view") return
    const node = hostRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        targetRef.current = 1
        kickRef.current()
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let frame = 0
    let settled = false
    const tick = () => {
      const target = targetRef.current
      const current = progressRef.current
      const step = reduced ? 1 : Math.min(1, 16 / Math.max(duration, 200))
      progressRef.current = current + Math.max(-step, Math.min(step, target - current))
      const context = canvas.getContext("2d")
      const { width, height } = sizeRef.current
      if (context) {
        if (canvas.width !== width) canvas.width = width
        if (canvas.height !== height) canvas.height = height
        context.clearRect(0, 0, width, height)
        const progress = progressRef.current
        const sign = direction === "reverse" ? -1 : 1
        for (const particle of particlesRef.current) {
          const front = (direction === "reverse" ? 1 - progress : progress) * (width + 40) + particle.noise * 18
          const released = sign === 1 ? particle.x < front : particle.x > width - front
          const travel = released ? Math.min(1, Math.abs(front - particle.x) / 180) : 0
          const drift = reduced ? 0 : travel
          context.save()
          context.translate(particle.x + particle.noise * 36 * drift, particle.y - 28 * drift + Math.sin(particle.noise * 6) * 16 * drift)
          context.rotate(drift * particle.noise)
          context.globalAlpha = 1 - drift * 0.85
          context.fillStyle = color
          context.beginPath()
          context.ellipse(0, 0, 2.2 + drift * 3, 1.2, 0.6, 0, Math.PI * 2)
          context.fill()
          context.restore()
        }
      }
      if (Math.abs(progressRef.current - target) < 0.001) {
        settled = true
        return
      }
      frame = window.requestAnimationFrame(tick)
    }
    kickRef.current = () => {
      if (!settled) return
      settled = false
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [color, direction, duration, reduced])

  const play = (next: number) => {
    targetRef.current = next
    setPlaying(next > 0.5)
    kickRef.current()
  }

  return (
    <div
      ref={hostRef}
      data-slot="petal-dissolve-text"
      className={cn("w-full space-y-3", className)}
      onPointerEnter={() => {
        if (trigger === "hover") play(1)
      }}
      onPointerLeave={() => {
        if (trigger === "hover") play(0)
      }}
    >
      {trigger === "manual" ? (
        <button
          type="button"
          aria-pressed={playing}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => play(playing ? 0 : 1)}
        >
          {playing ? "重新聚拢" : "散成花瓣"}
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">{trigger === "hover" ? "悬停后文字散成花瓣。" : "进入视口后文字散成花瓣。"}</p>
      )}
      <canvas ref={canvasRef} aria-label={text} className="h-44 w-full rounded-xl border bg-slate-950" />
    </div>
  )
}

export { PetalDissolveText }
