"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PageTransitionProps {
  className?: string
  children?: React.ReactNode
  transitionKey: string
  duration?: number
  intensity?: number
}

function PageTransition({
  className,
  children,
  transitionKey,
  duration,
  intensity,
}: PageTransitionProps) {
  const reduce = usePrefersReducedMotion()
  const seconds = duration === undefined || duration === 350 ? 0.35 : duration / 1000
  const enterY = intensity === undefined || intensity === 1 ? 18 : 18 * intensity
  const exitY = intensity === undefined || intensity === 1 ? 12 : 12 * intensity
  const blur = intensity === undefined || intensity === 1 ? 8 : 8 * intensity
  if (reduce) {
    return (
      <div data-slot="page-transition" className={cn(className)}>
        {children}
      </div>
    )
  }
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        data-slot="page-transition"
        className={cn(className)}
        initial={{ opacity: 0, y: enterY, filter: `blur(${blur}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -exitY, filter: `blur(${blur}px)` }}
        transition={{ duration: seconds, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export { PageTransition }
