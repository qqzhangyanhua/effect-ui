"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ScatterPhotoDragProps {
  intensity?: number
  pace?: number
  count?: number
  gap?: number
  className?: string
  onMove?: (id: string) => void
}

interface Photo {
  id: string
  label: string
  x: number
  y: number
  rotate: number
  z: number
}

interface Drag {
  id: string
  originX: number
  originY: number
  pointerX: number
  pointerY: number
  lastX: number
  lastY: number
  vx: number
  vy: number
}

const tones = ["bg-primary", "bg-accent", "bg-secondary", "bg-muted", "bg-primary/70", "bg-accent/80", "bg-secondary/80", "bg-muted-foreground/30"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 6, 8)
}

function mulberry32(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function layout(count: number, intensity: number, gap: number, seed: number): Photo[] {
  const rand = mulberry32(seed * 97 + count * 13 + Math.round(gap * 10))
  const spread = 28 + intensity * 80 + gap * 0.35
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index + 1}`,
    label: String(index + 1).padStart(2, "0"),
    x: (rand() - 0.5) * spread * 2,
    y: (rand() - 0.5) * spread * 1.15,
    rotate: (rand() - 0.5) * 32 * Math.max(intensity, 0.15),
    z: index + 1,
  }))
}

export function ScatterPhotoDrag({ intensity = 0.7, pace = 1, count = 6, gap = 12, className, onMove }: ScatterPhotoDragProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const token = useRef(0)
  const liveRef = useRef(false)
  const dragRef = useRef<Drag | null>(null)
  const onMoveRef = useRef(onMove)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const space = clamp(gap, 0, 48)
  const [seed, setSeed] = useState(1)
  const signature = `${total}:${gain.toFixed(3)}:${space}:${seed}`
  const [epoch, setEpoch] = useState(signature)
  const [photos, setPhotos] = useState(() => layout(total, gain, space, seed))
  const [active, setActive] = useState<string | null>(null)
  const [phase, setPhase] = useState<"scattered" | "dragging" | "resting">("scattered")
  const [inertia, setInertia] = useState<"off" | "on">("off")

  if (epoch !== signature) {
    setEpoch(signature)
    setPhotos(layout(total, gain, space, seed))
    setActive(null)
    setPhase("scattered")
    setInertia("off")
  }

  useEffect(() => {
    onMoveRef.current = onMove
  }, [onMove])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    token.current += 1
    queueMicrotask(() => {
      if (!liveRef.current) setInertia("off")
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function update(id: string, patch: Partial<Photo>) {
    setPhotos((current) => current.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)))
  }

  function raise(id: string) {
    setPhotos((current) => {
      const top = current.reduce((max, photo) => Math.max(max, photo.z), 0) + 1
      return current.map((photo) => (photo.id === id ? { ...photo, z: top } : photo))
    })
  }

  function reset() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    token.current += 1
    dragRef.current = null
    setInertia("off")
    setActive(null)
    setSeed((current) => current + 1)
  }

  function coast(drag: Drag) {
    const generation = token.current
    let vx = drag.vx
    let vy = drag.vy
    let x = drag.lastX
    let y = drag.lastY
    const keep = clamp(0.9 - rate * 0.06, 0.72, 0.92)
    const tick = () => {
      if (generation !== token.current || !liveRef.current) {
        setInertia("off")
        return
      }
      vx *= keep
      vy *= keep
      x += vx
      y += vy
      update(drag.id, { x, y })
      if (Math.hypot(vx, vy) < 0.6) {
        setInertia("off")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    setInertia("on")
    frame.current = window.requestAnimationFrame(tick)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>, photo: Photo) {
    if (event.button !== undefined && event.button !== 0) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    token.current += 1
    setInertia("off")
    dragRef.current = {
      id: photo.id,
      originX: photo.x,
      originY: photo.y,
      pointerX: event.clientX,
      pointerY: event.clientY,
      lastX: photo.x,
      lastY: photo.y,
      vx: 0,
      vy: 0,
    }
    setActive(photo.id)
    setPhase("dragging")
    raise(photo.id)
    onMoveRef.current?.(photo.id)
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    const nextX = drag.originX + (event.clientX - drag.pointerX)
    const nextY = drag.originY + (event.clientY - drag.pointerY)
    drag.vx = nextX - drag.lastX
    drag.vy = nextY - drag.lastY
    drag.lastX = nextX
    drag.lastY = nextY
    update(drag.id, { x: nextX, y: nextY })
  }

  function onPointerUp() {
    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    setActive(null)
    setPhase("resting")
    const speed = Math.hypot(drag.vx, drag.vy)
    if (reduced || !liveRef.current || speed < 4) {
      setInertia("off")
      return
    }
    coast(drag)
  }

  function nudge(photo: Photo, dx: number, dy: number, rotate = 0) {
    update(photo.id, { x: photo.x + dx, y: photo.y + dy, rotate: photo.rotate + rotate })
    setPhase("resting")
    onMoveRef.current?.(photo.id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, photo: Photo) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      nudge(photo, 12, 0)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      nudge(photo, -12, 0)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(photo, 0, -12)
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(photo, 0, 12)
    } else if (event.key === "]") {
      event.preventDefault()
      nudge(photo, 0, 0, 8)
    } else if (event.key === "[") {
      event.preventDefault()
      nudge(photo, 0, 0, -8)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="scatter-photo-drag"
      data-ritual="scatter-photo"
      data-intensity={gain}
      data-pace={rate}
      data-count={photos.length}
      data-gap={space}
      data-seed={seed}
      data-state={phase}
      data-inertia={reduced ? "off" : inertia}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-80 overflow-hidden rounded-2xl border border-border bg-background">
        <div className="absolute top-1/2 left-1/2 h-0 w-0">
          {photos.map((photo, index) => {
            const tone = tones[index] ?? "bg-primary"
            const lifted = active === photo.id
            const transform = `translate(calc(-50% + ${photo.x.toFixed(1)}px), calc(-50% + ${photo.y.toFixed(1)}px)) rotate(${photo.rotate.toFixed(1)}deg) scale(${lifted && !reduced ? 1.06 : 1})`
            return (
              <div
                key={photo.id}
                role="group"
                aria-label={`照片 ${photo.label}`}
                tabIndex={0}
                data-photo={photo.id}
                data-x={photo.x.toFixed(1)}
                data-y={photo.y.toFixed(1)}
                data-rotate={photo.rotate.toFixed(1)}
                data-z={photo.z}
                data-lift={lifted ? "on" : "off"}
                onPointerDown={(event) => onPointerDown(event, photo)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={(event) => onKeyDown(event, photo)}
                onDoubleClick={reset}
                className={cn(
                  "absolute flex h-36 w-28 touch-none select-none flex-col justify-between rounded-2xl border border-border p-3 text-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
                  tone,
                )}
                style={{ transform, zIndex: photo.z }}
              >
                <span className="font-display text-2xl">{photo.label}</span>
                <span className="text-xs text-muted-foreground">拖动</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-3">
        <button type="button" onClick={reset} className="rounded-full border border-border px-3 py-1.5 text-sm">
          重散
        </button>
      </div>
    </div>
  )
}
