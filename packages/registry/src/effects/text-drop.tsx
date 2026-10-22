"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/text/text-drop/TextDrop.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"

export interface TextDropProps {
  text: string
  stagger?: number
  delay?: number
  className?: string
}

const letter = {
  hidden: { y: "120%", opacity: 0 },
  visible: { y: "0%", opacity: 1 },
}

export function TextDrop({ text, stagger = 0.035, delay = 0, className }: TextDropProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  if (prefersReducedMotion) {
    return (
      <span className={cn("inline-block text-3xl font-semibold", className)} data-reduced="true" data-slot="text-drop">
        {text}
      </span>
    )
  }

  const words = text.split(" ")
  return (
    <motion.span
      animate="visible"
      className={cn("inline-block text-3xl font-semibold", className)}
      data-reduced="false"
      data-slot="text-drop"
      initial="hidden"
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, wordIndex) => (
        <span className="inline-block whitespace-nowrap" key={`${word}-${wordIndex}`}>
          {[...word, wordIndex < words.length - 1 ? "\u00A0" : ""].map((char, charIndex) =>
            char ? (
              <span className="inline-block overflow-hidden" key={`${char}-${charIndex}`}>
                <motion.span
                  className="inline-block"
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  variants={letter}
                >
                  {char}
                </motion.span>
              </span>
            ) : null,
          )}
        </span>
      ))}
    </motion.span>
  )
}
