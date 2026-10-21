"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string
  radius?: number
  speed?: number
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function SpotlightCard({
  className,
  children,
  spotlightColor = "color-mix(in oklab, var(--primary) 35%, transparent)",
  radius = 240,
  speed,
  intensity,
  ...props
}: SpotlightCardProps) {
  const reduceMotion = usePrefersReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const falloff = intensity === undefined || intensity === 1 ? 70 : Math.min(100, Math.max(0, 70 * intensity))
  const keepDuration = speed === undefined || speed === 1

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return
    const { left, top } = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - left)
    mouseY.set(event.clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent ${falloff}%)`
  const staticBackground = `radial-gradient(${radius}px circle at 50% 50%, ${spotlightColor}, transparent ${falloff}%)`

  return (
    <div
      data-slot="spotlight-card"
      onMouseMove={onMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity pointer-fine:group-hover:opacity-100 motion-reduce:hidden",
          keepDuration && "duration-300",
        )}
        style={{ background, transitionDuration: keepDuration ? undefined : `${300 / pace(speed)}ms` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 pointer-coarse:opacity-100 motion-reduce:opacity-100"
        style={{ background: staticBackground }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { SpotlightCard }
