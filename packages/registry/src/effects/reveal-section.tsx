"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface RevealSectionProps {
  className?: string
  children?: React.ReactNode
  delay?: number
}

function RevealSection({ className, children, delay = 0 }: RevealSectionProps) {
  return (
    <motion.section
      data-slot="reveal-section"
      className={cn(className)}
      initial={{ opacity: 0, y: 32, clipPath: "inset(12% 0 0 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

export { RevealSection }
