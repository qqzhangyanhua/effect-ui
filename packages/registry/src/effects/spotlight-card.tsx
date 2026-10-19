"use client"

import * as React from "react"
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function useIsReducedMotion() {
  const prefersReducedMotion = useReducedMotion()
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () =>
      prefersReducedMotion === true ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string
  radius?: number
}

function SpotlightCard({
  className,
  children,
  spotlightColor = "color-mix(in oklab, var(--primary) 35%, transparent)",
  radius = 240,
  ...props
}: SpotlightCardProps) {
  const reduceMotion = useIsReducedMotion()
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const { left, top } = event.currentTarget.getBoundingClientRect()
    mouseX.set(event.clientX - left)
    mouseY.set(event.clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${spotlightColor}, transparent 70%)`
  const staticBackground = `radial-gradient(${radius}px circle at 50% 50%, ${spotlightColor}, transparent 70%)`

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
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: reduceMotion ? staticBackground : background }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { SpotlightCard }
