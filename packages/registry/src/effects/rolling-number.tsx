"use client"

import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface RollingNumberProps {
  value: number
  className?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function RollingNumber({
  value,
  className,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: RollingNumberProps) {
  const reduced = usePrefersReducedMotion()
  const digits = String(Math.max(0, Math.floor(value))).split("")
  const style = textStyle(undefined, fontSize, fontWeight, letterSpacing, align)
  const transition = { type: "spring" as const, stiffness: 140, damping: 18 }

  if (reduced) {
    return (
      <span
        data-slot="rolling-number"
        className={cn("inline-flex font-mono tabular-nums", className)}
        style={style}
      >
        {digits.map((digit, index) => (
          <span
            key={`${index}-${digits.length}`}
            className="inline-flex h-[1em] w-[0.7em] items-center justify-center"
          >
            {digit}
          </span>
        ))}
      </span>
    )
  }

  return (
    <span
      data-slot="rolling-number"
      className={cn("inline-flex overflow-hidden font-mono tabular-nums", className)}
      style={style}
    >
      {digits.map((digit, index) => (
        <span key={`${index}-${digits.length}`} className="relative h-[1em] w-[0.7em]">
          <motion.span
            className="absolute inset-x-0"
            animate={{ y: `-${Number(digit)}em` }}
            transition={transition}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="flex h-[1em] items-center justify-center">
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export { RollingNumber }
