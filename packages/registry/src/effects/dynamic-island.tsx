"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type DynamicIslandSize = "compact" | "idle" | "expanded" | "tall"

const sizes: Record<DynamicIslandSize, { width: number; height: number; radius: number }> = {
  compact: { width: 120, height: 36, radius: 22 },
  idle: { width: 168, height: 36, radius: 22 },
  expanded: { width: 320, height: 72, radius: 28 },
  tall: { width: 340, height: 168, radius: 32 },
}

export interface DynamicIslandProps {
  size?: DynamicIslandSize
  duration?: number
  intensity?: number
  className?: string
  children?: React.ReactNode
}

function DynamicIsland({ size = "idle", duration, intensity, className, children }: DynamicIslandProps) {
  const reduceMotion = usePrefersReducedMotion()
  const preset = sizes[size]
  const blur = intensity === undefined || intensity === 1 ? 6 : 6 * intensity
  const shown = reduceMotion ? 0.15 : duration === undefined || duration === 180 ? 0.18 : duration / 1000
  const soft = blur === 6 ? "blur(6px)" : `blur(${blur}px)`
  return (
    <motion.div
      layout={!reduceMotion}
      className={cn(
        "relative overflow-hidden bg-black text-white shadow-lg",
        className,
      )}
      animate={{
        width: preset.width,
        height: preset.height,
        borderRadius: preset.radius,
      }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 28 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={size}
          className="flex size-full items-center px-3"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: soft }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, filter: soft }}
          transition={{ duration: shown }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export { DynamicIsland, sizes as dynamicIslandSizes }
