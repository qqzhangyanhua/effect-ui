"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface StarfieldProps extends React.HTMLAttributes<HTMLCanvasElement> {
  count?: number
}

function Starfield({ className, count = 90, ...props }: StarfieldProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let frame = 0
    const stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      s: 0.4 + Math.random() * 1.4,
    }))

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      frame = window.requestAnimationFrame(draw)
    }

    draw()
    return () => window.cancelAnimationFrame(frame)
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
