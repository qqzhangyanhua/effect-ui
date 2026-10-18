"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export interface PerspectiveCardProps {
  className?: string
  children?: React.ReactNode
}

function PerspectiveCard({ className, children }: PerspectiveCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), {
    stiffness: 180,
    damping: 16,
  })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), {
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
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - rect.left) / rect.width - 0.5)
        y.set((event.clientY - rect.top) / rect.height - 0.5)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <div className="[transform:translateZ(28px)]">{children}</div>
    </motion.div>
  )
}

export { PerspectiveCard }
