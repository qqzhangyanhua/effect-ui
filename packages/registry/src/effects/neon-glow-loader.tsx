"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/NeonGlowLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useRef } from "react"

export interface NeonGlowLoaderProps {
  colors?: string[]
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_COLORS = ["#fb3a5d", "#00ffff", "#ffff00"]

export function NeonGlowLoader({
  colors = DEFAULT_COLORS,
  size = 18,
  duration = 1,
  className,
}: NeonGlowLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const dots = colors.length > 0 ? colors : DEFAULT_COLORS

  return (
    <div
      className={cn("flex items-center justify-center gap-4", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="neon-glow-loader"
      ref={ref}
    >
      {dots.map((color, index) => (
        <motion.span
          animate={animate ? { opacity: [0.35, 1, 0.35], scale: [0.8, 1.15, 0.8] } : { opacity: 1, scale: 1 }}
          className="block rounded-full"
          initial={false}
          key={`${color}-${index}`}
          style={{
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 18px 4px ${color}`,
          }}
          transition={
            animate
              ? { duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
              : { duration: 0 }
          }
        />
      ))}
    </div>
  )
}
