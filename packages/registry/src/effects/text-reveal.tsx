"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

export interface TextRevealProps {
  text: string
  className?: string
}

function TextReveal({ text, className }: TextRevealProps) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  })
  const words = text.split(" ")

  return (
    <p
      ref={ref}
      data-slot="text-reveal"
      className={cn("flex flex-wrap gap-x-2 gap-y-1 text-2xl font-medium", className)}
    >
      {words.map((word, index) => (
        <Word key={`${word}-${index}`} progress={scrollYProgress} index={index} total={words.length}>
          {word}
        </Word>
      ))}
    </p>
  )
}

function Word({
  children,
  progress,
  index,
  total,
}: {
  children: string
  progress: ReturnType<typeof useScroll>["scrollYProgress"]
  index: number
  total: number
}) {
  const start = index / total
  const end = start + 1 / total
  const opacity = useTransform(progress, [start, end], [0.18, 1])

  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  )
}

export { TextReveal }
