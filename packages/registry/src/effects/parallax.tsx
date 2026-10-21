"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  offset?: number
  speed?: number
  intensity?: number
  scale?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function Parallax({ className, children, offset = 80, speed, intensity, scale, ...props }: ParallaxProps) {
  const reduce = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const travel = intensity === undefined || intensity === 1 ? offset : offset * intensity
  const rate = pace(speed)
  const y = useTransform(scrollYProgress, (value) => {
    const t = rate === 1 ? value : Math.pow(Math.min(Math.max(value, 0), 1), rate)
    return -travel + t * 2 * travel
  })
  const keepScale = scale === undefined || scale === 1

  return (
    <div ref={ref} data-slot="parallax" className={cn(className)} {...props}>
      {reduce ? children : <motion.div style={{ y, scale: keepScale ? undefined : scale }}>{children}</motion.div>}
    </div>
  )
}

export { Parallax }
