"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"
import Matter from "matter-js"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DropFile {
  id: string
  name: string
}

export interface PhysicsDropzoneProps {
  files?: readonly DropFile[]
  onDrop?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_FILES: readonly DropFile[] = [
  { id: "brief", name: "简报.pdf" },
  { id: "shot", name: "封面.png" },
  { id: "notes", name: "笔记.md" },
]

interface Origin {
  id: string
  x: number
  y: number
}

interface Pose {
  x: number
  y: number
  tilt: number
  progress: number
}

interface Live {
  id: string
  name: string
  body: Matter.Body
  w: number
  h: number
  elapsed: number
}

function iconBox(value: number) {
  const w = Math.max(44, Math.round(value * 0.2))
  return { w, h: Math.round(w * 0.78) }
}

function PhysicsDropzone({
  files = DEFAULT_FILES,
  onDrop,
  color,
  size = 280,
  duration = 560,
  className,
}: PhysicsDropzoneProps) {
  const reduced = usePrefersReducedMotion()
  const [waiting, setWaiting] = useState<readonly DropFile[]>(files)
  const [order, setOrder] = useState<readonly string[]>([])
  const [labels, setLabels] = useState<Readonly<Record<string, string>>>({})
  const [poses, setPoses] = useState<Readonly<Record<string, Pose>>>({})
  const [drag, setDrag] = useState<Origin | null>(null)
  const [live, setLive] = useState(false)
  const zoneRef = useRef<HTMLDivElement>(null)
  const origin = useRef<Origin | null>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const bodiesRef = useRef<Live[]>([])
  const rafRef = useRef(0)
  const lastRef = useRef(0)
  const settled = useRef(new Set<string>())
  const onDropRef = useRef(onDrop)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const sizeRef = useRef(size)
  const accent = color ?? "var(--primary)"
  const box = iconBox(size)
  const zoneHeight = Math.round(size * 0.72)

  useEffect(() => {
    onDropRef.current = onDrop
    reducedRef.current = reduced
    durationRef.current = duration
    sizeRef.current = size
  })

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      const engine = engineRef.current
      engineRef.current = null
      if (!engine) return
      Matter.Composite.clear(engine.world, false)
      Matter.Engine.clear(engine)
    }
  }, [])

  function settle(id: string) {
    if (settled.current.has(id)) return
    settled.current.add(id)
    onDropRef.current?.(id)
  }

  function tick(now: number) {
    if (reducedRef.current) {
      rafRef.current = 0
      return
    }
    const engine = engineRef.current
    if (!engine) {
      rafRef.current = 0
      return
    }
    const dt = lastRef.current === 0 ? 16 : Math.min(32, Math.max(0, now - lastRef.current))
    lastRef.current = now
    const steps = Math.max(1, Math.round(dt / 16))
    for (let i = 0; i < steps; i += 1) Matter.Engine.update(engine, 16)
    const span = Math.max(160, durationRef.current)
    const next: Record<string, Pose> = {}
    let keep = false
    for (const item of bodiesRef.current) {
      item.elapsed += dt
      const progress = Math.min(100, Math.round((item.elapsed / span) * 100))
      next[item.id] = {
        x: item.body.position.x - item.w / 2,
        y: item.body.position.y - item.h / 2,
        tilt: item.body.angle * (180 / Math.PI),
        progress,
      }
      if (progress >= 100) settle(item.id)
      else keep = true
      const speed = Math.hypot(item.body.velocity.x, item.body.velocity.y)
      if (item.elapsed < span * 2 && speed > 0.25) keep = true
    }
    setPoses((prev) => ({ ...prev, ...next }))
    if (!keep) {
      rafRef.current = 0
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function ensureEngine() {
    const existing = engineRef.current
    if (existing) return existing
    const width = sizeRef.current
    const height = Math.round(width * 0.72)
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.8, scale: 0.002 } })
    const wall = 48
    const floor = Matter.Bodies.rectangle(width / 2, height - 4, width + wall, wall, { isStatic: true })
    const left = Matter.Bodies.rectangle(-wall / 2, height / 2, wall, height + wall, { isStatic: true })
    const right = Matter.Bodies.rectangle(width + wall / 2, height / 2, wall, height + wall, { isStatic: true })
    Matter.Composite.add(engine.world, [floor, left, right])
    engineRef.current = engine
    setLive(true)
    return engine
  }

  function rest(file: DropFile) {
    if (settled.current.has(file.id)) return
    const index = order.length
    const { w, h } = iconBox(sizeRef.current)
    const height = Math.round(sizeRef.current * 0.72)
    const col = index % 3
    const row = Math.floor(index / 3)
    setOrder((prev) => (prev.includes(file.id) ? prev : [...prev, file.id]))
    setLabels((prev) => ({ ...prev, [file.id]: file.name }))
    setPoses((prev) => ({
      ...prev,
      [file.id]: {
        x: 12 + col * (w + 8),
        y: Math.max(8, height - h - 10 - row * 12),
        tilt: (index - 1) * 4,
        progress: 100,
      },
    }))
    settle(file.id)
  }

  function drop(file: DropFile) {
    if (settled.current.has(file.id) || bodiesRef.current.some((item) => item.id === file.id)) return
    setWaiting((prev) => prev.filter((item) => item.id !== file.id))
    if (reducedRef.current) {
      rest(file)
      return
    }
    const engine = ensureEngine()
    const { w, h } = iconBox(sizeRef.current)
    const index = bodiesRef.current.length
    const body = Matter.Bodies.rectangle(sizeRef.current / 2 + (index % 2 === 0 ? -18 : 18), h, w, h, {
      chamfer: { radius: 6 },
      friction: 0.7,
      frictionAir: 0.04,
      restitution: 0.16,
    })
    Matter.Composite.add(engine.world, body)
    bodiesRef.current = [...bodiesRef.current, { id: file.id, name: file.name, body, w, h, elapsed: 0 }]
    setOrder((prev) => [...prev, file.id])
    setLabels((prev) => ({ ...prev, [file.id]: file.name }))
    setPoses((prev) => ({
      ...prev,
      [file.id]: { x: body.position.x - w / 2, y: body.position.y - h / 2, tilt: 0, progress: 0 },
    }))
    if (rafRef.current === 0) {
      lastRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    }
  }

  function insideZone(event: ReactPointerEvent, start: Origin) {
    const rect = zoneRef.current?.getBoundingClientRect()
    if (rect && rect.width > 0 && rect.height > 0) {
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
    }
    return event.clientY - start.y > 28
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    origin.current = { id, x: event.clientX, y: event.clientY }
    setDrag({ id, x: 0, y: 0 })
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    if (!start) return
    setDrag({ id: start.id, x: event.clientX - start.x, y: event.clientY - start.y })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    origin.current = null
    setDrag(null)
    if (!start) return
    if (!insideZone(event, start)) return
    const file = waiting.find((item) => item.id === start.id)
    if (!file) return
    drop(file)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, file: DropFile) {
    if (event.key !== "Enter" && event.key !== "ArrowDown") return
    event.preventDefault()
    drop(file)
  }

  return (
    <div className={cn("w-fit", className)} data-live={live ? "true" : undefined} data-reduced={reduced ? "true" : undefined} data-slot="physics-dropzone">
      <div className="flex flex-wrap gap-2">
        {waiting.map((file) => {
          const pulling = drag?.id === file.id
          return (
            <button
              className={cn(
                "touch-none rounded-lg border bg-card px-2 text-left text-xs text-card-foreground shadow-sm select-none motion-reduce:transition-none",
                pulling ? "relative z-10" : "",
              )}
              key={file.id}
              onKeyDown={(event) => onKeyDown(event, file)}
              onPointerCancel={() => {
                origin.current = null
                setDrag(null)
              }}
              onPointerDown={(event) => onPointerDown(event, file.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                borderColor: accent,
                height: box.h,
                transform: pulling && drag ? `translate(${drag.x}px, ${drag.y}px)` : undefined,
                width: box.w + 16,
              }}
              type="button"
            >
              {file.name}
            </button>
          )
        })}
      </div>
      <div
        aria-label="落点"
        className="relative mt-4 overflow-hidden rounded-2xl border border-dashed bg-muted/40"
        data-zone="true"
        ref={zoneRef}
        role="region"
        style={{ borderColor: accent, height: zoneHeight, width: size }}
      >
        {order.length === 0 ? (
          <p className="text-muted-foreground pointer-events-none absolute inset-0 grid place-items-center px-4 text-center text-sm">
            拖进这里，文件会落成一堆
          </p>
        ) : null}
        {order.map((id) => {
          const pose = poses[id]
          const label = labels[id]
          if (!pose || !label) return null
          return (
            <div
              className="absolute rounded-md border bg-card text-card-foreground shadow-sm motion-reduce:transition-none"
              data-pile="true"
              data-settled={pose.progress >= 100 ? "true" : undefined}
              key={id}
              style={{
                borderColor: accent,
                height: box.h,
                transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.tilt}deg)`,
                width: box.w,
              }}
            >
              <span className="block truncate px-1 pt-1 text-[10px] leading-tight">{label}</span>
              <span
                aria-label={label}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={pose.progress}
                className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded-full bg-muted"
                role="progressbar"
              >
                <span className="block h-full" style={{ background: accent, width: `${pose.progress}%` }} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { PhysicsDropzone }
