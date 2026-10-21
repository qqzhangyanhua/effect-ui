"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/text-shimmer-wave.tsx

import { useRef } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TextShimmerWaveProps {
  children?: string
  duration?: number
  scale?: number
  yDistance?: number
  className?: string
}

function TextShimmerWave({ children = "波动闪光", duration = 1.4, scale = 1.12, yDistance = -6, className }: TextShimmerWaveProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLParagraphElement>(null)
  const active = useAnimationActive(rootRef)
  const letters = Array.from(children)

  return (
    <p
      ref={rootRef}
      data-slot="text-shimmer-wave"
      data-reduced={reduced ? "true" : "false"}
      className={cn("inline-block text-4xl font-semibold text-muted-foreground [perspective:500px]", className)}
    >
      {letters.map((letter, index) => {
        const delay = (index * duration) / Math.max(letters.length, 1)
        const moving = !reduced && active
        return (
          <motion.span
            key={`${letter}-${index}`}
            className="inline-block whitespace-pre"
            animate={
              moving
                ? {
                    y: [0, yDistance, 0],
                    scale: [1, scale, 1],
                    z: [0, 12, 0],
                    color: ["var(--muted-foreground)", "var(--foreground)", "var(--muted-foreground)"],
                  }
                : reduced
                  ? { color: ["var(--muted-foreground)", "var(--foreground)", "var(--muted-foreground)"] }
                  : { y: 0, scale: 1, color: "var(--muted-foreground)" }
            }
            transition={
              moving || reduced
                ? { duration, repeat: Infinity, delay, ease: "easeInOut" }
                : { duration: 0 }
            }
          >
            {letter}
          </motion.span>
        )
      })}
    </p>
  )
}

export { TextShimmerWave }
