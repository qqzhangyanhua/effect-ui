"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/backgrounds/core-strata.tsx

import { useEffect, useMemo, useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CoreStrataProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  duration?: number
  intensity?: number
  count?: number
}

const LOGICAL_W = 1200
const LOGICAL_H = 760
const PERIOD = LOGICAL_H * 1.4

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function smoothstep(t: number) {
  const c = clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
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

interface Band {
  y: number
  h: number
  tone: number
  mark: boolean
}

function buildModel(faultCount: number) {
  const rng = makeRng(7)
  const layers = [
    { speed: 12, dim: 0.35, every: 8 },
    { speed: 26, dim: 0.6, every: 5 },
    { speed: 46, dim: 1, every: 4 },
  ].map((layer) => {
    const bands: Band[] = []
    let y = 0
    while (y < PERIOD && bands.length < 80) {
      const h = 12 + rng() * 28
      bands.push({ y, h, tone: 0.3 + rng() * 0.7, mark: bands.length % layer.every === layer.every - 1 })
      y += h + 3
    }
    return { ...layer, bands }
  })
  const faults = Array.from({ length: faultCount }, (_, index) => {
    const x0 = LOGICAL_W * ((index + 0.5) / faultCount) + (rng() - 0.5) * 40
    return { x0: clamp(x0, 20, LOGICAL_W - 20), skew: (rng() - 0.5) * 70 }
  }).sort((a, b) => a.x0 - b.x0)
  const throws = faults.reduce<number[]>((list, _, index) => [...list, (list[index] ?? 0) + (rng() - 0.5) * 36], [0])
  return { layers, faults, throws }
}

export function CoreStrata({
  color = "var(--primary)",
  duration = 9000,
  intensity = 1,
  count = 3,
  className,
  children,
  ...props
}: CoreStrataProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elapsedRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const faults = clamp(Math.round(count), 1, 6)
  const model = useMemo(() => buildModel(faults), [faults])
  const moving = live && !reduced

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = rootRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let width = 1
    let height = 1
    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = wrap.clientWidth || 1
      height = wrap.clientHeight || 1
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const draw = (seconds: number) => {
      const ground = readColor(wrap, "var(--background)")
      const sediment = readColor(wrap, "var(--muted-foreground)")
      const marker = readColor(wrap, color)
      const seam = readColor(wrap, "var(--border)")
      ctx.fillStyle = ground
      ctx.fillRect(0, 0, width, height)
      const glow = clamp(intensity, 0.2, 1.6)
      const scale = Math.max(width / LOGICAL_W, height / LOGICAL_H)
      const offX = (width - LOGICAL_W * scale) / 2
      const offY = (height - LOGICAL_H * scale) / 2
      const px = (value: number) => value * scale + offX
      const py = (value: number) => value * scale + offY
      const tempo = 9000 / Math.max(1200, duration)
      const scan = ((seconds * tempo) % 9) / 9
      const sy = reduced
        ? LOGICAL_H * 0.62
        : LOGICAL_H * 0.08 + LOGICAL_H * 0.84 * (scan < 0.5 ? smoothstep(scan * 2) : smoothstep(2 - scan * 2))
      for (const layer of model.layers) {
        const offset = reduced ? 40 : (seconds * tempo * layer.speed) % PERIOD
        for (const band of layer.bands) {
          let y = band.y - offset
          if (y < -band.h) y += PERIOD
          for (let column = 0; column <= model.faults.length; column += 1) {
            const x0 = column === 0 ? 0 : model.faults[column - 1]?.x0 ?? 0
            const x1 = column === model.faults.length ? LOGICAL_W : model.faults[column]?.x0 ?? LOGICAL_W
            const by = y + (model.throws[column] ?? 0)
            const near = Math.abs(by + band.h / 2 - sy)
            const lit = Math.exp(-(near * near) / (2 * 46 * 46))
            ctx.fillStyle = band.mark
              ? withAlpha(marker, (0.2 + 0.7 * lit) * layer.dim * glow)
              : withAlpha(sediment, band.tone * 0.22 * layer.dim * glow)
            ctx.fillRect(px(x0), py(by), px(x1) - px(x0), band.h * scale)
          }
        }
      }
      for (const fault of model.faults) {
        ctx.strokeStyle = withAlpha(seam, 0.7)
        ctx.beginPath()
        ctx.moveTo(px(fault.x0), py(0))
        ctx.lineTo(px(fault.x0 + fault.skew), py(LOGICAL_H))
        ctx.stroke()
      }
      const beam = py(sy)
      ctx.fillStyle = withAlpha(marker, 0.85 * glow)
      ctx.fillRect(0, beam - 1, width, 2)
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
    else draw(elapsedRef.current)
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => {
      measure()
      if (!moving) draw(elapsedRef.current)
    })
    observer?.observe(wrap)
    return () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [color, duration, intensity, model, moving, reduced])

  return (
    <div
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      className={cn("relative isolate min-h-72 overflow-hidden rounded-xl border border-border bg-background motion-reduce:animate-none", className)}
      {...props}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--background)",
          backgroundImage:
            "repeating-linear-gradient(180deg, color-mix(in oklab, var(--muted-foreground) 18%, transparent) 0 10px, transparent 10px 22px, color-mix(in oklab, var(--primary) 35%, transparent) 22px 24px, transparent 24px 40px)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <p className="sr-only">Core strata</p>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}
