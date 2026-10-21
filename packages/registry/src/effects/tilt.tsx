"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TiltProps {
  className?: string
  children?: React.ReactNode
  maxTilt?: number
  speed?: number
  intensity?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function Tilt({ className, children, maxTilt = 12, speed, intensity, scale }: TiltProps) {
  const reduceMotion = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const tilt = maxTilt * (intensity === undefined || intensity === 1 ? 1 : intensity)
  const spring = { stiffness: 200 * pace(speed), damping: 18 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tilt, -tilt]), spring)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tilt, tilt]), spring)

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set((event.clientX - rect.left) / rect.width - 0.5)
    y.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      data-slot="tilt"
      className={cn("[transform-style:preserve-3d]", className)}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 900,
        scale: scale === undefined || scale === 1 ? undefined : scale,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

export { Tilt }
