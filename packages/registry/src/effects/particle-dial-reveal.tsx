"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ParticleDialRevealProps {
  pace?: number
  density?: number
  intensity?: number
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  className?: string
  onValueChange?: (value: number) => void
}

const FONT: Record<string, readonly string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00100", "01100", "10100", "10100", "11111", "00100", "00100"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
}

interface Particle {
  x: number
  y: number
  tx: number
  ty: number
  sx: number
  sy: number
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function makeRand(seed: number) {
  let next = seed % 2147483647
  if (next <= 0) next += 2147483646
  return () => {
    next = (next * 16807) % 2147483647
    return (next - 1) / 2147483646
  }
}

function snapTo(raw: number, min: number, max: number, step: number) {
  const safeStep = step > 0 ? step : 1
  const low = Math.min(min, max)
  const high = Math.max(min, max)
  const steps = Math.round((raw - low) / safeStep)
  const next = low + steps * safeStep
  return Math.min(high, Math.max(low, Number(next.toFixed(4))))
}

function glyphPoints(text: string) {
  const points: { x: number; y: number }[] = []
  const span = text.length * 7 - 2
  for (let glyph = 0; glyph < text.length; glyph += 1) {
    const rows = FONT[text[glyph] ?? ""]
    if (!rows) continue
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) {
        if (row[x] === "1") points.push({ x: glyph * 7 + x - span / 2, y: y - 3 })
      }
    })
  }
  return points.length > 0 ? points : [{ x: 0, y: 0 }]
}

function handlePoint(value: number, min: number, max: number) {
  const span = max - min || 1
  const angle = Math.PI * (1 - (value - min) / span)
  return { x: 160 + Math.cos(angle) * 112, y: 150 - Math.sin(angle) * 112 }
}

