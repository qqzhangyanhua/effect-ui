"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/RippleWaveLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useRef } from "react"

export interface RippleWaveLoaderProps {
  count?: number
  color?: string
  duration?: number
  className?: string
}

export function RippleWaveLoader({
  count = 7,
  color = "#ef4444",
  duration = 1,
  className,
}: RippleWaveLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const total = Math.max(count, 1)

  return (
    <div
      className={cn("flex h-12 items-center justify-center gap-1", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="ripple-wave-loader"
      ref={ref}
    >
      {Array.from({ length: total }, (_, index) => (
        <motion.span
          animate={animate ? { scaleY: [0.45, 1.4, 0.45] } : { scaleY: 1 }}
          className="block h-8 w-2 origin-center rounded-full"
          initial={false}
          key={index}
          style={{ background: color }}
          transition={
            animate
              ? { duration, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }
              : { duration: 0 }
          }
        />
      ))}
    </div>
  )
}
