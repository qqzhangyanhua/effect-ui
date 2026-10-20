"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TextGenerateProps {
  text: string
  className?: string
}

function TextGenerate({ text, className }: TextGenerateProps) {
  const reduced = usePrefersReducedMotion()
  const words = text.split(/\s+/).filter((word) => word.length > 0)

  return (
    <p data-slot="text-generate" className={cn("min-h-16 text-2xl leading-relaxed", className)} aria-live="polite">
      {words.map((word, index) => (
        <motion.span
          key={`${index}-${word}`}
          className="mr-[0.3em] inline-block"
          initial={reduced ? false : { opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: reduced ? 0 : 0.35 }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}

export { TextGenerate }
