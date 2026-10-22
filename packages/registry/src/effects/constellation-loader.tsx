"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/ConstellationLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useMemo, useRef } from "react"

export interface ConstellationLoaderProps {
  count?: number
  size?: number
  color?: string
  className?: string
}

function unit(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  const fraction = value - Math.floor(value)
  return Math.round(fraction * 1e6) / 1e6
}

function layout(count: number, size: number) {
  const stars = Array.from({ length: Math.max(count, 2) }, (_, index) => ({
    x: Math.round((8 + unit(index + 1) * 84) * 1e4) / 1e4,
    y: Math.round((10 + unit(index + 7) * 78) * 1e4) / 1e4,
    radius: Math.round(Math.max(0.8, (size / 4) * (0.45 + unit(index + 3) * 0.7)) * 1e4) / 1e4,
  }))
  const seen = new Set<string>()
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (let index = 0; index < stars.length; index += 1) {
    let nearest = index === 0 ? 1 : 0
    let best = Number.POSITIVE_INFINITY
    for (let other = 0; other < stars.length; other += 1) {
      if (other === index) continue
      const star = stars[index]
      const next = stars[other]
      if (!star || !next) continue
      const distance = (star.x - next.x) ** 2 + (star.y - next.y) ** 2
      if (distance < best) {
        best = distance
        nearest = other
      }
    }
    const start = Math.min(index, nearest)
    const end = Math.max(index, nearest)
    const key = `${start}-${end}`
    if (seen.has(key)) continue
    seen.add(key)
    const from = stars[start]
    const to = stars[end]
    if (!from || !to) continue
    lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y })
  }
  return { stars, lines }
}

export function ConstellationLoader({
  count = 20,
  size = 8,
  color = "#fb3a5d",
  className,
}: ConstellationLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const sky = useMemo(() => layout(count, size), [count, size])

  return (
    <div
      className={cn("relative h-40 w-40 overflow-hidden", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="constellation-loader"
      ref={ref}
    >
      <svg aria-hidden="true" className="size-full" viewBox="0 0 100 100">
        {sky.lines.map((line, index) => (
          <motion.line
            initial={false}
            animate={animate ? { opacity: [0.15, 0.85, 0.15] } : { opacity: 0.7 }}
            key={`${line.x1}-${line.y1}-${index}`}
            stroke={color}
            strokeWidth="0.4"
            transition={animate ? { duration: 2.4, repeat: Infinity, delay: index * 0.12 } : { duration: 0 }}
            x1={line.x1}
            x2={line.x2}
            y1={line.y1}
            y2={line.y2}
          />
        ))}
        {sky.stars.map((star, index) => (
          <motion.circle
            initial={false}
            animate={animate ? { opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] } : { opacity: 1, scale: 1 }}
            cx={star.x}
            cy={star.y}
            fill={color}
            key={`${star.x}-${star.y}`}
            r={star.radius}
            transition={animate ? { duration: 1.8 + (index % 5) * 0.25, repeat: Infinity, delay: (index % 6) * 0.15 } : { duration: 0 }}
          />
        ))}
      </svg>
    </div>
  )
}
