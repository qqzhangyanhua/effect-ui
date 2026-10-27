"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CanvasTile {
  label: string
  tint: string
}

export interface InfiniteCanvasGalleryProps {
  tiles?: CanvasTile[]
  className?: string
  gap?: number
  size?: number
}

const defaultTiles: CanvasTile[] = [
  { label: "01", tint: "#312e81" },
  { label: "02", tint: "#7c3aed" },
  { label: "03", tint: "#22d3ee" },
  { label: "04", tint: "#f472b6" },
  { label: "05", tint: "#f59e0b" },
  { label: "06", tint: "#0f766e" },
]

const STEP = 168

function InfiniteCanvasGallery({ tiles = defaultTiles, className, gap, size }: InfiniteCanvasGalleryProps) {
  const reduced = usePrefersReducedMotion()
  const frameRef = React.useRef<HTMLDivElement>(null)
  const offsetRef = React.useRef({ x: 24, y: 16 })
  const velocity = React.useRef({ x: 0, y: 0 })
  const drag = React.useRef<{ x: number; y: number; ox: number; oy: number; lx: number; ly: number } | null>(null)
  const [offset, setOffset] = React.useState({ x: 24, y: 16 })
  const [viewport, setViewport] = React.useState({ w: 640, h: 360 })
  const step = gap === undefined || gap === STEP ? STEP : gap
  const tileCanonical = size === undefined || size === 160

  React.useEffect(() => {
    const element = frameRef.current
    if (!element) return
    const update = () => setViewport({ w: element.clientWidth, h: element.clientHeight })
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const publish = () => setOffset({ x: offsetRef.current.x, y: offsetRef.current.y })

  const coast = () => {
    if (reduced || drag.current) return
    const step = () => {
      if (drag.current) return
      if (Math.abs(velocity.current.x) < 0.2 && Math.abs(velocity.current.y) < 0.2) return
      offsetRef.current = {
        x: offsetRef.current.x + velocity.current.x,
        y: offsetRef.current.y + velocity.current.y,
      }
      velocity.current.x *= 0.94
      velocity.current.y *= 0.94
      publish()
      window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }

  const col0 = Math.floor(-offset.x / step) - 1
  const row0 = Math.floor(-offset.y / step) - 1
  const cols = Math.ceil(viewport.w / step) + 3
  const rows = Math.ceil(viewport.h / step) + 3
  const cells: { col: number; row: number }[] = []
  for (let row = row0; row < row0 + rows; row += 1) {
    for (let col = col0; col < col0 + cols; col += 1) cells.push({ col, row })
  }

  return (
    <div
      ref={frameRef}
      className={cn("relative h-80 cursor-grab overflow-hidden rounded-2xl border bg-zinc-950 active:cursor-grabbing", className)}
      style={{ touchAction: "none" }}
      onPointerDown={(event) => {
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          ox: offsetRef.current.x,
          oy: offsetRef.current.y,
          lx: event.clientX,
          ly: event.clientY,
        }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const current = drag.current
        if (!current) return
        const next = {
          x: current.ox + event.clientX - current.x,
          y: current.oy + event.clientY - current.y,
        }
        velocity.current = { x: event.clientX - current.lx, y: event.clientY - current.ly }
        current.lx = event.clientX
        current.ly = event.clientY
        offsetRef.current = next
        publish()
      }}
      onPointerUp={() => {
        drag.current = null
        coast()
      }}
    >
      {cells.map(({ col, row }) => {
        const tile = tiles[Math.abs((col * 3 + row * 5) % tiles.length)] ?? tiles[0]
        if (!tile) return null
        return (
          <div
            key={`${col}:${row}`}
            className={
              tileCanonical
                ? "absolute grid size-40 place-items-end rounded-xl p-3 text-sm text-white"
                : "absolute grid place-items-end rounded-xl p-3 text-sm text-white"
            }
            style={{
              transform: `translate(${col * step + offset.x}px, ${row * step + offset.y}px)`,
              background: `linear-gradient(160deg, ${tile.tint}, #09090b)`,
              ...(tileCanonical || size === undefined ? {} : { width: size, height: size }),
            }}
          >
            {tile.label}
          </div>
        )
      })}
    </div>
  )
}

export { InfiniteCanvasGallery }
