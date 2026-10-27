"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HeroScrollZoomProps {
  title?: string
  className?: string
}

function HeroScrollZoom({ title = "全屏画面收成圆角窗口", className }: HeroScrollZoomProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const scale = useTransform(scrollYProgress, [0, 1], reduced ? [0.86, 0.86] : [1, 0.72])
  const radius = useTransform(scrollYProgress, [0, 1], reduced ? [24, 24] : [0, 32])

  return (
    <section ref={ref} className={cn(reduced ? "h-auto" : "h-[170vh]", className)}>
      <div className={cn("flex items-center justify-center", reduced ? "py-10" : "sticky top-0 h-[80vh]")}>
        <motion.div
          style={{ scale, borderRadius: radius }}
          className="relative grid h-[68vh] w-[min(100%,56rem)] place-items-end overflow-hidden bg-[linear-gradient(160deg,#312e81,#22d3ee_55%,#09090b)] p-6 text-white"
        >
          <p className="font-display text-4xl tracking-tight sm:text-6xl">{title}</p>
        </motion.div>
      </div>
    </section>
  )
}

export { HeroScrollZoom }
