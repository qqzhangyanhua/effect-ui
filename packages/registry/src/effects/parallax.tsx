"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  offset?: number
}

function Parallax({ className, children, offset = 80, ...props }: ParallaxProps) {
  const reduce = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset])

  return (
    <div ref={ref} data-slot="parallax" className={cn(className)} {...props}>
      {reduce ? children : <motion.div style={{ y }}>{children}</motion.div>}
    </div>
  )
}

export { Parallax }
