"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/blocks/element-along-svg-path.tsx. Modified for effect-ui.

import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react"
import { createContext, useContext, useId, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ElementAlongSvgPathProps {
  path: string
  children?: ReactNode
  animationType?: "auto" | "scroll"
  showPath?: boolean
  duration?: number
  direction?: "normal" | "reverse"
  viewBox?: string
  width?: string | number
  height?: string | number
  className?: string
}

interface PathContextValue {
  path: string
  animationType: "auto" | "scroll"
  direction: "normal" | "reverse"
  duration: number
  reduced: boolean
  active: boolean
  scrollYProgress: MotionValue<number>
}

const PathContext = createContext<PathContextValue | null>(null)

interface ElementAlongItemOptions {
  children: ReactNode
  className?: string
  startOffset?: number
}

const CSS = `
@keyframes element-along-svg-path-travel{from{offset-distance:var(--element-along-from)}to{offset-distance:var(--element-along-to)}}
`

function cssPath(path: string) {
  return `path('${path.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}')`
}

export function ElementAlongPathItem({ children, className, startOffset = 0 }: ElementAlongItemOptions) {
  const ctx = useContext(PathContext)
  const fallback = useMotionValue(0)
  const start = ctx ? (ctx.direction === "normal" ? startOffset : 100 - startOffset) : startOffset
  const end = ctx?.direction === "reverse" ? 0 : 100
  const scrollDistance = useTransform(ctx?.scrollYProgress ?? fallback, (value) => `${start + value * (end - start)}%`)
  if (!ctx) throw new Error("ElementAlongPathItem 必须放在 ElementAlongSvgPath 里")
  const motionOn = ctx.animationType === "auto" && !ctx.reduced && ctx.active
  const style = {
    offsetPath: cssPath(ctx.path),
    "--element-along-from": `${start}%`,
    "--element-along-to": `${end}%`,
  } as const

  if (ctx.animationType === "scroll" && !ctx.reduced) {
    return (
      <motion.div className={cn("absolute top-0 left-0", className)} style={{ ...style, offsetDistance: scrollDistance }}>
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={cn("absolute top-0 left-0", className)}
      style={{
        ...style,
        offsetDistance: `${start}%`,
        animationName: motionOn ? "element-along-svg-path-travel" : "none",
        animationDuration: `${ctx.duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      }}
    >
      {children}
    </div>
  )
}

export function ElementAlongSvgPath({
  path,
  children,
  animationType = "auto",
  showPath = false,
  duration = 4,
  direction = "normal",
  viewBox = "0 0 100 100",
  width = "100%",
  height = "100%",
  className,
}: ElementAlongSvgPathProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(ref)
  const id = useId()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })

  return (
    <PathContext.Provider value={{ path, animationType, direction, duration, reduced, active, scrollYProgress }}>
      <div
        ref={ref}
        className={cn("relative", className)}
        data-motion={!reduced && active ? "on" : "off"}
        data-reduced={reduced ? "true" : "false"}
        data-slot="element-along-svg-path"
      >
        <style>{CSS}</style>
        <svg aria-hidden className="h-full w-full" height={height} preserveAspectRatio="xMidYMid meet" viewBox={viewBox} width={width}>
          <path d={path} fill="none" id={id} stroke={showPath ? "currentColor" : "none"} />
        </svg>
        {children}
      </div>
    </PathContext.Provider>
  )
}
