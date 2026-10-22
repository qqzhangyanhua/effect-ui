"use client"

import * as React from "react"
import { motion, useScroll } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScrollProgressProps {
  className?: string
  containerRef?: React.RefObject<HTMLElement | null>
  size?: number
  intensity?: number
  color?: string
}

function ScrollProgress({ className, containerRef, size, intensity, color }: ScrollProgressProps) {
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined,
  )
  const keepSize = size === undefined || size === 4
  const keepIntensity = intensity === undefined || intensity === 1
  const keepGradient = color === undefined || color.toLowerCase() === "#8b5cf6"

  return (
    <motion.div
      data-reduced={reduced ? "true" : undefined}
      className={cn(
        "motion-reduce:transition-none",
        keepSize && "h-1",
        keepGradient && "bg-linear-to-r from-violet-500 via-fuchsia-400 to-amber-300",
        className,
      )}
      style={{
        scaleX: scrollYProgress,
        height: keepSize ? undefined : size,
        opacity: keepIntensity ? undefined : intensity,
        backgroundColor: keepGradient ? undefined : color,
      }}
    />
  )
}

export { ScrollProgress }
