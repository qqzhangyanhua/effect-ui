"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface EvervaultCardProps {
  className?: string
  text?: string
}

const GLYPHS = "0123456789ABCDEF$#*%@!?<>[]{}"

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "#"
}

function EvervaultCard({ className, text = "SECURE" }: EvervaultCardProps) {
  const [chars, setChars] = React.useState(() => Array.from({ length: 240 }, randomGlyph))
  const [spot, setSpot] = React.useState({ x: 50, y: 50, active: false })

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setChars((prev) => prev.map((char, index) => (index % 7 === 0 ? randomGlyph() : char)))
    }, 90)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl border bg-zinc-950 p-5 font-mono", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setSpot({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
          active: true,
        })
      }}
      onPointerLeave={() => setSpot((value) => ({ ...value, active: false }))}
    >
      <div
        className="absolute inset-0 grid grid-cols-20 gap-0 text-[10px] leading-4 text-emerald-400/70"
        style={{
          maskImage: spot.active
            ? `radial-gradient(90px at ${spot.x}% ${spot.y}%, transparent 20%, black 70%)`
            : "none",
        }}
      >
        {chars.map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>
      <div
        className="relative z-10 grid min-h-40 place-items-center text-2xl font-semibold tracking-[0.35em] text-white transition-opacity"
        style={{
          opacity: spot.active ? 1 : 0.15,
          filter: spot.active ? "none" : "blur(4px)",
        }}
      >
        {text}
      </div>
    </div>
  )
}

export { EvervaultCard }
