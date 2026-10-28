"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ParticleVeilCaptionProps {
  pace?: number
  intensity?: number
  sphere?: boolean
  caption?: boolean
  className?: string
  onValueChange?: (state: { parting: boolean }) => void
}

export interface VeilParticle {
  x: number
  y: number
  homeX: number
  homeY: number
  vx: number
  vy: number
}

export const VEIL_WIDTH = 320
export const VEIL_HEIGHT = 180

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function veilDensity(intensity: number) {
  return Math.round(32 + clamp(intensity, 0, 1) * 40)
}

export function veilRadius(intensity: number) {
  return 34 + clamp(intensity, 0, 1) * 70
}

export function veilCoreRadius(intensity: number) {
  return veilRadius(intensity) * 0.42
}

export function createVeilParticles(count: number, sphere: boolean, width = VEIL_WIDTH, height = VEIL_HEIGHT): VeilParticle[] {
  const cx = width / 2
  const cy = height / 2
  const list: VeilParticle[] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / Math.max(1, count)) * Math.PI * 2
    const band = 0.55 + (index % 5) * 0.09
    const homeX = sphere ? cx + Math.cos(angle) * Math.min(width, height) * 0.22 * band : ((index * 53) % 97) / 97 * width
    const homeY = sphere ? cy + Math.sin(angle) * Math.min(width, height) * 0.22 * band : ((index * 37) % 89) / 89 * height
    list.push({ x: homeX, y: homeY, homeX, homeY, vx: 0, vy: 0 })
  }
  return list
}

export function veilNear(particles: readonly VeilParticle[], x: number, y: number, radius: number) {
  const limit = radius * radius
  let count = 0
  for (const particle of particles) {
    const dx = particle.x - x
    const dy = particle.y - y
    if (dx * dx + dy * dy <= limit) count += 1
  }
  return count
}

export function stepVeilParticles(
  particles: readonly VeilParticle[],
  focus: { x: number; y: number; active: boolean } | null,
  dt: number,
  pace: number,
  intensity: number,
): { particles: VeilParticle[]; parting: boolean } {
  const gain = clamp(intensity, 0, 1)
  const radius = veilRadius(gain)
  const speed = rateOf(pace)
  const step = dt > 0.08 ? 0.05 : Math.min(0.05, Math.max(0.001, dt))
  let parting = false
  const next = particles.map((particle) => {
    let vx = particle.vx * 0.84 + (particle.homeX - particle.x) * 0.8 * speed
    let vy = particle.vy * 0.84 + (particle.homeY - particle.y) * 0.8 * speed
    if (focus?.active) {
      const dx = particle.x - focus.x
      const dy = particle.y - focus.y
      const dist = Math.hypot(dx, dy) || 0.001
      if (dist < radius) {
        parting = true
        const push = ((radius - dist) / radius) * (36 + gain * 28) * speed
        vx += (dx / dist) * push
        vy += (dy / dist) * push
      }
    } else {
      vx += Math.sin(particle.homeX + particle.homeY) * 0.35 * speed
      vy += Math.cos(particle.homeY) * 0.35 * speed
    }
    const x = particle.homeX + clamp(particle.x + vx * step * 18 - particle.homeX, -120, 120)
    const y = particle.homeY + clamp(particle.y + vy * step * 18 - particle.homeY, -120, 120)
    return { x, y, homeX: particle.homeX, homeY: particle.homeY, vx, vy }
  })
  return { particles: next, parting }
}

function localPoint(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }) {
  if (rect.width <= 0 || rect.height <= 0) return { x: clientX, y: clientY }
  return {
    x: ((clientX - rect.left) / rect.width) * VEIL_WIDTH,
    y: ((clientY - rect.top) / rect.height) * VEIL_HEIGHT,
  }
}

