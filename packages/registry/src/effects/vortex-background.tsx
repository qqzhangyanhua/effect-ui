"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface VortexBackgroundProps {
  className?: string
  children?: React.ReactNode
}

type Noise2D = (x: number, y: number) => number

interface Particle {
  angle: number
  radius: number
  size: number
  hue: number
}

function resetParticle(particle: Particle, width: number, height: number, edge: boolean) {
  const reach = Math.hypot(width, height)
  particle.angle = Math.random() * Math.PI * 2
  particle.radius = edge ? reach * (0.26 + Math.random() * 0.22) : Math.random() * reach * 0.42
  particle.size = 1 + Math.random() * 1.7
  particle.hue = 175 + Math.random() * 80
}

function runVortex(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  ctx: CanvasRenderingContext2D,
  noise: Noise2D,
) {
  let frame = 0
  let running = false
  let visible = true
  let width = 0
  let height = 0
  const particles: Particle[] = []

  const sync = () => {
    const rect = host.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    if (rect.width < 2 || rect.height < 2) return
    if (rect.width === width && rect.height === height) return
    width = rect.width
    height = rect.height
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    particles.length = 0
    for (let index = 0; index < 96; index += 1) {
      const particle: Particle = { angle: 0, radius: 0, size: 1, hue: 190 }
      resetParticle(particle, width, height, false)
      particles.push(particle)
    }
  }

  const tick = (now: number) => {
    const time = now * 0.00012
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = "rgba(9, 9, 11, 0.32)"
    ctx.fillRect(0, 0, width, height)
    const cx = width / 2
    const cy = height / 2
    const maxR = Math.hypot(width, height) * 0.46
    ctx.globalCompositeOperation = "lighter"
    for (const particle of particles) {
      const swirl = noise(Math.cos(particle.angle) * 1.3 + time, Math.sin(particle.angle) * 1.3)
      const radial = noise(particle.radius * 0.012, time * 2 + particle.angle)
      particle.angle += 0.014 + swirl * 0.02
      particle.radius += -0.45 + radial * 0.6
      if (particle.radius < 8 || particle.radius > maxR) resetParticle(particle, width, height, true)
      const x = cx + Math.cos(particle.angle) * particle.radius
      const y = cy + Math.sin(particle.angle) * particle.radius * 0.7
      ctx.fillStyle = `hsla(${particle.hue}, 92%, 72%, 0.92)`
      ctx.shadowBlur = 10
      ctx.shadowColor = `hsla(${particle.hue}, 95%, 68%, 0.95)`
      ctx.beginPath()
      ctx.arc(x, y, particle.size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0
    if (running) frame = window.requestAnimationFrame(tick)
  }

  const start = () => {
    sync()
    if (width < 2 || running) return
    running = true
    frame = window.requestAnimationFrame(tick)
  }

  const stop = () => {
    running = false
    window.cancelAnimationFrame(frame)
  }

  const resize = new ResizeObserver(() => {
    sync()
    if (visible) start()
  })
  resize.observe(host)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting)
    if (visible) start()
    else stop()
  })
  intersection.observe(host)
  start()

  return () => {
    stop()
    resize.disconnect()
    intersection.disconnect()
  }
}

function SwirlFallback({ animate }: { animate: boolean }) {
  return (
    <div
      className={cn("absolute inset-0 opacity-80", animate && "motion-safe:animate-[effect-ui-vortex-spin_18s_linear_infinite]")}
      style={{
        background: [
          "conic-gradient(from 20deg, transparent, rgba(103,232,249,0.75) 12%, transparent 22%, rgba(167,139,250,0.55) 40%, transparent 52%, rgba(34,211,238,0.7) 72%, transparent 84%)",
          "radial-gradient(circle at center, rgba(125,211,252,0.35), transparent 58%)",
        ].join(", "),
      }}
    />
  )
}

function VortexBackground({ className, children }: VortexBackgroundProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = React.useState(false)
  const showCanvas = !reduced && !failed

  React.useEffect(() => {
    if (!showCanvas) return
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let cancelled = false
    let stop = () => {}
    void import("simplex-noise")
      .then(({ createNoise2D }) => {
        if (cancelled) return
        stop = runVortex(canvas, host, ctx, createNoise2D())
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
      stop()
    }
  }, [showCanvas])

  return (
    <div
      ref={hostRef}
      data-slot="vortex-background"
      className={cn(
        "relative isolate flex min-h-72 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-950 text-zinc-100",
        className,
      )}
    >
      <style>
        {`@keyframes effect-ui-vortex-spin { to { transform: rotate(1turn); } }`}
      </style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2),transparent_58%)]" />
      {showCanvas ? (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      ) : (
        <SwirlFallback animate={!reduced && failed} />
      )}
      {children ? <div className="relative z-10 px-6 text-center">{children}</div> : null}
    </div>
  )
}

export { VortexBackground }
