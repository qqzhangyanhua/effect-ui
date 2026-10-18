"use client"

import * as React from "react"
import { motion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

export interface BlurFadeProps extends HTMLMotionProps<"div"> {
  delay?: number
  blur?: number
}

function BlurFade({
  className,
  children,
  delay = 0,
  blur = 8,
  ...props
}: BlurFadeProps) {
  return (
    <motion.div
      data-slot="blur-fade"
      className={cn(className)}
      initial={{ opacity: 0, y: 12, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export { BlurFade }
