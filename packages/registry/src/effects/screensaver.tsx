"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/blocks/screensaver.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useDimensions } from "@/hooks/use-dimensions"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, useAnimationFrame, useMotionValue } from "motion/react"
import { useEffect, useRef, type RefObject } from "react"

export interface ScreensaverProps {
  children: React.ReactNode
  containerRef: RefObject<HTMLElement | null>
  speed?: number
  startPosition?: { x: number; y: number }
  startAngle?: number
  className?: string
}

export function Screensaver({
  children,
  speed = 3,
  startPosition = { x: 0, y: 0 },
  startAngle = 45,
  containerRef,
  className,
}: ScreensaverProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const angle = useRef((startAngle * Math.PI) / 180)
  const containerDimensions = useDimensions(containerRef)
  const elementDimensions = useDimensions(elementRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(elementRef)
  const paused = prefersReducedMotion || !motionOn
  const startX = startPosition.x
  const startY = startPosition.y

  useEffect(() => {
    if (!containerDimensions.width || !containerDimensions.height) return
    const initialX = (startX / 100) * (containerDimensions.width - (elementDimensions.width || 0))
    const initialY = (startY / 100) * (containerDimensions.height - (elementDimensions.height || 0))
    x.set(initialX)
    y.set(initialY)
  }, [containerDimensions.height, containerDimensions.width, elementDimensions.height, elementDimensions.width, startX, startY, x, y])

  useAnimationFrame(() => {
    if (paused) return
    const dx = Math.cos(angle.current) * speed
    const dy = Math.sin(angle.current) * speed
    let nextX = x.get() + dx
    let nextY = y.get() + dy

    if (nextX <= 0 || nextX + elementDimensions.width >= containerDimensions.width) {
      angle.current = Math.PI - angle.current
      nextX = Math.max(0, Math.min(nextX, containerDimensions.width - elementDimensions.width))
    }
    if (nextY <= 0 || nextY + elementDimensions.height >= containerDimensions.height) {
      angle.current = -angle.current
      nextY = Math.max(0, Math.min(nextY, containerDimensions.height - elementDimensions.height))
    }

    x.set(nextX)
    y.set(nextY)
  })

  return (
    <motion.div
      className={cn("transform will-change-transform", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="screensaver"
      ref={elementRef}
      style={{ position: "absolute", top: 0, left: 0, x, y }}
    >
      {children}
    </motion.div>
  )
}
