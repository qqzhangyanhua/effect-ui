"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface RollingNumberProps {
  value: number
  className?: string
}

function RollingNumber({ value, className }: RollingNumberProps) {
  const digits = String(Math.max(0, Math.floor(value))).split("")

  return (
    <span
      data-slot="rolling-number"
      className={cn("inline-flex overflow-hidden font-mono tabular-nums", className)}
    >
      {digits.map((digit, index) => (
        <span key={`${index}-${digits.length}`} className="relative h-[1em] w-[0.7em]">
          <motion.span
            className="absolute inset-x-0"
            animate={{ y: `-${Number(digit)}em` }}
            transition={{ type: "spring", stiffness: 140, damping: 18 }}
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
