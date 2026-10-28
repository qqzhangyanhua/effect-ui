"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ScratchLineFieldProps {
  threshold?: number
  brush?: number
  pace?: number
  className?: string
  children?: ReactNode
  onReveal?: () => void
}

const COLS = 24
const ROWS = 16

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function coverage(mask: Uint8Array) {
  let marked = 0
  for (let index = 0; index < mask.length; index += 1) marked += mask[index] ?? 0
  return marked / mask.length
}

function stamp(mask: Uint8Array, x: number, y: number, radius: number, width: number, height: number) {
  const cx = (x / width) * COLS
  const cy = (y / height) * ROWS
  const rx = Math.max(0.75, (radius / width) * COLS)
  const ry = Math.max(0.75, (radius / height) * ROWS)
  const x0 = Math.max(0, Math.floor(cx - rx))
  const x1 = Math.min(COLS - 1, Math.ceil(cx + rx))
  const y0 = Math.max(0, Math.floor(cy - ry))
  const y1 = Math.min(ROWS - 1, Math.ceil(cy + ry))
  for (let gy = y0; gy <= y1; gy += 1) {
    for (let gx = x0; gx <= x1; gx += 1) {
      const dx = (gx + 0.5 - cx) / rx
      const dy = (gy + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) mask[gy * COLS + gx] = 1
    }
  }
}

interface LocalPoint {
  x: number
  y: number
  width: number
  height: number
}

function localPoint(clientX: number, clientY: number, node: HTMLElement): LocalPoint {
  const rect = node.getBoundingClientRect()
  const width = rect.width > 0 ? rect.width : 320
  const height = rect.height > 0 ? rect.height : 180
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  return { x: clientX - left, y: clientY - top, width, height }
}

function paintFoil(context: CanvasRenderingContext2D, width: number, height: number) {
  context.globalCompositeOperation = "source-over"
  const wash = context.createLinearGradient(0, 0, width, height)
  wash.addColorStop(0, "#d6d3d1")
  wash.addColorStop(0.45, "#a8a29e")
  wash.addColorStop(1, "#78716c")
  context.fillStyle = wash
  context.fillRect(0, 0, width, height)
  context.strokeStyle = "rgba(255,255,255,0.28)"
  context.lineWidth = 2
  for (let band = -height; band < width + height; band += 14) {
    context.beginPath()
    context.moveTo(band, 0)
    context.lineTo(band + height * 0.6, height)
    context.stroke()
  }
}

export function ScratchLineField({
  threshold = 0.45,
  brush = 28,
  pace = 1,
  className,
  children,
  onReveal,
}: ScratchLineFieldProps) {
  const reduced = usePrefersReducedMotion()
  const limit = clamp(threshold, 0.05, 0.95)
  const radius = clamp(brush, 8, 96)
  const fade = 0.45 / rateOf(pace)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskRef = useRef(new Uint8Array(COLS * ROWS))
  const doneRef = useRef(false)
  const stopRef = useRef<(() => void) | null>(null)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"covered" | "scratching" | "revealed">("covered")
  const percent = Math.round(progress * 100)

  useEffect(() => () => stopRef.current?.(), [])

  useEffect(() => {
    if (reduced || phase === "revealed") return
    const canvas = canvasRef.current
    const node = rootRef.current
    if (!canvas || !node) return
    let context: CanvasRenderingContext2D | null = null
    try {
      context = canvas.getContext("2d")
    } catch {
      context = null
    }
    if (!context) return
    const rect = node.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 320
    const height = rect.height > 0 ? rect.height : 180
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.max(1, Math.floor(width * dpr))
    canvas.height = Math.max(1, Math.floor(height * dpr))
    context.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintFoil(context, width, height)
  }, [reduced, phase, radius])

  function scratch(from: LocalPoint, to: LocalPoint) {
    if (doneRef.current) return
    const dist = Math.hypot(to.x - from.x, to.y - from.y)
    const steps = Math.max(1, Math.ceil(dist / 8))
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps
      stamp(maskRef.current, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, radius, to.width, to.height)
    }
    const canvas = canvasRef.current
    if (canvas) {
      try {
        const context = canvas.getContext("2d")
        if (context) {
          context.globalCompositeOperation = "destination-out"
          context.fillStyle = "rgba(0,0,0,1)"
          context.beginPath()
          context.arc(to.x, to.y, radius, 0, Math.PI * 2)
          context.fill()
        }
      } catch {
        // jsdom 没有 2d 上下文时，进度仍由格子掩码计算。
      }
    }
    const next = coverage(maskRef.current)
    setProgress(next)
    if (next >= limit) {
      doneRef.current = true
      setPhase("revealed")
      onReveal?.()
      return
    }
    setPhase("scratching")
  }

  function revealNow() {
    if (doneRef.current) return
    doneRef.current = true
    maskRef.current.fill(1)
    setProgress(1)
    setPhase("revealed")
    onReveal?.()
  }

  function reset() {
    stopRef.current?.()
    maskRef.current = new Uint8Array(COLS * ROWS)
    doneRef.current = false
    setProgress(0)
    setPhase("covered")
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || doneRef.current || event.button !== 0) return
    const node = rootRef.current
    if (!node) return
    const pointerId = event.pointerId
    let last = localPoint(event.clientX, event.clientY, node)
    scratch(last, last)
    const move = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId || doneRef.current) return
      const next = localPoint(native.clientX, native.clientY, node)
      scratch(last, next)
      last = next
    }
    const stop = () => {
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

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement && event.target.closest("button")) return
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return
    event.preventDefault()
    revealNow()
  }

  const reward = children ?? (
    <div className="grid h-full place-items-center px-6 text-center">
      <div>
        <p className="font-display text-2xl tracking-tight text-card-foreground">一张留给你的纸条</p>
        <p className="mt-1 text-sm text-muted-foreground">涂层刮开之后，这句话才完整露出来。</p>
      </div>
    </div>
  )

  return (
    <div
      ref={rootRef}
      data-slot="scratch-line-field"
      data-threshold={limit}
      data-brush={radius}
      data-pace={pace}
      data-motion={reduced ? "off" : "on"}
      data-state={phase}
      data-progress={progress.toFixed(2)}
      data-layer="foil"
      tabIndex={0}
      role="group"
      aria-label="刮开涂层。Enter 或空格直接揭开。"
      aria-keyshortcuts="Enter Space"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      className={cn(
        "relative h-52 touch-none overflow-hidden rounded-3xl border border-border bg-card text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="刮开进度" className="sr-only">
        {percent}%
      </div>
      {reward}
      {reduced && phase !== "revealed" ? (
        <div className="absolute inset-0 grid place-items-center bg-muted/90">
          <button
            type="button"
            onClick={revealNow}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Reveal
          </button>
        </div>
      ) : null}
      {!reduced && phase !== "revealed" ? (
        <canvas
          ref={canvasRef}
          data-foil=""
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ transition: `opacity ${fade}s ease`, opacity: 1 }}
        />
      ) : null}
      {phase === "revealed" ? (
        <button
          type="button"
          onClick={reset}
          className="absolute right-3 bottom-3 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          重置
        </button>
      ) : null}
    </div>
  )
}
