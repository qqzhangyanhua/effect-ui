"use client"

// Ported from MosaicUI (MIT, (c) 2026 Darshan Sunil Rajadhyaksha) — https://github.com/darshan-rajadhyaksha/mosaicui/blob/2baca92/src/registry/backgrounds/wavy-threads-background/wavy-threads-background.tsx

import { useEffect, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WavyThreadsBackgroundProps {
  color?: string
  count?: number
  speed?: number
  intensity?: number
  className?: string
}

function hash(n: number) {
  const value = Math.sin(n * 127.1) * 43758.5453123
  return value - Math.floor(value)
}

function fade(t: number) {
  return t * t * (3 - 2 * t)
}

function noise(x: number) {
  const i = Math.floor(x)
  const f = x - i
  return hash(i) + (hash(i + 1) - hash(i)) * fade(f)
}

function threadSet(count: number, amplitude: number) {
  const total = Math.max(1, Math.min(24, Math.round(count)))
  const span = Math.max(0, amplitude - 10)
  return Array.from({ length: total }, (_, index) => ({
    xOffset: hash(index + 1.3) * 1000,
    amplitude: 10 + hash(index + 19.7) * span,
    speed: 0.01 + hash(index + 37.1) * 0.03,
    frequency: 0.01 + hash(index + 53.9) * 0.03,
    noiseScale: 0.002 + hash(index + 71.2) * 0.006,
    noiseStrength: 20 + hash(index + 89.4) * 50,
  }))
}

export function WavyThreadsBackground({
  color = "var(--muted-foreground)",
  count = 10,
  speed = 1,
  intensity = 50,
  className,
}: WavyThreadsBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const threads = threadSet(count, intensity)
    let frame = 0
    let time = 0

    const draw = (advance: boolean) => {
      const width = Math.max(1, root.clientWidth)
      const height = Math.max(1, root.clientHeight)
      const ratio = Math.max(1, window.devicePixelRatio || 1)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      canvas.style.color = color
      const stroke = getComputedStyle(canvas).color
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)
      context.lineWidth = 1.5
      context.strokeStyle = stroke
      context.shadowBlur = 2
      context.shadowColor = stroke
      const step = Math.max(1, Math.ceil(width / 480))
      const center = height / 2
      for (const thread of threads) {
        context.beginPath()
        for (let x = 0; x <= width; x += step) {
          const t = x / width
          const envelope = Math.sin(Math.PI * t) ** 2
          const distortion = noise(x * 0.003 + time * 0.01) * 2
          const base =
            Math.sin(x * thread.frequency + time * thread.speed + thread.xOffset + distortion) * thread.amplitude
          const n =
            (noise(x * thread.noiseScale + time * 0.02) * 0.7 + noise(x * thread.noiseScale * 3 + time * 0.04) * 0.3 - 0.5) *
            thread.noiseStrength
          const y = center + (base + n) * envelope
          if (x === 0) context.moveTo(x, y)
          else context.lineTo(x, y)
        }
        context.stroke()
      }
      if (advance) time += 0.5 * speed
    }

    const moving = live && !reduced
    draw(false)
    if (moving) {
      const loop = () => {
        draw(true)
        frame = window.requestAnimationFrame(loop)
      }
      frame = window.requestAnimationFrame(loop)
    }
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => draw(false))
      observer.observe(root)
    }
    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [color, count, intensity, live, reduced, speed])

  return (
    <div
      ref={rootRef}
      data-slot="wavy-threads-background"
      data-motion={live && !reduced ? "on" : "off"}
      className={cn("absolute inset-0 overflow-hidden motion-reduce:animate-none", className)}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />
    </div>
  )
}
