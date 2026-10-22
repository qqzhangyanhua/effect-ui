"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/backgrounds/copperplate-hatch.tsx

import { useEffect, useRef, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CopperplateHatchProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  duration?: number
  intensity?: number
  speed?: number
}

const ANGLES = [32, -32, 90].map((angle) => (angle * Math.PI) / 180)
const STILL = 7.3

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function makeRng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function readColor(host: HTMLElement, value: string) {
  const probe = document.createElement("span")
  probe.style.color = value
  host.appendChild(probe)
  const resolved = getComputedStyle(probe).color
  probe.remove()
  return resolved
}

function withAlpha(color: string, alpha: number) {
  const parts = color.match(/[\d.]+/g)
  if (!parts || parts.length < 3) return color
  return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${clamp(alpha, 0, 1)})`
}

interface Stroke {
  x: number
  y: number
  layer: number
  base: number
}

function buildStrokes(width: number, height: number, density: number) {
  const rng = makeRng(31)
  const step = clamp(24 / Math.max(0.4, density), 14, 40)
  const half = step * 0.46
  const harm = [
    { f: 0.006 + rng() * 0.004, a: 0.22, p: rng() * Math.PI * 2 },
    { f: 0.009 + rng() * 0.004, a: 0.16, p: rng() * Math.PI * 2 },
  ]
  const strokes: Stroke[] = []
  for (let layer = 0; layer < 3; layer += 1) {
    const cap = [420, 300, 180][layer] ?? 180
    let drawn = 0
    for (let y = 0; y < height + step && drawn < cap; y += step) {
      const offset = (Math.round(y / step) % 2) * step * 0.5
      for (let x = offset; x < width + step && drawn < cap; x += step) {
        let tone = 0
        for (const wave of harm) tone += wave.a * (0.5 + 0.5 * Math.sin(x * wave.f + y * wave.f * 0.7 + wave.p))
        strokes.push({ x, y, layer, base: tone })
        drawn += 1
      }
    }
  }
  return { strokes, half }
}

export function CopperplateHatch({
  color = "var(--primary)",
  duration = 8000,
  intensity = 1,
  speed = 1,
  className,
  children,
  ...props
}: CopperplateHatchProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0, y: 0, on: false })
  const elapsedRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced && speed > 0

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = rootRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let width = 1
    let height = 1
    let field = buildStrokes(1, 1, 1)
    let lightX = 0
    let lightY = 0
    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = wrap.clientWidth || 1
      height = wrap.clientHeight || 1
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      field = buildStrokes(width, height, 1)
      lightX = width * 0.62
      lightY = height * 0.42
    }
    const draw = (seconds: number) => {
      const ink = readColor(wrap, "var(--foreground)")
      const glint = readColor(wrap, color)
      const ground = readColor(wrap, "var(--background)")
      ctx.fillStyle = ground
      ctx.fillRect(0, 0, width, height)
      const pointer = pointerRef.current
      const targetX = pointer.on ? pointer.x : width * 0.62
      const targetY = pointer.on ? pointer.y : height * 0.42
      lightX += (targetX - lightX) * (reduced ? 1 : 0.08)
      lightY += (targetY - lightY) * (reduced ? 1 : 0.08)
      const tempo = (seconds * clamp(speed, 0, 4) * 8000) / Math.max(400, duration)
      const span = Math.hypot(width, height) * 0.75 + 300
      const waveA = ((tempo * 130) % span) - 100
      const waveB = ((tempo * 130 + span / 2) % span) - 100
      const glow = clamp(intensity, 0, 1.6)
      for (const stroke of field.strokes) {
        const dx = stroke.x - lightX
        const dy = stroke.y - lightY
        const distance = Math.hypot(dx, dy)
        const near = Math.exp(-(distance * distance) / (2 * 260 * 260))
        if (stroke.base + near * 1.1 < 0.34 + stroke.layer * 0.3) continue
        const glintA = Math.exp(-((distance - waveA) ** 2) / (2 * 70 * 70))
        const glintB = Math.exp(-((distance - waveB) ** 2) / (2 * 70 * 70))
        const spark = Math.max(glintA, glintB * 0.7)
        const angle = ANGLES[stroke.layer] ?? 0
        const dxs = Math.cos(angle) * field.half
        const dys = Math.sin(angle) * field.half
        ctx.strokeStyle = spark > 0.05 ? withAlpha(glint, (0.2 + spark) * glow) : withAlpha(ink, (0.08 + near * 0.12) * glow)
        ctx.lineWidth = 1.1 + spark * 1.2
        ctx.beginPath()
        ctx.moveTo(stroke.x - dxs, stroke.y - dys)
        ctx.lineTo(stroke.x + dxs, stroke.y + dys)
        ctx.stroke()
      }
    }
    measure()
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      elapsedRef.current += dt
      draw(elapsedRef.current)
      raf = requestAnimationFrame(loop)
    }
    if (moving) raf = requestAnimationFrame(loop)
    else draw(reduced ? STILL : elapsedRef.current || STILL)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      measure()
      if (!moving) draw(reduced ? STILL : elapsedRef.current || STILL)
    })
    observer?.observe(wrap)
    return () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [color, duration, intensity, speed, moving, reduced])

  const place = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top, on: true }
  }

  return (
    <div
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      onPointerDown={place}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" && event.buttons === 0) return
        place(event)
      }}
      className={cn("relative isolate min-h-72 overflow-hidden rounded-xl border border-border bg-background motion-reduce:animate-none", className)}
      {...props}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage: `repeating-linear-gradient(32deg, transparent, transparent 7px, color-mix(in oklab, var(--foreground) 16%, transparent) 7px, color-mix(in oklab, var(--foreground) 16%, transparent) 8px), repeating-linear-gradient(-32deg, transparent, transparent 9px, color-mix(in oklab, ${color} 30%, transparent) 9px, color-mix(in oklab, ${color} 30%, transparent) 10px)`,
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <p className="sr-only">Copperplate hatch</p>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}
