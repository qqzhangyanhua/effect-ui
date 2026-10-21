"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/background/shooting-stars.tsx

import { useEffect, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ShootingStarsProps {
  frequency?: number
  angle?: number
  color?: string
  className?: string
  children?: ReactNode
}

interface Dot {
  x: number
  y: number
  radius: number
  phase: number
  alpha: number
}

interface Streak {
  x: number
  y: number
  life: number
  maxLife: number
  length: number
}

function ShootingStars({ frequency = 1.4, angle = 32, color = "#ffffff", className, children }: ShootingStarsProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(wrapRef)
  const activeRef = useRef(active)
  const reducedRef = useRef(reduced)
  const resumeRef = useRef<() => void>(() => {})
  const liveRef = useRef({ frequency, angle, color })

  useEffect(() => {
    liveRef.current = { frequency, angle, color }
  }, [frequency, angle, color])

  useEffect(() => {
    activeRef.current = active
    reducedRef.current = reduced
    if (!reduced && active) resumeRef.current()
  }, [active, reduced])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext("2d")
    if (!context) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, rect.width) * dpr
      canvas.height = Math.max(1, rect.height) * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    const width = () => canvas.width / dpr
    const height = () => canvas.height / dpr
    const dots: Dot[] = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: 0.4 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.6,
    }))
    const streaks: Streak[] = []
    let carry = 0
    let frame = 0
    let last = performance.now()

    const paintDots = (time: number, twinkle: boolean) => {
      const viewWidth = width()
      const viewHeight = height()
      context.clearRect(0, 0, viewWidth, viewHeight)
      const sky = context.createLinearGradient(0, 0, 0, viewHeight)
      sky.addColorStop(0, "#1e1b4b")
      sky.addColorStop(1, "#05050f")
      context.fillStyle = sky
      context.fillRect(0, 0, viewWidth, viewHeight)
      for (const dot of dots) {
        const alpha = twinkle ? dot.alpha * (0.45 + 0.55 * Math.sin(time / 700 + dot.phase)) : dot.alpha
        context.globalAlpha = Math.max(0.1, alpha)
        context.fillStyle = "#ffffff"
        context.beginPath()
        context.arc(dot.x * viewWidth, dot.y * viewHeight, dot.radius, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
    }

    const step = (now: number) => {
      frame = 0
      if (reducedRef.current || !activeRef.current) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const { frequency: rate, angle: degrees, color: streakColor } = liveRef.current
      const radians = (degrees * Math.PI) / 180
      const velocityX = Math.cos(radians) * 280
      const velocityY = Math.sin(radians) * 280
      carry += Math.max(0, rate) * dt
      while (carry >= 1 && streaks.length < 24) {
        carry -= 1
        streaks.push({
          x: Math.random() * width(),
          y: Math.random() * height() * 0.7,
          life: 0,
          maxLife: 0.7 + Math.random() * 0.8,
          length: 50 + Math.random() * 110,
        })
      }
      paintDots(now, true)
      for (let index = streaks.length - 1; index >= 0; index -= 1) {
        const streak = streaks[index]
        if (!streak) continue
        streak.life += dt
        streak.x += velocityX * dt
        streak.y += velocityY * dt
        const progress = streak.life / streak.maxLife
        if (progress >= 1) {
          streaks.splice(index, 1)
          continue
        }
        const tailX = streak.x - Math.cos(radians) * streak.length
        const tailY = streak.y - Math.sin(radians) * streak.length
        const gradient = context.createLinearGradient(tailX, tailY, streak.x, streak.y)
        gradient.addColorStop(0, "transparent")
        gradient.addColorStop(1, streakColor)
        context.strokeStyle = gradient
        context.globalAlpha = 1 - progress
        context.lineWidth = 1.6
        context.beginPath()
        context.moveTo(tailX, tailY)
        context.lineTo(streak.x, streak.y)
        context.stroke()
        context.globalAlpha = 1
      }
      frame = window.requestAnimationFrame(step)
    }
    const start = () => {
      if (reducedRef.current || !activeRef.current || frame) return
      last = performance.now()
      frame = window.requestAnimationFrame(step)
    }
    resumeRef.current = start
    if (reduced) paintDots(0, false)
    else start()

    return () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      resumeRef.current = () => {}
      observer.disconnect()
    }
  }, [reduced])

  return (
    <div
      ref={wrapRef}
      data-slot="shooting-stars"
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative h-72 w-full overflow-hidden rounded-xl", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  )
}

export { ShootingStars }
