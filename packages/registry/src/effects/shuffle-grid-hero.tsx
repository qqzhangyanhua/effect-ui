"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ShuffleTile {
  id: string
  label: string
  className: string
}

export interface ShuffleGridHeroProps {
  className?: string
  title?: string
  interval?: number
  tiles?: readonly ShuffleTile[]
}

const TILES: readonly ShuffleTile[] = [
  { id: "a", label: "01", className: "bg-[linear-gradient(145deg,#312e81,#6366f1)]" },
  { id: "b", label: "02", className: "bg-[linear-gradient(145deg,#0f766e,#2dd4bf)]" },
  { id: "c", label: "03", className: "bg-[linear-gradient(145deg,#9a3412,#fb923c)]" },
  { id: "d", label: "04", className: "bg-[linear-gradient(145deg,#831843,#fb7185)]" },
  { id: "e", label: "05", className: "bg-[linear-gradient(145deg,#1e3a8a,#38bdf8)]" },
  { id: "f", label: "06", className: "bg-[linear-gradient(145deg,#3f6212,#a3e635)]" },
  { id: "g", label: "07", className: "bg-[linear-gradient(145deg,#4c1d95,#c084fc)]" },
  { id: "h", label: "08", className: "bg-[linear-gradient(145deg,#713f12,#facc15)]" },
]

function shuffle<T>(items: readonly T[]) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    const other = next[swap]
    if (current === undefined || other === undefined) continue
    next[index] = other
    next[swap] = current
  }
  return next
}

function ShuffleGridHero({
  className,
  title = "版面自己换位",
  interval = 1800,
  tiles = TILES,
}: ShuffleGridHeroProps) {
  const reduced = usePrefersReducedMotion()
  const [order, setOrder] = React.useState(tiles)

  React.useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setOrder((current) => shuffle(current))
    }, interval)
    return () => window.clearInterval(id)
  }, [interval, reduced])

  return (
    <section
      data-slot="shuffle-grid-hero"
      className={cn(
        "grid w-full items-center gap-6 rounded-xl border bg-background p-6 md:grid-cols-[0.9fr_1.1fr]",
        className,
      )}
    >
      <div className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">Effect UI</p>
        <h2 className="font-display text-4xl tracking-tight">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          图片格按间隔打乱，位置用布局动画过渡。减弱动效时格子保持静止。
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {order.map((tile) => (
          <motion.div
            key={tile.id}
            layout
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "flex aspect-square items-end rounded-lg p-2 text-sm font-medium text-white",
              tile.className,
            )}
          >
            {tile.label}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export { ShuffleGridHero }
