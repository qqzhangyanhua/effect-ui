"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ContainerScroll3DProps {
  title?: string
  children: React.ReactNode
  className?: string
  angle?: number
  intensity?: number
  speed?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function ContainerScroll3D({
  title = "滚动透视",
  children,
  className,
  angle,
  intensity,
  speed,
  scale: scaleStart,
}: ContainerScroll3DProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.2"] })
  const rate = pace(speed)
  const shaped = useTransform(scrollYProgress, (value) =>
    rate === 1 ? value : Math.pow(Math.min(Math.max(value, 0), 1), rate),
  )
  const open = angle === undefined || angle === 28 ? 28 : angle
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const startRotate = gain === 1 ? open : open * gain
  const startY = gain === 1 ? 40 : 40 * gain
  const startScale = scaleStart === undefined || scaleStart === 1 ? 0.88 : 0.88 * scaleStart
  const rotateX = useTransform(shaped, [0, 1], reduced ? [0, 0] : [startRotate, 0])
  const scale = useTransform(shaped, [0, 1], reduced ? [1, 1] : [startScale, 1])
  const y = useTransform(shaped, [0, 1], reduced ? [0, 0] : [startY, 0])

  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      <p className="text-center font-display text-2xl">{title}</p>
      <div className="[perspective:1200px]">
        <motion.div
          style={{ rotateX, scale, y }}
          className="overflow-hidden rounded-2xl border bg-card shadow-xl [transform-style:preserve-3d]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

export { ContainerScroll3D }