function drawVeil(canvas: HTMLCanvasElement, particles: readonly VeilParticle[], gain: number) {
  let context: CanvasRenderingContext2D | null = null
  try {
    context = canvas.getContext("2d")
  } catch {
    context = null
  }
  if (!context) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  if (canvas.width !== VEIL_WIDTH * dpr) {
    canvas.width = VEIL_WIDTH * dpr
    canvas.height = VEIL_HEIGHT * dpr
  }
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, VEIL_WIDTH, VEIL_HEIGHT)
  const token = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
  context.fillStyle = token.length > 0 ? token : "rgba(80, 70, 180, 0.85)"
  const radius = 1.5 + gain * 1.7
  for (const particle of particles) {
    context.beginPath()
    context.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
    context.fill()
  }
}

export function ParticleVeilCaption({
  pace = 1,
  intensity = 0.7,
  sphere = true,
  caption = true,
  className,
  onValueChange,
}: ParticleVeilCaptionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<VeilParticle[]>([])
  const focusRef = useRef<{ x: number; y: number; active: boolean } | null>(null)
  const partingRef = useRef(false)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const density = veilDensity(gain)
  const playing = live && !reduced
  const created = createVeilParticles(density, sphere)
  const coreNow = veilNear(created, VEIL_WIDTH / 2, VEIL_HEIGHT / 2, veilCoreRadius(gain))
  const shapeKey = `${density}:${sphere ? 1 : 0}:${gain}`
  const [focus, setFocus] = useState<{ x: number; y: number } | null>(null)
  const [shape, setShape] = useState(shapeKey)
  const [sample, setSample] = useState({ core: coreNow, tick: 0, parting: false })
  if (shape !== shapeKey) {
    setShape(shapeKey)
    setSample({ core: coreNow, tick: 0, parting: false })
  }

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    const next = createVeilParticles(density, sphere)
    particlesRef.current = next
    const canvas = canvasRef.current
    if (canvas) drawVeil(canvas, next, gain)
  }, [density, sphere, gain])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const stepped = stepVeilParticles(particlesRef.current, focusRef.current, dt, paceRate, gain)
      particlesRef.current = stepped.particles
      if (stepped.parting !== partingRef.current) {
        partingRef.current = stepped.parting
        onValueRef.current?.({ parting: stepped.parting })
      }
      const canvas = canvasRef.current
      if (canvas) drawVeil(canvas, stepped.particles, gain)
      setSample((current) => ({
        core: veilNear(stepped.particles, VEIL_WIDTH / 2, VEIL_HEIGHT / 2, veilCoreRadius(gain)),
        tick: current.tick + 1,
        parting: stepped.parting,
      }))
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate, gain])

  function place(x: number, y: number, active: boolean) {
    const next = { x: clamp(x, 0, VEIL_WIDTH), y: clamp(y, 0, VEIL_HEIGHT), active }
    focusRef.current = active ? next : null
    setFocus(active ? { x: next.x, y: next.y } : null)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return
    const point = localPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
    place(point.x, point.y, true)
  }

  function onPointerLeave() {
    focusRef.current = null
    if (!reduced) setFocus(null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = focusRef.current ?? { x: VEIL_WIDTH / 2, y: VEIL_HEIGHT / 2, active: true }
    if (event.key === "ArrowRight") place(current.x + 18, current.y, true)
    else if (event.key === "ArrowLeft") place(current.x - 18, current.y, true)
    else if (event.key === "ArrowDown") place(current.x, current.y + 18, true)
    else if (event.key === "ArrowUp") place(current.x, current.y - 18, true)
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="particle-veil-caption"
      data-ritual="particle-veil"
      data-pace={paceRate}
      data-intensity={gain}
      data-sphere={sphere ? "on" : "off"}
      data-caption={caption ? "on" : "off"}
      data-density={density}
      data-core={sample.core}
      data-tick={sample.tick}
      data-parting={sample.parting ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-focus-x={focus ? Math.round(focus.x) : ""}
      data-focus-y={focus ? Math.round(focus.y) : ""}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      {caption ? (
        <p data-part="caption" className="pointer-events-none absolute inset-0 grid place-items-center text-2xl font-semibold text-foreground">
          Welcome ahead
        </p>
      ) : null}
      <motion.div
        data-part="stage"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
        className="relative h-48 w-full touch-none"
      >
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      </motion.div>
    </div>
  )
}
