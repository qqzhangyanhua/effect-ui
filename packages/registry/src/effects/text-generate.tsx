"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export interface TextGenerateProps {
  text: string
  className?: string
  /** 每个词显出的时长，毫秒。不传则 350。 */
  duration?: number
  /** 词与词之间的等待，毫秒。不传则一起显出。 */
  delay?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function TextGenerate({
  text,
  className,
  duration,
  delay,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: TextGenerateProps) {
  const reduced = usePrefersReducedMotion()
  const words = text.split(/\s+/).filter((word) => word.length > 0)

  return (
    <p
      data-slot="text-generate"
      className={cn("min-h-16 text-2xl leading-relaxed", className)}
      style={textStyle(undefined, fontSize, fontWeight, letterSpacing, align)}
      aria-live="polite"
    >
      {words.map((word, index) => (
        <motion.span
          key={`${index}-${word}`}
          className="mr-[0.3em] inline-block"
          initial={reduced ? false : { opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{
            duration: reduced ? 0 : (duration ?? 350) / 1000,
            delay: reduced ? 0 : (index * (delay ?? 0)) / 1000,
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}

export { TextGenerate }
