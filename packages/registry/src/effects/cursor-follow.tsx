"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CursorFollowProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  color?: string
  speed?: number
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function CursorFollow({ className, size = 28, color, speed, intensity, children, ...props }: CursorFollowProps) {
  const reduceMotion = usePrefersReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const spring = { stiffness: 220 * pace(speed), damping: 22 }
  const springX = useSpring(x, spring)
  const springY = useSpring(y, spring)
  const keepOpacity = intensity === undefined || intensity === 0.35
  const painted = Boolean(color)

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left - size / 2)
    y.set(event.clientY - rect.top - size / 2)
  }

  return (
    <div
      data-slot="cursor-follow"
      className={cn("relative overflow-hidden", className)}
      onMouseMove={onMove}
      {...props}
    >
      {reduceMotion ? null : (
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-20 rounded-full mix-blend-screen blur-[1px]",
            painted || !keepOpacity ? "bg-primary" : "bg-primary/35",
          )}
          style={{
            x: springX,
            y: springY,
            width: size,
            height: size,
            backgroundColor: color,
            opacity: painted ? (intensity ?? 0.35) : keepOpacity ? undefined : intensity,
          }}
        />
      )}
      {children}
    </div>
  )
}

export { CursorFollow }
