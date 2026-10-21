"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ParticleHourglassProps {
  progress?: number
  className?: string
  count?: number
  colors?: readonly string[]
  speed?: number
  size?: number
  gap?: number
}

function ParticleHourglass({
  progress = 0.35,
  className,
  count,
  colors,
  speed,
  size,
  gap,
}: ParticleHourglassProps) {
  const reduced = usePrefersReducedMotion()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const active = useAnimationActive(canvasRef)
  const targetRef = React.useRef(progress)
  const shownRef = React.useRef(progress)
  const grainCount = count === undefined || count === 80 ? 80 : count
  const follow = speed === undefined || speed === 1 ? 0.08 : 0.08 * speed
  const columnGap = gap === undefined || gap === 8 ? 8 : gap
  const rowGap = gap === undefined || gap === 8 ? 7 : gap
  const stroke = colors?.[0] ?? "#e7d7b1"
  const sand = colors?.[1] ?? "#f6d48a"
  const fitted = size === undefined || size === 224
  const frameClass = cn(fitted ? "w-56" : undefined, className)
  const frameStyle = fitted ? undefined : { width: size }

  React.useEffect(() => {
    targetRef.current = Math.min(1, Math.max(0, progress))
  }, [progress])

  React.useEffect(() => {
    if (reduced || !active) return
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
      shownRef.current += (targetRef.current - shownRef.current) * follow
      const value = shownRef.current
      context.clearRect(0, 0, width, height)
      context.strokeStyle = stroke
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
      const exact = value * grainCount
      const fallen = Math.floor(exact)
      const fraction = exact - fallen
      const cols = 8
      context.fillStyle = sand
      for (let index = 0; index < grainCount; index += 1) {
        const falling = fraction > 0 && index === grainCount - fallen - 1
        if (falling) continue
        const column = index % cols
        const row = Math.floor(index / cols)
        if (index < grainCount - fallen) {
          context.fillRect(width * 0.3 + column * columnGap, height * 0.14 + row * rowGap, 5, 5)
        } else {
          const pile = index - (grainCount - fallen)
          const pileColumn = pile % cols
          const pileRow = Math.floor(pile / cols)
          context.fillRect(width * 0.3 + pileColumn * columnGap, height * 0.84 - pileRow * rowGap, 5, 5)
        }
      }
      if (fraction > 0 && fallen < grainCount) {
        context.fillRect(width * 0.48, height * (0.18 + fraction * 0.66), 5, 5)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [reduced, active, grainCount, follow, columnGap, rowGap, stroke, sand])

  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100)

  if (reduced) {
    return (
      <div data-slot="particle-hourglass" className={frameClass} style={frameStyle}>
        <div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">进度 {percent}%</p>
      </div>
    )
  }

  return (
    <div data-slot="particle-hourglass" className={frameClass} style={frameStyle}>
      <canvas ref={canvasRef} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`沙漏进度 ${percent}%`} className="h-72 w-full" />
    </div>
  )
}

export { ParticleHourglass }
