"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/WhirlpoolLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useMemo, useRef } from "react"

export interface WhirlpoolLoaderProps {
  segments?: number
  rotations?: number
  duration?: number
  color?: string
  className?: string
}

export function WhirlpoolLoader({
  segments = 50,
  rotations = 5,
  duration = 20,
  color = "#fb3a5d",
  className,
}: WhirlpoolLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const dots = useMemo(() => {
    const count = Math.max(segments, 1)
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2 * rotations
      const radius = 5 + (90 * index) / Math.max(count - 1, 1)
      return {
        x: Math.round(Math.cos(angle) * radius * 1e4) / 1e4,
        y: Math.round(Math.sin(angle) * radius * 1e4) / 1e4,
        r: Math.round((1.6 + (index / count) * 2.4) * 1e4) / 1e4,
      }
    })
  }, [rotations, segments])

  return (
    <div
      className={cn("grid h-60 w-60 place-items-center", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="whirlpool-loader"
      ref={ref}
    >
      <svg aria-hidden="true" className="size-full" viewBox="-100 -100 200 200">
        <motion.g
          initial={false}
          animate={animate ? { rotate: 360 } : { rotate: 0 }}
          transition={animate ? { duration, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        >
          {dots.map((dot, index) => (
            <motion.circle
              initial={false}
              animate={animate ? { scale: [0.6, 1, 0.6], opacity: [0.45, 1, 0.45] } : { scale: 1, opacity: 1 }}
              cx={dot.x}
              cy={dot.y}
              fill={color}
              key={`${dot.x}-${dot.y}`}
              r={dot.r}
              transition={
                animate
                  ? { duration: 1.6, delay: (index / dots.length) * 1.2, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0 }
              }
            />
          ))}
        </motion.g>
      </svg>
    </div>
  )
}
