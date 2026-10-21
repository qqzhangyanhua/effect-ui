"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MagneticProps {
  className?: string
  children?: React.ReactNode
  strength?: number
  speed?: number
  intensity?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function Magnetic({ className, children, strength = 0.35, speed, intensity, scale }: MagneticProps) {
  const reduceMotion = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 180 * pace(speed), damping: 15, mass: 0.4 }
  const springX = useSpring(x, spring)
  const springY = useSpring(y, spring)
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)
    x.set(offsetX * strength * gain)
    y.set(offsetY * strength * gain)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      data-slot="magnetic"
      className={cn("inline-flex", className)}
      style={{
        x: reduceMotion ? 0 : springX,
        y: reduceMotion ? 0 : springY,
        scale: scale === undefined || scale === 1 ? undefined : scale,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

export { Magnetic }
