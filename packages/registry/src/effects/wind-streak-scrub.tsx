"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface WindStreakScrubProps {
  pace?: number
  intensity?: number
  span?: number
  play?: boolean
  className?: string
  onValueChange?: (t: number) => void
}

const START = 0.2
const FIELD_W = 320
const ANGLES = [24, 78, 132, 196, 248, 312] as const

type Particle = { x: number; y: number }

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number) {
  return Math.round(clamp(value, 0, 1) * 100) / 100
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function spanOf(span: number) {
  return clamp(Math.round(span), 3, 7)
}

export function windSample(t: number, intensity: number) {
  const u = clamp(t, 0, 1)
  const gain = clamp(intensity, 0, 1)
  const scaled = u * (ANGLES.length - 1)
  const index = Math.min(ANGLES.length - 2, Math.floor(scaled))
  const portion = scaled - index
  const left = ANGLES[index] ?? 24
  const right = ANGLES[index + 1] ?? left
  const angle = Math.round(left + (right - left) * portion)
  const speed = Math.round((0.28 + 0.72 * Math.sin(Math.PI * u)) * 100) / 100
  const density = Math.max(4, Math.round((6 + gain * 18) * (0.45 + speed)))
  return { angle, speed, density }
}

function clockOf(t: number) {
  const minutes = Math.round(6 * 60 + clamp(t, 0, 1) * 12 * 60)
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function spanLabels(span: number) {
  const count = spanOf(span)
  const labels: { t: number; text: string }[] = []
  for (let i = 0; i < count; i += 1) {
    const t = count === 1 ? 0 : i / (count - 1)
    labels.push({ t: quantize(t), text: clockOf(t) })
  }
  return labels
}

function seedParticles() {
  return Array.from({ length: 40 }, (_, i) => ({ x: ((i * 53) % 97) / 97, y: ((i * 29) % 89) / 89 }))
}

function staticLines(angle: number, density: number) {
  const count = Math.min(8, Math.max(4, Math.round(density / 4)))
  const rad = (angle * Math.PI) / 180
  const dx = Math.cos(rad) * 22
  const dy = Math.sin(rad) * 14
  return Array.from({ length: count }, (_, i) => {
    const x = 48 + (i % 4) * 64
    const y = 36 + Math.floor(i / 4) * 52
    return { x1: x, y1: y, x2: x + dx, y2: y + dy }
  })
}

export function WindStreakScrub({
  pace = 1,
  intensity = 0.65,
  span = 5,
  play = false,
  className,
  onValueChange,
}: WindStreakScrubProps) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frame = useRef(0)
  const particles = useRef<Particle[]>(seedParticles())
  const tRef = useRef(START)
  const playingRef = useRef(play)
  const dragRef = useRef(false)
  const everRef = useRef(false)
  const onValueRef = useRef(onValueChange)
  const rateRef = useRef(1)
  const gainRef = useRef(0.65)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const marks = spanLabels(span)
  const [t, setT] = useState(START)
  const [playKey, setPlayKey] = useState(play)
  const [override, setOverride] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<"idle" | "scrubbing" | "playing" | "paused">(play ? "playing" : "idle")
  if (playKey !== play) {
    setPlayKey(play)
    setOverride(null)
    setPhase(play && !reduced ? "playing" : "idle")
  }
  const playing = reduced ? false : (override ?? play)
  const sample = windSample(t, gain)
  const ease = reduced ? 0 : Math.round(180 / rate)

  function commit(next: number) {
    const value = quantize(next)
    tRef.current = value
    setT(value)
    onValueRef.current?.(value)
  }

  useEffect(() => {
    onValueRef.current = onValueChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
    gainRef.current = gain
    playingRef.current = playing
  }, [onValueChange, live, reduced, rate, gain, playing])

  useEffect(() => {
    if (reduced || !live) {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
      return
    }
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = 320
      canvas.height = 168
    }
    let last = 0
    const tick = (now: number) => {
      if (!liveRef.current || reducedRef.current) {
        frame.current = 0
        return
      }
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      last = now > 0 ? now : last
      const current = windSample(tRef.current, gainRef.current)
      const radBase = (current.angle * Math.PI) / 180
      for (const particle of particles.current) {
        const rad = radBase + Math.sin(particle.y * 6.2 + tRef.current * 3) * 0.28
        const speed = (0.08 + current.speed * 0.2) * rateRef.current * dt
        particle.x = (particle.x + Math.cos(rad) * speed + 1) % 1
        particle.y = (particle.y + Math.sin(rad) * speed * 0.55 + 1) % 1
      }
      let ctx: CanvasRenderingContext2D | null = null
      if (canvas && typeof CanvasRenderingContext2D === "function") {
        try {
          ctx = canvas.getContext("2d")
        } catch {
          ctx = null
        }
      }
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.lineWidth = 1.5
        ctx.strokeStyle = getComputedStyle(canvas).color
        ctx.globalAlpha = 0.35 + current.speed * 0.45
        const shown = Math.min(particles.current.length, current.density)
        for (let i = 0; i < shown; i += 1) {
          const particle = particles.current[i]
          if (!particle) continue
          const rad = radBase + Math.sin(particle.y * 6.2 + tRef.current * 3) * 0.28
          const len = 8 + (i % 4) * 3
          ctx.beginPath()
          ctx.moveTo(particle.x * canvas.width, particle.y * canvas.height)
          ctx.lineTo(particle.x * canvas.width + Math.cos(rad) * len, particle.y * canvas.height + Math.sin(rad) * len)
          ctx.stroke()
        }
      }
      if (playingRef.current && !dragRef.current) {
        const advanced = tRef.current + dt * 0.15 * rateRef.current
        const value = quantize(advanced > 1 ? advanced - 1 : advanced)
        tRef.current = value
        setT(value)
        onValueRef.current?.(value)
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [reduced, live])

  function toggle() {
    if (reducedRef.current) {
      commit(tRef.current + 0.25 > 1 ? tRef.current + 0.25 - 1 : tRef.current + 0.25)
      setPhase("idle")
      return
    }
    const next = !playing
    playingRef.current = next
    if (next) everRef.current = true
    setOverride(next)
    setPhase(dragRef.current ? "scrubbing" : next ? "playing" : everRef.current ? "paused" : "idle")
  }

  function readT(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : FIELD_W
    return quantize((event.clientX - rect.left) / width)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    commit(readT(event))
    setPhase(reducedRef.current ? "idle" : "scrubbing")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commit(readT(event))
    setPhase(reducedRef.current ? "idle" : "scrubbing")
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = false
    setPhase(playingRef.current ? "playing" : everRef.current ? "paused" : "idle")
  }

  function stepBy(direction: number) {
    commit(tRef.current + direction * 0.02)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      stepBy(1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      stepBy(-1)
    } else if (event.key === " " || event.key === "Spacebar") {
      event.preventDefault()
      toggle()
    }
  }

  const lines = staticLines(sample.angle, sample.density)

  return (
    <div
      ref={ref}
      data-slot="wind-streak-scrub"
      data-ritual="wind-field"
      data-pace={rate}
      data-intensity={gain}
      data-span={marks.length}
      data-play={play ? "on" : "off"}
      data-t={t.toFixed(2)}
      data-time={clockOf(t)}
      data-angle={sample.angle}
      data-speed={sample.speed.toFixed(2)}
      data-density={sample.density}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        data-part="field"
        className="relative h-44 overflow-hidden rounded-2xl border border-border bg-muted/50 text-chart-2"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        {reduced ? (
          <svg data-part="static-streaks" viewBox="0 0 320 168" className="h-full w-full" aria-hidden>
            {lines.map((line) => (
              <line key={`${line.x1}-${line.y1}`} data-streak x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="var(--chart-2)" strokeWidth={2} strokeLinecap="round" />
            ))}
          </svg>
        ) : (
          <canvas ref={canvasRef} data-part="particles" className="h-full w-full" aria-hidden />
        )}
        <div data-part="legend" className="absolute bottom-3 left-3 top-3 flex w-8 flex-col items-center gap-1" aria-hidden>
          <span className="text-[10px] text-foreground">{sample.speed.toFixed(2)}</span>
          <span className="relative w-1.5 flex-1 overflow-hidden rounded-full bg-background/80">
            <span data-legend className="absolute inset-x-0 bottom-0 rounded-full bg-chart-2" style={{ height: `${Math.round(sample.speed * 100)}%` }} />
          </span>
        </div>
        <p className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-1 text-xs text-foreground" role="status">
          {sample.angle}°
        </p>
      </div>
      <div data-part="labels" className="mt-3 flex justify-between gap-1">
        {marks.map((mark) => (
          <button
            key={mark.text}
            type="button"
            onClick={() => commit(mark.t)}
            className="rounded-full px-1.5 py-1 text-[10px] text-muted-foreground"
          >
            {mark.text}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={playing && !reduced ? "Pause" : "Play"}
          aria-pressed={playing && !reduced}
          onClick={toggle}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
        >
          {playing && !reduced ? "Pause" : "Play"}
        </button>
        <div
          role="slider"
          aria-label="风场时刻"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          aria-valuetext={clockOf(t)}
          tabIndex={0}
          data-part="track"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative h-8 flex-1 touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <motion.span
            data-part="thumb"
            className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border border-border bg-background motion-reduce:transition-none"
            style={{
              left: `${t * 100}%`,
              transform: "translate(-50%, -50%)",
              transition: reduced ? "none" : `left ${ease}ms linear`,
            }}
          />
        </div>
      </div>
      {reduced ? (
        <input
          type="range"
          aria-label="时刻"
          min={0}
          max={100}
          value={Math.round(t * 100)}
          onChange={(event) => {
            commit(Number(event.target.value) / 100)
            setPhase("idle")
          }}
          className="mt-2 w-full"
        />
      ) : null}
    </div>
  )
}
