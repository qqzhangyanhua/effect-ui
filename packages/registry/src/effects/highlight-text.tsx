"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface HighlightTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string
}

function HighlightText({
  className,
  color = "var(--primary)",
  children,
  ...props
}: HighlightTextProps) {
  return (
    <span
      data-slot="highlight-text"
      className={cn("relative inline-block px-1", className)}
      {...props}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-0 h-[42%] origin-left rounded-sm opacity-40"
        style={{ backgroundColor: color }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  )
}

export { HighlightText }
