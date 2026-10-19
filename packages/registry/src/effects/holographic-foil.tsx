"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface HolographicFoilProps {
  children?: React.ReactNode
  className?: string
}

function HolographicFoil({ children, className }: HolographicFoilProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    node.style.setProperty("--foil-x", `${x}`)
    node.style.setProperty("--foil-y", `${y}`)
    node.style.setProperty("--tilt-x", `${(0.5 - y) * 14}deg`)
    node.style.setProperty("--tilt-y", `${(x - 0.5) * 14}deg`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => {
        const node = ref.current
        if (!node) return
        node.style.setProperty("--tilt-x", "0deg")
        node.style.setProperty("--tilt-y", "0deg")
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-8 [transform:perspective(900px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] transition-transform motion-reduce:transform-none motion-reduce:transition-none",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80 mix-blend-color-dodge"
        style={{
          background:
            "conic-gradient(from calc(var(--foil-x, 0.5) * 360deg), #ff4d6d, #ffd166, #06d6a0, #118ab2, #9b5de5, #ff4d6d)",
          maskImage:
            "radial-gradient(circle at calc(var(--foil-x, 0.5) * 100%) calc(var(--foil-y, 0.5) * 100%), black, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [transform:translateX(calc((var(--foil-x,0.5)-0.5)*40%))] motion-reduce:transform-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, color-mix(in oklab, white 55%, transparent) 48%, transparent 62%)",
        }}
      />
      <div className="relative z-10">{children ?? <p className="font-display text-2xl">Holographic Foil</p>}</div>
    </div>
  )
}

export { HolographicFoil }
