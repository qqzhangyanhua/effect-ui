"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { cn } from "@/lib/utils"

export interface LetterGlitchWallProps {
  className?: string
  rows?: number
  cols?: number
  speed?: number
  color?: string
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*"

function cell() {
  return {
    char: GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "A",
    hue: Math.floor(Math.random() * 40) + 150,
  }
}

function LetterGlitchWall({
  className,
  rows = 8,
  cols = 18,
  speed = 1,
  color,
}: LetterGlitchWallProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const active = useAnimationActive(hostRef)
  const [tick, setTick] = React.useState(0)

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced || !active) return
    const rate = Number.isFinite(speed) && speed > 0 ? speed : 1
    const id = window.setInterval(() => setTick((value) => value + 1), Math.max(16, 80 / rate))
    return () => window.clearInterval(id)
  }, [active, speed])

  void tick
  const grid = Array.from({ length: rows * cols }, cell)

  return (
    <div
      ref={hostRef}
      className={cn("grid overflow-hidden rounded-xl border bg-zinc-950 p-3 font-mono text-xs", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {grid.map((item, index) => (
        <span key={index} className="text-center" style={{ color: color ?? `hsl(${item.hue} 80% 62%)` }}>
          {item.char}
        </span>
      ))}
    </div>
  )
}

export { LetterGlitchWall }
