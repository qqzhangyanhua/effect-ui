"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LetterGlitchWallProps {
  className?: string
  rows?: number
  cols?: number
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*"

function cell() {
  return {
    char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "A",
    hue: Math.floor(Math.random() * 40) + 150,
  }
}

function LetterGlitchWall({ className, rows = 8, cols = 18 }: LetterGlitchWallProps) {
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return
    const id = window.setInterval(() => setTick((value) => value + 1), 80)
    return () => window.clearInterval(id)
  }, [])

  void tick
  const grid = Array.from({ length: rows * cols }, cell)

  return (
    <div
      className={cn("grid overflow-hidden rounded-xl border bg-zinc-950 p-3 font-mono text-xs", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {grid.map((item, index) => (
        <span key={index} className="text-center" style={{ color: `hsl(${item.hue} 80% 62%)` }}>
          {item.char}
        </span>
      ))}
    </div>
  )
}

export { LetterGlitchWall }
