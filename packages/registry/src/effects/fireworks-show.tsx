"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FireworksShowProps {
  colors?: string[]
  auto?: boolean
  intensity?: number
  className?: string
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  color: string
  size: number
}

interface Rocket {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  trail: { x: number; y: number }[]
}

const DEFAULT_COLORS = ["#fde68a", "#fb7185", "#7dd3fc", "#c4b5fd", "#86efac"]

function FireworksShow({ colors = DEFAULT_COLORS, auto = true, intensity = 1, className }: FireworksShowProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const visibleRef = React.useRef(true)
  const intensityRef = React.useRef(intensity)
  const colorsRef = React.useRef(colors)

  React.useEffect(() => {
    intensityRef.current = intensity
    colorsRef.current = colors
  }, [colors, intensity])

  React.useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const context = canvas.getContext("2d")
    if (!context) return
    const sparks: Spark[] = []
    const rockets: Rocket[] = []
    let frame = 0
    let running = true

    const launch = (x: number) => {
      const palette = colorsRef.current
      const color = palette[Math.floor(Math.random() * palette.length)] ?? "#fde68a"
      rockets.push({
        x,
        y: canvas.clientHeight,
        vx: (Math.random() - 0.5) * 1.4,
        vy: -5.5 - Math.random() * 2.5 * intensityRef.current,
        color,
        trail: [],
      })
    }

    const explode = (rocket: Rocket) => {
      const count = Math.round(28 * intensityRef.current)
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2 + Math.random() * 0.2
        const speed = (1.2 + Math.random() * 2.4) * intensityRef.current
        sparks.push({
          x: rocket.x,
          y: rocket.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 40 + Math.random() * 24,
          max: 64,
          color: rocket.color,
          size: 1.4 + Math.random() * 1.6,
        })
      }
    }

    const resize = () => {
      const rect = host.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    const tick = () => {
      if (!running) return
      if (!visibleRef.current) {
        frame = 0
        return
      }
      const width = host.clientWidth
      const height = host.clientHeight
      context.clearRect(0, 0, width, height)
      if (visibleRef.current && auto && Math.random() < 0.02 * intensityRef.current) launch(width * (0.2 + Math.random() * 0.6))
      for (let index = rockets.length - 1; index >= 0; index -= 1) {
        const rocket = rockets[index]
        if (!rocket) continue
        rocket.trail.push({ x: rocket.x, y: rocket.y })
        if (rocket.trail.length > 8) rocket.trail.shift()
        rocket.x += rocket.vx
        rocket.y += rocket.vy
        rocket.vy += 0.045
        context.strokeStyle = rocket.color
        context.beginPath()
        rocket.trail.forEach((point, pointIndex) => {
          if (pointIndex === 0) context.moveTo(point.x, point.y)
          else context.lineTo(point.x, point.y)
        })
        context.stroke()
        if (rocket.vy > -0.4) {
          explode(rocket)
          rockets.splice(index, 1)
        }
      }
      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index]
        if (!spark) continue
        spark.x += spark.vx
        spark.y += spark.vy
        spark.vy += 0.035
        spark.life -= 1
        const flicker = 0.55 + Math.sin(spark.life * 1.3) * 0.45
        context.globalAlpha = Math.max(0, spark.life / spark.max) * flicker
        context.fillStyle = spark.color
        context.fillRect(spark.x, spark.y, spark.size, spark.size)
        context.globalAlpha = 1
        if (spark.life <= 0) sparks.splice(index, 1)
      }
      frame = window.requestAnimationFrame(tick)
    }
    const viewObserver = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((entry) => entry.isIntersecting)
      if (visibleRef.current && running && frame === 0) frame = window.requestAnimationFrame(tick)
    })
    viewObserver.observe(host)
    frame = window.requestAnimationFrame(tick)
    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      launch(event.clientX - rect.left)
    }
    canvas.addEventListener("click", onClick)
    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      canvas.removeEventListener("click", onClick)
      resizeObserver.disconnect()
      viewObserver.disconnect()
    }
  }, [auto, reduced])

  if (reduced) {
    return <div data-slot="fireworks-show" className={cn("sr-only", className)}>减弱动效时不渲染烟花。</div>
  }

  return (
    <div ref={hostRef} data-slot="fireworks-show" className={cn("relative h-80 overflow-hidden rounded-xl border bg-slate-950", className)}>
      <canvas ref={canvasRef} aria-label="烟花。点击夜空再放一朵。" className="absolute inset-0 size-full" />
    </div>
  )
}

export { FireworksShow }
