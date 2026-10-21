"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface HighlightTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: string
  /** 底纹展开时长，毫秒。不传则 550。 */
  duration?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function HighlightText({
  className,
  color = "var(--primary)",
  duration,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  style,
  children,
  ...props
}: HighlightTextProps) {
  const reduced = usePrefersReducedMotion()
  const seconds = (duration ?? 550) / 1000

  return (
    <span
      data-slot="highlight-text"
      className={cn("relative inline-block px-1", className)}
      style={textStyle(style, fontSize, fontWeight, letterSpacing, align)}
      {...props}
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-0 h-[42%] origin-left rounded-sm opacity-40"
        style={{ backgroundColor: color }}
        initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
        animate={reduced ? { scaleX: 1 } : undefined}
        whileInView={reduced ? undefined : { scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={
          reduced ? { duration: 0 } : { duration: seconds, ease: [0.22, 1, 0.36, 1] }
        }
      />
      <span className="relative z-10">{children}</span>
    </span>
  )
}

export { HighlightText }
