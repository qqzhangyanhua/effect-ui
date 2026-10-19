"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

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

export interface CursorFollowProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

function CursorFollow({
  className,
  size = 28,
  children,
  ...props
}: CursorFollowProps) {
  const reduceMotion = useIsReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springX = useSpring(x, { stiffness: 220, damping: 22 })
  const springY = useSpring(y, { stiffness: 220, damping: 22 })
  const areaRef = React.useRef<HTMLDivElement>(null)

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left - size / 2)
    y.set(event.clientY - rect.top - size / 2)
  }

  return (
    <div
      ref={areaRef}
      data-slot="cursor-follow"
      className={cn("relative overflow-hidden", className)}
      onMouseMove={onMove}
      {...props}
    >
      {reduceMotion ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 z-20 rounded-full bg-primary/35 mix-blend-screen blur-[1px]"
          style={{ x: springX, y: springY, width: size, height: size }}
        />
      )}
      {children}
    </div>
  )
}

export { CursorFollow }
