"use client"

import * as React from "react"
import { motion, useScroll } from "motion/react"

import { cn } from "@/lib/utils"

export interface ScrollProgressProps {
  className?: string
  containerRef?: React.RefObject<HTMLElement | null>
}

function ScrollProgress({ className, containerRef }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined,
  )

  return (
    <motion.div
      className={cn(
        "h-1 origin-left bg-linear-to-r from-violet-500 via-fuchsia-400 to-amber-300",
        className,
      )}
      style={{ scaleX: scrollYProgress }}
    />
  )
}

export { ScrollProgress }
