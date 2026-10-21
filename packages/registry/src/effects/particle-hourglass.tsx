"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ParticleHourglassProps {
  progress?: number
  className?: string
}

const COUNT = 80

function ParticleHourglass({ progress = 0.35, className }: ParticleHourglassProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const targetRef = React.useRef(progress)
  const shownRef = React.useRef(progress)

  React.useEffect(() => {
    targetRef.current = Math.min(1, Math.max(0, progress))
  }, [progress])

  React.useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    let frame = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const tick = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      shownRef.current += (targetRef.current - shownRef.current) * 0.08
      const value = shownRef.current
      context.clearRect(0, 0, width, height)
      context.strokeStyle = "#e7d7b1"
      context.lineWidth = 2
      context.beginPath()
      context.moveTo(width * 0.22, height * 0.08)
      context.lineTo(width * 0.78, height * 0.08)
      context.lineTo(width * 0.52, height * 0.48)
      context.lineTo(width * 0.48, height * 0.52)
      context.lineTo(width * 0.78, height * 0.92)
      context.lineTo(width * 0.22, height * 0.92)
      context.lineTo(width * 0.48, height * 0.52)
      context.lineTo(width * 0.52, height * 0.48)
      context.closePath()
      context.stroke()
      const exact = value * COUNT
      const fallen = Math.floor(exact)
      const fraction = exact - fallen
      const cols = 8
      context.fillStyle = "#f6d48a"
      for (let index = 0; index < COUNT; index += 1) {
        const falling = fraction > 0 && index === COUNT - fallen - 1
        if (falling) continue
        const column = index % cols
        const row = Math.floor(index / cols)
        if (index < COUNT - fallen) {
          context.fillRect(width * 0.3 + column * 8, height * 0.14 + row * 7, 5, 5)
        } else {
          const pile = index - (COUNT - fallen)
          const pileColumn = pile % cols
          const pileRow = Math.floor(pile / cols)
          context.fillRect(width * 0.3 + pileColumn * 8, height * 0.84 - pileRow * 7, 5, 5)
        }
      }
      if (fraction > 0 && fallen < COUNT) {
        context.fillRect(width * 0.48, height * (0.18 + fraction * 0.66), 5, 5)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [reduced])

  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100)

  if (reduced) {
    return (
      <div data-slot="particle-hourglass" className={cn("w-56", className)}>
        <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">进度 {percent}%</p>
      </div>
    )
  }

  return (
    <div data-slot="particle-hourglass" className={cn("w-56", className)}>
      <canvas ref={canvasRef} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`沙漏进度 ${percent}%`} className="h-72 w-full" />
    </div>
  )
}

export { ParticleHourglass }
