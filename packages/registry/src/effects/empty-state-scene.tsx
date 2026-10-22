"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScenePiece {
  id: string
  label: string
}

export interface EmptyStateSceneProps {
  pieces?: readonly ScenePiece[]
  onNudge?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_PIECES: readonly ScenePiece[] = [
  { id: "box", label: "空盒子" },
  { id: "plane", label: "纸飞机" },
  { id: "glass", label: "放大镜" },
]

const SHAPES = ["box", "plane", "glass"] as const

type Shape = (typeof SHAPES)[number]

interface Point {
  x: number
  y: number
}

interface Drag {
  id: string
  x: number
  y: number
  ox: number
  oy: number
}

function shapeOf(index: number): Shape {
  return SHAPES[index % SHAPES.length] ?? "box"
}

function anchorOf(index: number, count: number): Point {
  if (count === 3) {
    const spots: readonly Point[] = [
      { x: 0.24, y: 0.68 },
      { x: 0.74, y: 0.5 },
      { x: 0.46, y: 0.58 },
    ]
    return spots[index] ?? { x: 0.5, y: 0.5 }
  }
  const col = index % 3
  const row = Math.floor(index / 3)
  return { x: 0.22 + col * 0.26, y: 0.36 + row * 0.24 }
}

function PieceGlyph({ shape }: { shape: Shape }) {
  if (shape === "plane") {
    return <span aria-hidden className="block h-0 w-0 border-y-[9px] border-l-[16px] border-y-transparent border-l-current" />
  }
  if (shape === "glass") {
    return (
      <span aria-hidden className="relative block h-8 w-8 rounded-full border-2 border-current">
        <span className="absolute -right-2 bottom-0 h-3 w-1 rotate-45 rounded-full bg-current" />
      </span>
    )
  }
  return <span aria-hidden className="block h-8 w-10 rounded-md border-2 border-current" />
}

function EmptyStateScene({
  pieces = DEFAULT_PIECES,
  onNudge,
  color,
  size = 320,
  duration = 2400,
  className,
}: EmptyStateSceneProps) {
  const reduced = usePrefersReducedMotion()
  const [offsets, setOffsets] = useState<Readonly<Record<string, Point>>>({})
  const [clock, setClock] = useState(0)
  const drag = useRef<Drag | null>(null)
  const onNudgeRef = useRef(onNudge)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  useEffect(() => {
    onNudgeRef.current = onNudge
    reducedRef.current = reduced
    durationRef.current = duration
  })

  useEffect(() => {
    if (reduced) return
    let raf = 0
    let last = 0
    const step = (now: number) => {
      if (reducedRef.current) return
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      const active = drag.current?.id
      setOffsets((prev) => {
        const ids = Object.keys(prev)
        if (ids.length === 0) return prev
        let changed = false
        const next: Record<string, Point> = {}
        const keep = Math.exp(-dt / Math.max(180, durationRef.current * 0.45))
        for (const id of ids) {
          const point = prev[id]
          if (!point) continue
          if (id === active) {
            next[id] = point
            continue
          }
          const x = Math.abs(point.x * keep) < 0.4 ? 0 : point.x * keep
          const y = Math.abs(point.y * keep) < 0.4 ? 0 : point.y * keep
          if (x !== point.x || y !== point.y) changed = true
          if (x !== 0 || y !== 0) next[id] = { x, y }
        }
        return changed ? next : prev
      })
      setClock((value) => value + dt)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  const accent = color ?? "var(--primary)"
  const list = pieces
  const amplitude = Math.max(6, size * 0.04)

  function place(id: string, x: number, y: number) {
    setOffsets((prev) => ({ ...prev, [id]: { x, y } }))
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const origin = offsets[id] ?? { x: 0, y: 0 }
    drag.current = { id, x: event.clientX, y: event.clientY, ox: origin.x, oy: origin.y }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    const current = drag.current
    if (!current || current.id !== id) return
    place(id, current.ox + (event.clientX - current.x), current.oy + (event.clientY - current.y))
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    const current = drag.current
    if (!current || current.id !== id) return
    drag.current = null
    const x = current.ox + (event.clientX - current.x)
    const y = current.oy + (event.clientY - current.y)
    place(id, x, y)
    if (Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8) return
    onNudgeRef.current?.(id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const step = 20
    const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0
    const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0
    if (dx === 0 && dy === 0) return
    event.preventDefault()
    const origin = offsets[id] ?? { x: 0, y: 0 }
    place(id, origin.x + dx, origin.y + dy)
    onNudgeRef.current?.(id)
  }

  return (
    <div
      className={cn("mx-auto", className)}
      data-floating={reduced ? undefined : "true"}
      data-reduced={reduced ? "true" : undefined}
      data-slot="empty-state-scene"
      style={{ width: size }}
    >
      <div
        className="border-border bg-muted/40 relative rounded-3xl border border-dashed"
        style={{ height: Math.round(size * 0.78) }}
      >
        <p className="text-foreground absolute inset-x-0 top-4 text-center text-sm font-medium">还没有内容</p>
        <p className="text-muted-foreground absolute inset-x-0 top-10 text-center text-xs">把零件轻轻拨开</p>
        {list.map((piece, index) => {
          const anchor = anchorOf(index, list.length)
          const offset = offsets[piece.id] ?? { x: 0, y: 0 }
          const bob = reduced ? 0 : Math.sin((clock / Math.max(1, duration)) * Math.PI * 2 + index * 1.3) * amplitude
          return (
            <button
              className="bg-card text-card-foreground absolute flex touch-none flex-col items-center gap-1 rounded-2xl border px-3 py-2 text-xs shadow-sm select-none motion-reduce:transition-none"
              key={piece.id}
              onKeyDown={(event) => onKeyDown(event, piece.id)}
              onPointerCancel={() => {
                drag.current = null
              }}
              onPointerDown={(event) => onPointerDown(event, piece.id)}
              onPointerMove={(event) => onPointerMove(event, piece.id)}
              onPointerUp={(event) => onPointerUp(event, piece.id)}
              style={{
                borderColor: accent,
                left: `${anchor.x * 100}%`,
                top: `${anchor.y * 100}%`,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y + bob}px))`,
              }}
              type="button"
            >
              <span style={{ color: accent }}>
                <PieceGlyph shape={shapeOf(index)} />
              </span>
              {piece.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { EmptyStateScene }
