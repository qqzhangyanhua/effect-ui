"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PerspectiveCardProps {
  className?: string
  children?: React.ReactNode
  /** 横向倾斜角。不传或 16 时横向仍是 16°，纵向仍是 14°。 */
  angle?: number
  /** 内容浮起距离，像素。不传或 28 仍是 translateZ(28px)。 */
  size?: number
}

function PerspectiveCard({ className, children, angle, size }: PerspectiveCardProps) {
  const reduceMotion = usePrefersReducedMotion()
  const tiltY = angle === undefined || angle === 16 ? 16 : angle
  const tiltX = angle === undefined || angle === 16 ? 14 : (14 * angle) / 16
  const depth = size === undefined || size === 28 ? 28 : size
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltX, -tiltX]), {
    stiffness: 180,
    damping: 16,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltY, tiltY]), {
    stiffness: 180,
    damping: 16,
  })

  return (
    <motion.div
      data-slot="perspective-card"
      className={cn(
        "relative rounded-2xl border bg-card p-6 shadow-xl [transform-style:preserve-3d]",
        className,
      )}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 1100,
      }}
      onMouseMove={(event) => {
        if (reduceMotion) return
        const rect = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - rect.left) / rect.width - 0.5)
        y.set((event.clientY - rect.top) / rect.height - 0.5)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <div
        className={depth === 28 ? "[transform:translateZ(28px)]" : undefined}
        style={depth === 28 ? undefined : { transform: `translateZ(${depth}px)` }}
      >
        {children}
      </div>
    </motion.div>
  )
}

export { PerspectiveCard }
