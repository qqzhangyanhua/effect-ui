"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export type ScrollTypographyVariant = "clip" | "blur" | "scale" | "slide"

export interface ScrollTypographyProps {
  text: string
  variant?: ScrollTypographyVariant
  className?: string
}

function ScrollTypography({ text, variant = "clip", className }: ScrollTypographyProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.35"] })
  const letters = Array.from(text)

  return (
    <div ref={ref} className={cn("flex flex-wrap justify-center gap-x-1 font-display text-4xl", className)}>
      {letters.map((letter, index) => (
        <Letter key={`${letter}-${index}`} progress={scrollYProgress} index={index} total={letters.length} variant={variant}>
          {letter === " " ? "\u00a0" : letter}
        </Letter>
      ))}
    </div>
  )
}

function Letter({
  children,
  progress,
  index,
  total,
  variant,
}: {
  children: string
  progress: ReturnType<typeof useScroll>["scrollYProgress"]
  index: number
  total: number
  variant: ScrollTypographyVariant
}) {
  const start = index / total
  const end = Math.min(1, start + 0.18)
  const t = useTransform(progress, [start, end], [0, 1])
  const opacity = useTransform(t, [0, 1], [0.15, 1])
  const y = useTransform(t, [0, 1], [variant === "slide" ? 28 : 0, 0])
  const scale = useTransform(t, [0, 1], [variant === "scale" ? 1.45 : 1, 1])
  const blur = useTransform(t, [0, 1], [variant === "blur" ? 10 : 0, 0])
  const clip = useTransform(t, [0, 1], [variant === "clip" ? 100 : 0, 0])
  const filter = useTransform(blur, (value) => `blur(${value}px)`)
  const clipPath = useTransform(clip, (value) => `inset(0 ${value}% 0 0)`)

  return (
    <motion.span style={{ opacity, y, scale, filter, clipPath }} className="inline-block origin-bottom">
      {children}
    </motion.span>
  )
}

export { ScrollTypography }
