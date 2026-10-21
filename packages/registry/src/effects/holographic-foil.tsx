"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const FOIL_COLORS = ["#ff4d6d", "#ffd166", "#06d6a0", "#118ab2", "#9b5de5", "#ff4d6d"]

export interface HolographicFoilProps {
  children?: React.ReactNode
  className?: string
  /** 倾斜角。不传或 14 仍是 14°。 */
  angle?: number
  /** 箔膜不透明度。不传或 0.8 仍是 80% 和 40% 两层。 */
  intensity?: number
  /** 镭射色。不传或这 6 个色仍用原来的锥形渐变。 */
  colors?: string[]
}

function sameFoil(colors: string[] | undefined) {
  return (
    colors === undefined ||
    (colors.length === FOIL_COLORS.length && colors.every((color, index) => color.toLowerCase() === FOIL_COLORS[index]))
  )
}

function HolographicFoil({ children, className, angle, intensity, colors }: HolographicFoilProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const tilt = angle === undefined || angle === 14 ? 14 : angle
  const veil = intensity === undefined || intensity === 0.8 ? 0.8 : intensity
  const painted = sameFoil(colors)

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    node.style.setProperty("--foil-x", `${x}`)
    node.style.setProperty("--foil-y", `${y}`)
    node.style.setProperty("--tilt-x", `${(0.5 - y) * tilt}deg`)
    node.style.setProperty("--tilt-y", `${(x - 0.5) * tilt}deg`)
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
        className={cn(
          "pointer-events-none absolute inset-0 mix-blend-color-dodge",
          veil === 0.8 && "opacity-80",
        )}
        style={{
          opacity: veil === 0.8 ? undefined : veil,
          background: painted
            ? "conic-gradient(from calc(var(--foil-x, 0.5) * 360deg), #ff4d6d, #ffd166, #06d6a0, #118ab2, #9b5de5, #ff4d6d)"
            : `conic-gradient(from calc(var(--foil-x, 0.5) * 360deg), ${colors?.join(", ")})`,
          maskImage:
            "radial-gradient(circle at calc(var(--foil-x, 0.5) * 100%) calc(var(--foil-y, 0.5) * 100%), black, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 [transform:translateX(calc((var(--foil-x,0.5)-0.5)*40%))] motion-reduce:transform-none",
          veil === 0.8 && "opacity-40",
        )}
        style={{
          opacity: veil === 0.8 ? undefined : veil * 0.5,
          background:
            "linear-gradient(115deg, transparent 30%, color-mix(in oklab, white 55%, transparent) 48%, transparent 62%)",
        }}
      />
      <div className="relative z-10">{children ?? <p className="font-display text-2xl">Holographic Foil</p>}</div>
    </div>
  )
}

export { HolographicFoil }