export function ParticleDialReveal({
  pace = 1,
  density = 64,
  intensity = 0.7,
  min = 18,
  max = 80,
  step = 1,
  defaultValue = 32,
  className,
  onValueChange,
}: ParticleDialRevealProps) {
  const reduced = usePrefersReducedMotion()
  const low = Math.min(min, max)
  const high = Math.max(min, max)
  const stride = step > 0 && Number.isFinite(step) ? step : 1
  const grains = Math.round(clamp(density, 12, 160))
  const scatter = clamp(intensity, 0, 1)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const live = useAnimationActive(rootRef)
  const [value, setValue] = useState(() => snapTo(defaultValue, low, high, stride))
  const [phase, setPhase] = useState<"idle" | "dragging" | "settling">("idle")
  const valueRef = useRef(value)
  const dragRef = useRef(false)
  const stopRef = useRef<(() => void) | null>(null)
  const knob = handlePoint(value, low, high)

  useEffect(() => () => stopRef.current?.(), [])

  useEffect(() => {
    if (reduced || !live) return
    const canvas = canvasRef.current
    if (!canvas) return
    let context: CanvasRenderingContext2D | null = null
    try {
      context = canvas.getContext("2d")
    } catch {
      context = null
    }
    if (!context) return
    const rect = canvas.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 320
    const height = rect.height > 0 ? rect.height : 150
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(width * dpr))
    canvas.height = Math.max(1, Math.floor(height * dpr))
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    const points = glyphPoints(String(value))
    const rand = makeRand(grains * 17 + Math.round(value))
    const reach = scatter * Math.min(width, height) * 0.55
    const scale = Math.min(width, height) / 16
    const particles: Particle[] = Array.from({ length: grains }, (_, index) => {
      const point = points[index % points.length] ?? { x: 0, y: 0 }
      const tx = width / 2 + point.x * scale
      const ty = height / 2 + point.y * scale
      return {
        x: width / 2 + (rand() - 0.5) * reach,
        y: height / 2 + (rand() - 0.5) * reach,
        tx,
        ty,
        sx: (rand() - 0.5) * reach,
        sy: (rand() - 0.5) * reach,
      }
    })
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#44403c"
    const follow = Math.min(0.42, 0.14 * rateOf(pace))
    let frame = 0
    let frames = 0
    let running = true
    const tick = () => {
      if (!running) return
      frames += 1
      context.clearRect(0, 0, width, height)
      context.fillStyle = ink
      let energy = 0
      for (const particle of particles) {
        particle.sx *= 0.84
        particle.sy *= 0.84
        particle.x += (particle.tx + particle.sx - particle.x) * follow
        particle.y += (particle.ty + particle.sy - particle.y) * follow
        energy += Math.abs(particle.tx - particle.x) + Math.abs(particle.ty - particle.y) + Math.abs(particle.sx)
        context.beginPath()
        context.arc(particle.x, particle.y, 2.1, 0, Math.PI * 2)
        context.fill()
      }
      if (energy < 0.9 || frames > 180) {
        if (running && !dragRef.current) setPhase("idle")
        return
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      running = false
      window.cancelAnimationFrame(frame)
    }
  }, [reduced, live, value, grains, scatter, pace])

  function commit(raw: number) {
    const next = snapTo(raw, low, high, stride)
    if (next === valueRef.current) return
    valueRef.current = next
    setValue(next)
    onValueChange?.(next)
    if (!reduced) setPhase(dragRef.current ? "dragging" : "settling")
  }

  function valueFromPointer(clientX: number, clientY: number, node: Element) {
    const rect = node.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 320
    const height = rect.height > 0 ? rect.height : 190
    const left = rect.width > 0 ? rect.left : 0
    const top = rect.height > 0 ? rect.top : 0
    const cx = left + width * 0.5
    const cy = top + height * (150 / 190)
    const angle = Math.atan2(-(clientY - cy), clientX - cx)
    const clamped = Math.min(Math.PI, Math.max(0, angle))
    return snapTo(low + (1 - clamped / Math.PI) * (high - low), low, high, stride)
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return
    dragRef.current = true
    setPhase("dragging")
    commit(valueFromPointer(event.clientX, event.clientY, event.currentTarget))
    const pointerId = event.pointerId
    const node = event.currentTarget
    const move = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId) return
      commit(valueFromPointer(native.clientX, native.clientY, node))
    }
    const stop = () => {
      dragRef.current = false
      setPhase("settling")
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      if (stopRef.current === stop) stopRef.current = null
    }
    stopRef.current = stop
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const key = event.key
    if (key !== "ArrowRight" && key !== "ArrowUp" && key !== "ArrowLeft" && key !== "ArrowDown" && key !== "Home" && key !== "End") return
    event.preventDefault()
    if (key === "Home") commit(low)
    else if (key === "End") commit(high)
    else if (key === "ArrowRight" || key === "ArrowUp") commit(valueRef.current + stride)
    else commit(valueRef.current - stride)
  }

  const ticks = Array.from({ length: 7 }, (_, index) => {
    const amount = low + ((high - low) * index) / 6
    return handlePoint(amount, low, high)
  })

  return (
    <div
      ref={rootRef}
      data-slot="particle-dial-reveal"
      data-pace={pace}
      data-density={grains}
      data-intensity={scatter}
      data-motion={reduced ? "off" : "on"}
      data-particles={reduced ? "off" : "on"}
      data-state={phase}
      data-value={value}
      className={cn("mx-auto w-full max-w-sm space-y-2 motion-reduce:transition-none", className)}
    >
      <p className="text-center text-sm text-muted-foreground">年龄</p>
      <div className="relative h-44">
        {reduced ? (
          <p className="absolute inset-x-0 top-6 text-center font-display text-6xl tabular-nums text-foreground">{value}</p>
        ) : (
          <canvas ref={canvasRef} aria-hidden className="absolute inset-x-0 top-0 h-36 w-full motion-reduce:hidden" />
        )}
        <svg
          viewBox="0 0 320 190"
          role="slider"
          aria-label="年龄"
          aria-valuemin={low}
          aria-valuemax={high}
          aria-valuenow={value}
          aria-valuetext={`${value} 岁`}
          aria-orientation="horizontal"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          className="absolute inset-0 h-full w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <path d="M 48 150 A 112 112 0 0 1 272 150" fill="none" className="stroke-border" strokeWidth="8" strokeLinecap="round" />
          {ticks.map((tick, index) => (
            <circle key={index} cx={tick.x} cy={tick.y} r="2.5" className="fill-muted-foreground" />
          ))}
          <circle cx={knob.x} cy={knob.y} r="11" className="fill-primary stroke-background" strokeWidth="3" />
        </svg>
      </div>
      <div className="flex justify-between px-6 text-xs text-muted-foreground">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}
