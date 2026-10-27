"use client"

import * as React from "react"
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TelescopeZoomScrollProps {
  before?: string
  after?: string
  className?: string
}

function TelescopeZoomScroll({
  before = "先看见圆窗里的海岸。",
  after = "再把整片夜空揭开。",
  className,
}: TelescopeZoomScrollProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const boxRef = React.useRef({ width: 800, height: 600 })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const radius = useMotionValue(72)
  const clip = useTransform(radius, (value) => `circle(${value}px at 50% 50%)`)
  const diameter = useTransform(radius, (value) => value * 2)
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 140])

  const applyRadius = React.useCallback(
    (progress: number) => {
      const { width, height } = boxRef.current
      const min = Math.min(width, height) * 0.11
      const max = Math.hypot(width, height) / 2 + 28
      radius.set(min + (max - min) * progress)
    },
    [radius],
  )

  useMotionValueEvent(scrollYProgress, "change", applyRadius)

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage || reduced) return
    const measure = () => {
      const box = stage.getBoundingClientRect()
      boxRef.current = { width: Math.max(box.width, 1), height: Math.max(box.height, 1) }
      applyRadius(scrollYProgress.get())
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [applyRadius, reduced, scrollYProgress])

  if (reduced) {
    return (
      <section data-slot="telescope-zoom-scroll" className={cn("grid gap-4 bg-slate-950 p-8 text-white", className)}>
        <h2 className="text-3xl">{after}</h2>
      </section>
    )
  }

  return (
    <section ref={ref} data-slot="telescope-zoom-scroll" className={cn("relative h-[220vh] bg-slate-950 text-white", className)}>
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0 flex items-end bg-linear-to-b from-sky-700 to-amber-200 p-10">
          <h2 className="text-4xl">{before}</h2>
        </div>
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 flex items-end bg-linear-to-b from-indigo-950 to-slate-900 p-10">
          <h2 className="text-4xl">{after}</h2>
        </motion.div>
        <motion.div style={{ width: diameter, height: diameter, x: "-50%", y: "-50%", rotate }} className="pointer-events-none absolute top-1/2 left-1/2">
          <svg viewBox="0 0 100 100" className="size-full" aria-hidden>
            <circle cx="50" cy="50" r="48" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="0.7" strokeDasharray="1.5 2.6" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="0.35" />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}

export { TelescopeZoomScroll }
