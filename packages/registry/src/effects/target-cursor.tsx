"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface TargetCursorProps {
  className?: string
  children?: React.ReactNode
  size?: number
  color?: string
  speed?: number
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function TargetCursor({ className, children, size = 28, color, speed, intensity }: TargetCursorProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cursor = React.useRef({ x: 80, y: 80, w: size, h: size })
  const target = React.useRef({ x: 80, y: 80, w: size, h: size })
  const [box, setBox] = React.useState({ x: 80, y: 80, w: size, h: size })
  const active = useAnimationActive(rootRef)
  const activeRef = React.useRef(false)
  const kickRef = React.useRef<(() => void) | null>(null)
  const speedRef = React.useRef(pace(speed))
  const keepCorner = intensity === undefined || intensity === 1

  React.useEffect(() => {
    speedRef.current = pace(speed)
  }, [speed])

  React.useEffect(() => {
    activeRef.current = active
    if (active) kickRef.current?.()
  }, [active])

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const tick = () => {
      if (!activeRef.current) {
        frame = 0
        return
      }
      const ease = reduced ? 1 : Math.min(1, 0.22 * speedRef.current)
      cursor.current = {
        x: cursor.current.x + (target.current.x - cursor.current.x) * ease,
        y: cursor.current.y + (target.current.y - cursor.current.y) * ease,
        w: cursor.current.w + (target.current.w - cursor.current.w) * ease,
        h: cursor.current.h + (target.current.h - cursor.current.h) * ease,
      }
      setBox({ ...cursor.current })
      frame = window.requestAnimationFrame(tick)
    }
    kickRef.current = () => {
      if (activeRef.current && frame === 0) frame = window.requestAnimationFrame(tick)
    }
    kickRef.current()
    return () => {
      kickRef.current = null
      window.cancelAnimationFrame(frame)
    }
  }, [])

  const corner = cn("absolute border-primary", keepCorner && "size-3")
  const cornerSize = keepCorner ? undefined : 12 * (intensity ?? 1)
  return (
    <div
      ref={rootRef}
      data-slot="target-cursor"
      className={cn("relative min-h-56 overflow-hidden rounded-xl border bg-muted/30 p-8", className)}
      onPointerMove={(event) => {
        const root = rootRef.current
        if (!root) return
        const rect = root.getBoundingClientRect()
        const hit = (event.target as HTMLElement).closest("[data-target]")
        if (hit) {
          const boxRect = hit.getBoundingClientRect()
          target.current = {
            x: boxRect.left - rect.left,
            y: boxRect.top - rect.top,
            w: boxRect.width,
            h: boxRect.height,
          }
          return
        }
        target.current = {
          x: event.clientX - rect.left - size / 2,
          y: event.clientY - rect.top - size / 2,
          w: size,
          h: size,
        }
      }}
    >
      <div
        className="pointer-events-none absolute z-20"
        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      >
        <span className={cn(corner, "top-0 left-0 border-t-2 border-l-2")} style={{ width: cornerSize, height: cornerSize, borderColor: color }} />
        <span className={cn(corner, "top-0 right-0 border-t-2 border-r-2")} style={{ width: cornerSize, height: cornerSize, borderColor: color }} />
        <span className={cn(corner, "bottom-0 left-0 border-b-2 border-l-2")} style={{ width: cornerSize, height: cornerSize, borderColor: color }} />
        <span className={cn(corner, "right-0 bottom-0 border-b-2 border-r-2")} style={{ width: cornerSize, height: cornerSize, borderColor: color }} />
      </div>
      {children ?? (
        <div className="flex flex-wrap gap-3">
          <button data-target className="rounded-md border bg-background px-4 py-2 text-sm">
            目标 A
          </button>
          <button data-target className="rounded-md border bg-background px-4 py-2 text-sm">
            目标 B
          </button>
          <button data-target className="rounded-md border bg-background px-4 py-2 text-sm">
            目标 C
          </button>
        </div>
      )}
    </div>
  )
}

export { TargetCursor }
