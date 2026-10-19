"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

export interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  once?: boolean
}

function FadeIn({
  className,
  children,
  delay = 0,
  once = true,
  ...props
}: FadeInProps) {
  const reduce = useReducedMotion() === true
  return (
    <motion.div
      data-slot="fade-in"
      className={cn(className)}
      viewport={{ once, amount: 0.4 }}
      {...(reduce
        ? { ...props, initial: false, transition: { duration: 0 } }
        : {
            initial: { opacity: 0, y: 16 },
            whileInView: { opacity: 1, y: 0 },
            transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
            ...props,
          })}
    >
      {children}
    </motion.div>
  )
}

export { FadeIn }
