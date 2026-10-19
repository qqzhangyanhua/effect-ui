"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export interface ContainerScroll3DProps {
  title?: string
  children: React.ReactNode
  className?: string
}

function ContainerScroll3D({ title = "滚动透视", children, className }: ContainerScroll3DProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.2"] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [28, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1])
  const y = useTransform(scrollYProgress, [0, 1], [40, 0])

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
