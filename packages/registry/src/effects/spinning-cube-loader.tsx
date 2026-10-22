"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/loaders/SpinningCubeLoader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useRef } from "react"

export interface SpinningCubeLoaderProps {
  size?: number
  color?: string
  duration?: number
  className?: string
}

export function SpinningCubeLoader({
  size = 64,
  color = "#fb3a5d",
  duration = 2,
  className,
}: SpinningCubeLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn

  return (
    <div
      className={cn("grid place-items-center", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="spinning-cube-loader"
      ref={ref}
      style={{ perspective: 280 }}
    >
      <motion.div
        animate={animate ? { rotateX: 360, rotateY: 360 } : { rotateX: 18, rotateY: 24 }}
        className="rounded-2xl"
        style={{ width: size, height: size, background: color }}
        transition={animate ? { duration, ease: "easeInOut", repeat: Infinity } : { duration: 0 }}
      />
    </div>
  )
}
