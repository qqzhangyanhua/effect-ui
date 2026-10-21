"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StaggerListProps {
  className?: string
  children?: React.ReactNode
  delay?: number
  speed?: number
  intensity?: number
  gap?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function StaggerList({
  className,
  children,
  delay = 0,
  speed,
  intensity,
  gap,
}: StaggerListProps) {
  const reduce = usePrefersReducedMotion()
  const rate = pace(speed)
  const stagger = rate === 1 ? 0.08 : 0.08 / rate
  const duration = rate === 1 ? 0.4 : 0.4 / rate
  const distance = intensity === undefined || intensity === 1 ? 14 : 14 * intensity
  const keepGap = gap === undefined || gap === 8
  const list = React.useMemo<Variants>(
    () => ({ hidden: {}, show: { transition: { staggerChildren: stagger } } }),
    [stagger],
  )
  const item = React.useMemo<Variants>(
    () => ({
      hidden: { opacity: 0, y: distance },
      show: { opacity: 1, y: 0, transition: { duration, ease: [0.22, 1, 0.36, 1] } },
    }),
    [distance, duration],
  )
  return (
    <motion.ul
      data-slot="stagger-list"
      className={cn("flex flex-col", keepGap && "gap-2", className)}
      style={keepGap ? undefined : { gap }}
      variants={reduce ? undefined : list}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount: 0.3 }}
      transition={reduce ? { duration: 0 } : { delayChildren: delay }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.li key={index} variants={reduce ? undefined : item}>
          {child}
        </motion.li>
      ))}
    </motion.ul>
  )
}

export { StaggerList }
