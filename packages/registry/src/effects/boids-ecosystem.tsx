"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/background/boids-ecosystem.tsx

import { useEffect, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BoidsEcosystemProps {
  count?: number
  colors?: readonly string[]
  cursorRadius?: number
  className?: string
  children?: ReactNode
}

interface Agent {
  x: number
  y: number
  vx: number
  vy: number
  color: string
}

const DEFAULT_COLORS = ["#f5f5f4", "#fde68a", "#93c5fd", "#fca5a5"]

function BoidsEcosystem({ count = 80, colors = DEFAULT_COLORS, cursorRadius = 90, className, children }: BoidsEcosystemProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(wrapRef)
  const activeRef = useRef(active)
  const reducedRef = useRef(reduced)
  const resumeRef = useRef<() => void>(() => {})
  const liveRef = useRef({ colors, cursorRadius })

  useEffect(() => {
    liveRef.current = { colors, cursorRadius }
  }, [colors, cursorRadius])

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
    const palette = liveRef.current.colors.length > 0 ? liveRef.current.colors : DEFAULT_COLORS
    const agents: Agent[] = Array.from({ length: Math.max(1, Math.round(count)) }, () => {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.6 + Math.random() * 0.6
      return {
        x: Math.random() * width(),
        y: Math.random() * height(),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette[Math.floor(Math.random() * palette.length)] ?? "#f5f5f4",
      }
    })
    const cursor = { x: 0, y: 0, active: false }
    const perception = 36
    const maxSpeed = 1.8

    const draw = (moving: boolean) => {
      const viewWidth = width()
      const viewHeight = height()
      context.fillStyle = "rgba(11, 11, 18, 0.55)"
      context.fillRect(0, 0, viewWidth, viewHeight)
      for (const agent of agents) {
        if (moving) {
          let alignX = 0
          let alignY = 0
          let separateX = 0
          let separateY = 0
          let centerX = 0
          let centerY = 0
          let neighbors = 0
          for (const other of agents) {
            if (other === agent) continue
            const dx = other.x - agent.x
            const dy = other.y - agent.y
            const distanceSquared = dx * dx + dy * dy
            if (distanceSquared < perception * perception) {
              alignX += other.vx
              alignY += other.vy
              centerX += other.x
              centerY += other.y
              if (distanceSquared < 18 * 18 && distanceSquared > 0.0001) {
                const distance = Math.sqrt(distanceSquared)
                separateX -= dx / distance
                separateY -= dy / distance
              }
              neighbors += 1
            }
          }
          if (neighbors > 0) {
            agent.vx += (alignX / neighbors - agent.vx) * 0.04
            agent.vy += (alignY / neighbors - agent.vy) * 0.04
            agent.vx += (centerX / neighbors - agent.x) * 0.0006
            agent.vy += (centerY / neighbors - agent.y) * 0.0006
            agent.vx += separateX * 0.06
            agent.vy += separateY * 0.06
          }
          if (cursor.active) {
            const dx = agent.x - cursor.x
            const dy = agent.y - cursor.y
            const distance = Math.hypot(dx, dy)
            const radius = liveRef.current.cursorRadius
            if (distance < radius && distance > 0) {
              const force = (radius - distance) / radius
              agent.vx += (dx / distance) * force * 0.6
              agent.vy += (dy / distance) * force * 0.6
            }
          }
          const speed = Math.hypot(agent.vx, agent.vy)
          if (speed > maxSpeed) {
            agent.vx = (agent.vx / speed) * maxSpeed
            agent.vy = (agent.vy / speed) * maxSpeed
          }
          agent.x = (agent.x + agent.vx + viewWidth) % viewWidth
          agent.y = (agent.y + agent.vy + viewHeight) % viewHeight
        }
        const angle = Math.atan2(agent.vy, agent.vx)
        context.save()
        context.translate(agent.x, agent.y)
        context.rotate(angle)
        context.fillStyle = agent.color
        context.globalAlpha = 0.9
        context.beginPath()
        context.moveTo(6, 0)
        context.lineTo(-4, 3)
        context.lineTo(-4, -3)
        context.closePath()
        context.fill()
        context.restore()
      }
    }

    let frame = 0
    const step = () => {
      frame = 0
      if (reducedRef.current || !activeRef.current) return
      draw(true)
      frame = window.requestAnimationFrame(step)
    }
    const start = () => {
      if (reducedRef.current || !activeRef.current || frame) return
      frame = window.requestAnimationFrame(step)
    }
    resumeRef.current = start
    if (reduced) draw(false)
    else start()

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      cursor.x = x
      cursor.y = y
      cursor.active = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
    }
    const onLeave = () => {
      cursor.active = false
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("blur", onLeave)
    return () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      resumeRef.current = () => {}
      observer.disconnect()
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("blur", onLeave)
    }
  }, [count, reduced])

  return (
    <div
      ref={wrapRef}
      data-slot="boids-ecosystem"
      data-reduced={reduced ? "true" : "false"}
      className={cn("relative h-72 w-full overflow-hidden rounded-xl bg-[#0b0b12]", className)}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {children ? <div className="pointer-events-none relative z-10 flex h-full items-center justify-center">{children}</div> : null}
    </div>
  )
}

export { BoidsEcosystem }
