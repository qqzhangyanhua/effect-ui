"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/MorphingShapesLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useRef } from "react"

export interface MorphingShapesLoaderProps {
  count?: number
  size?: number
  colors?: string[]
  duration?: number
  className?: string
}

const DEFAULT_COLORS = ["#fb3a5d", "#6366f1", "#22c55e", "#f59e0b"]

export function MorphingShapesLoader({
  count = 4,
  size = 28,
  colors = DEFAULT_COLORS,
  duration = 1.4,
  className,
}: MorphingShapesLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const total = Math.max(count, 1)

  return (
    <div
      className={cn("flex items-center justify-center gap-3", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="morphing-shapes-loader"
      ref={ref}
    >
      {Array.from({ length: total }, (_, index) => (
        <motion.span
          animate={animate ? { borderRadius: ["50%", "12%", "50%"] } : { borderRadius: "12%" }}
          className="block"
          initial={false}
          key={index}
          style={{
            width: size,
            height: size,
            background: colors[index % Math.max(colors.length, 1)] ?? DEFAULT_COLORS[0],
          }}
          transition={
            animate
              ? { duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }
              : { duration: 0 }
          }
        />
      ))}
    </div>
  )
}
