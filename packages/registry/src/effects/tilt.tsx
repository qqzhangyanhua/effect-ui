"use client"

import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

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

export interface TiltProps {
  className?: string
  children?: React.ReactNode
  maxTilt?: number
}

function Tilt({ className, children, maxTilt = 12 }: TiltProps) {
  const reduceMotion = useIsReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 200,
    damping: 18,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 200,
    damping: 18,
  })

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return
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
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  )
}

export { Tilt }
