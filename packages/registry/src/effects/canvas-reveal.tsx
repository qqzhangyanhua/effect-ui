"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface CanvasRevealProps {
  className?: string
  gap?: number
  speed?: number
  size?: number
  intensity?: number
  color?: string
  children?: React.ReactNode
}

function CanvasReveal({
  className,
  gap = 10,
  speed,
  size,
  intensity,
  color,
  children,
}: CanvasRevealProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const hostRef = React.useRef<HTMLDivElement>(null)
  const ripples = React.useRef<{ x: number; y: number; r: number }[]>([])
  const active = useAnimationActive(hostRef)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width)
      canvas.height = Math.floor(rect.height)
    }
    resize()
    window.addEventListener("resize", resize)
    if (!active) return () => window.removeEventListener("resize", resize)
    const ctx = canvas.getContext("2d")
    if (!ctx) return () => window.removeEventListener("resize", resize)

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dot = size === undefined || size === 2.2 ? 2.2 : size
    const coveredDot = size === undefined || size === 2.2 ? 0.4 : (size * 0.4) / 2.2
    const reach = intensity === undefined || intensity === 1 ? 1 : intensity
    const restingAlpha = reach === 1 ? 0.9 : 0.9 * reach
    const coveredAlpha = reach === 1 ? 0.15 : 0.15 * reach
    const step = speed === undefined || speed === 1 ? 3.2 : 3.2 * speed
    const paint = color ?? "#09090b"
    let frame = 0
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = paint
      for (let x = 0; x < canvas.width; x += gap) {
        for (let y = 0; y < canvas.height; y += gap) {
          const covered = ripples.current.some((ripple) => Math.hypot(x - ripple.x, y - ripple.y) < ripple.r)
          const mark = covered ? coveredDot : dot
          ctx.globalAlpha = covered ? coveredAlpha : restingAlpha
          ctx.fillRect(x, y, mark, mark)
        }
      }
      if (!reduced) {
        ripples.current = ripples.current
          .map((ripple) => ({ ...ripple, r: ripple.r + step }))
          .filter((ripple) => ripple.r < Math.max(canvas.width, canvas.height))
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [active, color, gap, intensity, size, speed])

  return (
    <div
      ref={hostRef}
      className={cn("relative min-h-48 overflow-hidden rounded-xl border", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        ripples.current.push({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          r: 8,
        })
      }}
    >
      <div className="relative z-0 p-6">{children}</div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 size-full" />
    </div>
  )
}

export { CanvasReveal }
