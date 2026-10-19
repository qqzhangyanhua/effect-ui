"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SlideInProps extends HTMLMotionProps<"div"> {
  from?: "left" | "right" | "top" | "bottom"
  delay?: number
}

const offset = {
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
  top: { x: 0, y: -36 },
  bottom: { x: 0, y: 36 },
} as const

function SlideIn({
  className,
  children,
  from = "bottom",
  delay = 0,
  ...props
}: SlideInProps) {
  const reduce = usePrefersReducedMotion()
  return (
    <motion.div
      data-slot="slide-in"
      className={cn(className)}
      viewport={{ once: true, amount: 0.35 }}
      {...(reduce
        ? { ...props, initial: false, transition: { duration: 0 } }
        : {
            initial: { opacity: 0, ...offset[from] },
            whileInView: { opacity: 1, x: 0, y: 0 },
            transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
            ...props,
          })}
    >
      {children}
    </motion.div>
  )
}

export { SlideIn }
