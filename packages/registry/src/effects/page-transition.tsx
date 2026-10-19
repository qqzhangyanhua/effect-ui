"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PageTransitionProps {
  className?: string
  children?: React.ReactNode
  transitionKey: string
}

function PageTransition({
  className,
  children,
  transitionKey,
}: PageTransitionProps) {
  const reduce = usePrefersReducedMotion()
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
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export { PageTransition }
