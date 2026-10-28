"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface EyedropLoupePickProps {
  pace?: number
  intensity?: number
  grid?: number
  snap?: boolean
  className?: string
  onColorChange?: (tone: string) => void
}

const TONES = [
  { id: "clay", token: "chart-1", swatch: "bg-chart-1" },
  { id: "tide", token: "chart-2", swatch: "bg-chart-2" },
  { id: "leaf", token: "chart-3", swatch: "bg-chart-3" },
  { id: "dusk", token: "chart-4", swatch: "bg-chart-4" },
  { id: "ink", token: "chart-5", swatch: "bg-chart-5" },
  { id: "mist", token: "muted", swatch: "bg-muted" },
] as const

const FIELD_W = 320
const FIELD_H = 220

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

function gridOf(grid: number) {
  return clamp(Math.round(grid), 2, 5)
}

function toneAt(x: number, y: number, grid: number) {
  const g = gridOf(grid)
  const col = clamp(Math.floor(clamp(x, 0, 0.999) * g), 0, g - 1)
  const row = clamp(Math.floor(clamp(y, 0, 0.999) * g), 0, g - 1)
  return TONES[(row * g + col) % TONES.length] ?? TONES[0]
}

function cellCenter(x: number, y: number, grid: number) {
  const g = gridOf(grid)
  const col = clamp(Math.floor(clamp(x, 0, 0.999) * g), 0, g - 1)
  const row = clamp(Math.floor(clamp(y, 0, 0.999) * g), 0, g - 1)
  return { x: quantize((col + 0.5) / g), y: quantize((row + 0.5) / g) }
}

function zoomOf(intensity: number, reduced: boolean) {
  if (reduced) return 1
  return Math.round((1.35 + clamp(intensity, 0, 1) * 1.1) * 100) / 100
}

export function EyedropLoupePick({
  pace = 1,
  intensity = 0.6,
  grid = 3,
  snap = true,
  className,
  onColorChange,
}: EyedropLoupePickProps) {
  const dragRef = useRef(false)
  const onColorRef = useRef(onColorChange)
  const reduced = usePrefersReducedMotion()
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const cells = gridOf(grid)
  const [point, setPoint] = useState({ x: 0.5, y: 0.5 })
  const [phase, setPhase] = useState<"idle" | "sampling" | "locked">("idle")
  const [locked, setLocked] = useState("")
  const tone = toneAt(point.x, point.y, cells)
  const zoom = zoomOf(gain, reduced)
  const ring = Math.round(6 + gain * 10)
  const ease = reduced ? 0 : Math.round(180 / rate)

  useEffect(() => {
    onColorRef.current = onColorChange
  }, [onColorChange])

  function moveTo(x: number, y: number, nextPhase: "idle" | "sampling" | "locked") {
    const next = { x: quantize(x), y: quantize(y) }
    setPoint(next)
    setPhase(nextPhase)
    if (nextPhase !== "locked") setLocked("")
    onColorRef.current?.(toneAt(next.x, next.y, cells).id)
  }

  function readPoint(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : FIELD_W
    const height = rect.height > 0 ? rect.height : FIELD_H
    return {
      x: quantize((event.clientX - rect.left) / width),
      y: quantize((event.clientY - rect.top) / height),
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    const next = readPoint(event)
    moveTo(next.x, next.y, reduced ? "idle" : "sampling")
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
    const next = readPoint(event)
    moveTo(next.x, next.y, reduced ? "idle" : "sampling")
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    dragRef.current = false
    const next = readPoint(event)
    const landed = snap ? cellCenter(next.x, next.y, cells) : next
    moveTo(landed.x, landed.y, "idle")
  }

  function nudge(dx: number, dy: number) {
    const step = Math.round((1 / cells) * 100) / 100
    moveTo(point.x + dx * step, point.y + dy * step, "idle")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      nudge(1, 0)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      nudge(-1, 0)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(0, 1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(0, -1)
    }
  }

  function confirm() {
    setLocked(tone.id)
    setPhase("locked")
    onColorRef.current?.(tone.id)
  }

  const cellsView = Array.from({ length: cells * cells }, (_, index) => TONES[index % TONES.length] ?? TONES[0])

  return (
    <div
      data-slot="eyedrop-loupe-pick"
      data-ritual="loupe-pick"
      data-pace={rate}
      data-intensity={gain}
      data-grid={cells}
      data-snap={snap ? "on" : "off"}
      data-x={point.x.toFixed(2)}
      data-y={point.y.toFixed(2)}
      data-tone={tone.id}
      data-token={tone.token}
      data-zoom={zoom.toFixed(2)}
      data-ring={ring}
      data-locked={locked}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="application"
        aria-label="取色放大镜"
        tabIndex={0}
        data-part="field"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-56 touch-none overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))` }}>
          {cellsView.map((swatch, index) => (
            <div key={`${swatch.id}-${index}`} className={swatch.swatch} data-swatch={swatch.id} />
          ))}
        </div>
        <motion.div
          data-part="loupe"
          className="pointer-events-none absolute grid place-items-center rounded-full border-background bg-background motion-reduce:transition-none"
          style={{
            width: 88,
            height: 88,
            left: `${point.x * 100}%`,
            top: `${point.y * 100}%`,
            transform: "translate(-50%, -50%)",
            borderWidth: ring,
            borderStyle: "solid",
            borderColor: `var(--${tone.token})`,
            transition: reduced ? "none" : `left ${ease}ms linear, top ${ease}ms linear, border-color ${ease}ms linear`,
          }}
        >
          <div className="size-12 overflow-hidden rounded-full">
            <div
              className="grid h-full w-full"
              style={{
                gridTemplateColumns: `repeat(${cells}, minmax(0, 1fr))`,
                transform: `scale(${zoom})`,
                transformOrigin: `${point.x * 100}% ${point.y * 100}%`,
              }}
            >
              {cellsView.map((swatch, index) => (
                <div key={`zoom-${swatch.id}-${index}`} className={swatch.swatch} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p data-chip className="min-w-0 text-sm text-foreground">
          <span className="font-medium">{tone.id}</span>
          <span className="ml-2 text-muted-foreground">{`var(--${tone.token})`}</span>
        </p>
        <button type="button" onClick={confirm} className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground">
          Confirm
        </button>
      </div>
    </div>
  )
}
