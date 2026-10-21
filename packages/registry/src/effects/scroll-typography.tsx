"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export type ScrollTypographyVariant = "clip" | "blur" | "scale" | "slide"

export interface ScrollTypographyProps {
  text: string
  variant?: ScrollTypographyVariant
  className?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function ScrollTypography({
  text,
  variant = "clip",
  className,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: ScrollTypographyProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.35"] })
  const letters = Array.from(text)

  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap justify-center gap-x-1 font-display text-4xl", className)}
      style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
    >
      {letters.map((letter, index) => (
        <Letter
          key={`${letter}-${index}`}
          progress={scrollYProgress}
          index={index}
          total={letters.length}
          variant={variant}
          reduced={reduced}
        >
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
  reduced,
}: {
  children: string
  progress: ReturnType<typeof useScroll>["scrollYProgress"]
  index: number
  total: number
  variant: ScrollTypographyVariant
  reduced: boolean
}) {
  const start = index / total
  const end = Math.min(1, start + 0.18)
  const t = useTransform(progress, [start, end], [0, 1])
  const opacity = useTransform(t, [0, 1], reduced ? [1, 1] : [0.15, 1])
  const y = useTransform(t, [0, 1], reduced ? [0, 0] : [variant === "slide" ? 28 : 0, 0])
  const scale = useTransform(t, [0, 1], reduced ? [1, 1] : [variant === "scale" ? 1.45 : 1, 1])
  const blur = useTransform(t, [0, 1], reduced ? [0, 0] : [variant === "blur" ? 10 : 0, 0])
  const clip = useTransform(t, [0, 1], reduced ? [0, 0] : [variant === "clip" ? 100 : 0, 0])
  const filter = useTransform(blur, (value) => `blur(${value}px)`)
  const clipPath = useTransform(clip, (value) => `inset(0 ${value}% 0 0)`)

  return (
    <motion.span style={{ opacity, y, scale, filter, clipPath }} className="inline-block origin-bottom">
      {children}
    </motion.span>
  )
}

export { ScrollTypography }
