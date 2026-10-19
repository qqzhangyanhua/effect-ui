"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MagneticProps {
  className?: string
  children?: React.ReactNode
  strength?: number
}

function Magnetic({
  className,
  children,
  strength = 0.35,
}: MagneticProps) {
  const reduceMotion = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 15, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 180, damping: 15, mass: 0.4 })

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)
    x.set(offsetX * strength)
    y.set(offsetY * strength)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      data-slot="magnetic"
      className={cn("inline-flex", className)}
      style={{ x: reduceMotion ? 0 : springX, y: reduceMotion ? 0 : springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

export { Magnetic }
