"use client"

import * as React from "react"
import { motion, useScroll, useTransform, type MotionValue } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TextVariableScrollProps {
  text?: string
  className?: string
}

function Letter({
  char,
  index,
  progress,
  reduced,
}: {
  char: string
  index: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const weight = useTransform(progress, (value) => {
    if (reduced) return 500
    const wave = Math.sin(value * Math.PI * 2 + index * 0.45)
    return Math.round(280 + (wave * 0.5 + 0.5) * 520)
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
}: TextVariableScrollProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  return (
    <section ref={ref} className={cn("rounded-2xl border bg-background px-6 py-16", className)}>
      <p className="font-sans text-4xl leading-tight tracking-tight sm:text-6xl">
        {Array.from(text).map((char, index) => (
          <Letter key={`${char}-${index}`} char={char} index={index} progress={scrollYProgress} reduced={reduced} />
        ))}
      </p>
    </section>
  )
}

export { TextVariableScroll }
