"use client"

import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface TextVariableScrollProps {
  text?: string
  className?: string
  /** 字重波动幅度。不传则按原来的幅度。 */
  intensity?: number
  fontSize?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function Letter({
  char,
  index,
  progress,
  reduced,
  intensity,
}: {
  char: string
  index: number
  progress: MotionValue<number>
  reduced: boolean
  intensity: number
}) {
  const weight = useTransform(progress, (value) => {
    if (reduced) return 500
    const wave = Math.sin(value * Math.PI * 2 + index * 0.45)
    return Math.round(280 + (wave * 0.5 + 0.5) * 520 * intensity)
  })
  const width = useTransform(progress, (value) => {
    if (reduced) return 100
    const wave = Math.sin(value * Math.PI * 2 + index * 0.45)
    return Math.round(75 + (wave * 0.5 + 0.5) * 50)
  })
  const variation = useTransform(width, (value) => `"wdth" ${value}`)

  return (
    <motion.span
      className="inline-block"
      style={{ fontWeight: weight, fontVariationSettings: variation }}
    >
      {char === " " ? "\u00a0" : char}
    </motion.span>
  )
}

function TextVariableScroll({
  text = "Weight moves through the letters",
  className,
  intensity,
  fontSize,
  letterSpacing,
  align,
}: TextVariableScrollProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  return (
    <section ref={ref} className={cn("rounded-2xl border bg-background px-6 py-16", className)}>
      <p
        className="font-sans text-4xl leading-tight tracking-tight sm:text-6xl"
        style={textStyle(undefined, fontSize, undefined, letterSpacing, align)}
      >
        {Array.from(text).map((char, index) => (
          <Letter
            key={`${char}-${index}`}
            char={char}
            index={index}
            progress={scrollYProgress}
            reduced={reduced}
            intensity={intensity ?? 1}
          />
        ))}
      </p>
    </section>
  )
}

export { TextVariableScroll }
