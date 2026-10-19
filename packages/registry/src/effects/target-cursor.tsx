"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TargetCursorProps {
  className?: string
  children?: React.ReactNode
}

function TargetCursor({ className, children }: TargetCursorProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cursor = React.useRef({ x: 80, y: 80, w: 28, h: 28 })
  const target = React.useRef({ x: 80, y: 80, w: 28, h: 28 })
  const [box, setBox] = React.useState({ x: 80, y: 80, w: 28, h: 28 })

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let frame = 0
    const tick = () => {
      const ease = reduced ? 1 : 0.22
      cursor.current = {
        x: cursor.current.x + (target.current.x - cursor.current.x) * ease,
        y: cursor.current.y + (target.current.y - cursor.current.y) * ease,
        w: cursor.current.w + (target.current.w - cursor.current.w) * ease,
        h: cursor.current.h + (target.current.h - cursor.current.h) * ease,
      }
      setBox({ ...cursor.current })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const corner = "absolute size-3 border-primary"
  return (
    <div
      ref={rootRef}
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
          x: event.clientX - rect.left - 14,
          y: event.clientY - rect.top - 14,
          w: 28,
          h: 28,
        }
      }}
    >
      <div
        className="pointer-events-none absolute z-20"
        style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      >
        <span className={cn(corner, "top-0 left-0 border-t-2 border-l-2")} />
        <span className={cn(corner, "top-0 right-0 border-t-2 border-r-2")} />
        <span className={cn(corner, "bottom-0 left-0 border-b-2 border-l-2")} />
        <span className={cn(corner, "right-0 bottom-0 border-b-2 border-r-2")} />
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
