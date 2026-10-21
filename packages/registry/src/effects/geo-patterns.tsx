"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/hexagon-pattern.tsx
// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/striped-pattern.tsx

import { useId, type CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GeoPatternsProps {
  variant?: "hexagon" | "striped"
  direction?: "left" | "right" | "up" | "down"
  gap?: number
  radius?: number
  highlights?: readonly (readonly [number, number])[]
  fade?: boolean
  className?: string
}

function hexPoints(cx: number, cy: number, radius: number, pointy: boolean) {
  const start = pointy ? -Math.PI / 2 : 0
  return Array.from({ length: 6 }, (_, index) => {
    const angle = start + (index * Math.PI) / 3
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`
  }).join(" ")
}

function GeoPatterns({
  variant = "hexagon",
  direction = "left",
  gap = 8,
  radius = 28,
  highlights = [],
  fade = true,
  className,
}: GeoPatternsProps) {
  const reduced = usePrefersReducedMotion()
  const id = useId().replace(/:/g, "")
  const pointy = direction === "up" || direction === "down"
  const stripeDown = direction === "right" || direction === "down"
  const spacing = Math.max(4, gap)
  const mask: CSSProperties | undefined = fade
    ? { maskImage: "radial-gradient(ellipse at center, black 45%, transparent 78%)" }
    : undefined

  if (variant === "striped") {
    return (
      <svg
        data-slot="geo-patterns"
        data-reduced={reduced ? "true" : "false"}
        aria-hidden
        className={cn("pointer-events-none absolute inset-0 h-full w-full text-foreground/30", className)}
        style={mask}
      >
        <defs>
          <pattern id={id} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
            {stripeDown ? (
              <line x1="0" y1="0" x2={spacing} y2={spacing} stroke="currentColor" strokeWidth="1" />
            ) : (
              <line x1="0" y1={spacing} x2={spacing} y2="0" stroke="currentColor" strokeWidth="1" />
            )}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    )
  }

  const colStep = pointy ? radius * Math.sqrt(3) + spacing : radius * 1.5 + spacing
  const rowStep = pointy ? radius * 1.5 + spacing : radius * Math.sqrt(3) + spacing
  const tileW = pointy ? colStep : colStep * 2
  const tileH = pointy ? rowStep * 2 : rowStep
  const centers: [number, number][] = pointy
    ? [
        [colStep / 2, rowStep / 2],
        [colStep, rowStep * 1.5],
      ]
    : [
        [colStep / 2, rowStep / 2],
        [colStep * 1.5, rowStep],
      ]

  return (
    <svg
      data-slot="geo-patterns"
      data-reduced={reduced ? "true" : "false"}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-foreground/35", className)}
      style={mask}
    >
      <defs>
        <pattern id={id} width={tileW} height={tileH} patternUnits="userSpaceOnUse">
          {centers.map(([cx, cy]) => (
            <polygon key={`${cx}-${cy}`} points={hexPoints(cx, cy, radius, pointy)} fill="none" stroke="currentColor" strokeWidth="1" />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      {highlights.map(([col, row]) => {
        const cx = col * colStep + colStep / 2
        const cy = row * rowStep + rowStep / 2 + (pointy ? (row % 2) * (colStep / 2) : (col % 2) * (rowStep / 2))
        return <polygon key={`${col}-${row}`} points={hexPoints(cx, cy, radius - 1, pointy)} fill="currentColor" opacity="0.35" />
      })}
    </svg>
  )
}

export { GeoPatterns }
