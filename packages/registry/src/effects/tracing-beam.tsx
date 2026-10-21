"use client"

import * as React from "react"
import { useScroll, useSpring, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TracingBeamProps {
  children: React.ReactNode
  className?: string
  speed?: number
  size?: number
  color?: string
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function TracingBeam({ children, className, speed, size, color }: TracingBeamProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] })
  const rate = pace(speed)
  const smooth = useSpring(
    scrollYProgress,
    reduced ? { duration: 0 } : rate === 1 ? { stiffness: 90, damping: 24 } : { stiffness: 90 * rate, damping: 24 },
  )
  const height = useTransform(smooth, [0, 1], ["0%", "100%"])

  return (
    <div ref={ref} className={cn("relative pl-8", className)}>
      <div className="absolute top-0 bottom-0 left-2 w-px bg-border" />
      <BeamFill height={height} size={size} color={color} reduced={reduced} />
      <div className="space-y-6">{children}</div>
    </div>
  )
}

function BeamFill({
  height,
  size,
  color,
  reduced,
}: {
  height: ReturnType<typeof useTransform<number, string>>
  size?: number
  color?: string
  reduced: boolean
}) {
  const [value, setValue] = React.useState("0%")
  React.useEffect(() => height.on("change", setValue), [height])
  const keepSize = size === undefined || size === 1
  const painted = color !== undefined && color.toLowerCase() !== "#a78bfa"
  return (
    <div
      className={cn(
        "absolute top-0 left-2",
        keepSize && "w-px",
        !painted && "bg-linear-to-b from-violet-400 via-fuchsia-400 to-cyan-300",
      )}
      style={{
        height: reduced ? "100%" : value,
        width: keepSize ? undefined : size,
        backgroundColor: painted ? color : undefined,
      }}
    />
  )
}

export interface SvgScrollPathProps {
  d?: string
  className?: string
}

function SvgScrollPath({
  d = "M 8 8 C 40 80, 80 0, 120 72 C 160 140, 200 20, 232 88",
  className,
}: SvgScrollPathProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const pathRef = React.useRef<SVGPathElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.3"] })

  React.useEffect(() => {
    const node = pathRef.current
    if (!node) return
    const length = node.getTotalLength()
    node.style.strokeDasharray = `${length}`
    return scrollYProgress.on("change", (value) => {
      node.style.strokeDashoffset = `${length * (1 - value)}`
    })
  }, [scrollYProgress])

  return (
    <div ref={ref} className={cn("w-full", className)}>
    <svg viewBox="0 0 240 150" className="w-full text-primary">
      <path d={d} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
      <path ref={pathRef} d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
    </div>
  )
}

export { TracingBeam, SvgScrollPath }
