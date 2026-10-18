"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

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
  className?: string
  children?: React.ReactNode
}

function DynamicIsland({ size = "idle", className, children }: DynamicIslandProps) {
  const preset = sizes[size]
  return (
    <motion.div
      layout
      className={cn(
        "relative overflow-hidden bg-black text-white shadow-lg",
        className,
      )}
      animate={{
        width: preset.width,
        height: preset.height,
        borderRadius: preset.radius,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={size}
          className="flex size-full items-center px-3"
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export { DynamicIsland, sizes as dynamicIslandSizes }
