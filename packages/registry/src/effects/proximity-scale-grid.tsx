"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ProximityScaleGridProps {
  className?: string
}

const TILES = [
  "from-violet-500 to-indigo-400",
  "from-sky-400 to-cyan-300",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-500 to-pink-400",
  "from-lime-300 to-emerald-500",
  "from-rose-400 to-red-500",
  "from-blue-500 to-violet-400",
  "from-yellow-300 to-amber-500",
  "from-cyan-400 to-blue-600",
  "from-orange-300 to-rose-500",
  "from-teal-300 to-cyan-500",
]

function ProximityScaleGrid({ className }: ProximityScaleGridProps) {
  const reduced = usePrefersReducedMotion()
  const gridRef = React.useRef<HTMLDivElement>(null)

  const scaleTo = (x: number, y: number) => {
    const grid = gridRef.current
    if (!grid) return
    const cells = grid.querySelectorAll<HTMLElement>("[data-cell]")
    cells.forEach((cell) => {
      if (reduced) {
        cell.style.transform = "scale(1)"
        return
      }
      const rect = cell.getBoundingClientRect()
      const gridRect = grid.getBoundingClientRect()
      const cx = rect.left - gridRect.left + rect.width / 2
      const cy = rect.top - gridRect.top + rect.height / 2
      const distance = Math.hypot(cx - x, cy - y)
      const scale = 1 + Math.max(0, 1 - distance / 160) * 0.42
      cell.style.transform = `scale(${scale.toFixed(3)})`
    })
  }

  return (
    <div data-slot="proximity-scale-grid" className={cn("w-full space-y-2", className)}>
      <p className="text-xs text-muted-foreground">靠近指针的格子会变大。键盘聚焦时只放大当前格。</p>
      <div
        ref={gridRef}
        role="list"
        aria-label="邻近缩放网格"
        className="grid grid-cols-3 gap-3 sm:grid-cols-4"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          scaleTo(event.clientX - rect.left, event.clientY - rect.top)
        }}
        onPointerLeave={() => scaleTo(-999, -999)}
      >
        {TILES.map((tone, index) => (
          <button
            key={tone}
            type="button"
            data-cell=""
            className={cn(
              "h-16 rounded-xl bg-linear-to-br text-sm font-medium text-white outline-none transition-transform focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-primary",
              tone,
            )}
            onFocus={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const gridRect = gridRef.current?.getBoundingClientRect()
              if (!gridRect) return
              scaleTo(rect.left - gridRect.left + rect.width / 2, rect.top - gridRect.top + rect.height / 2)
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  )
}

export { ProximityScaleGrid }
