"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TextMorphProps {
  texts?: string[]
  className?: string
}

function glyphsOf(text: string) {
  const seen = new Map<string, number>()
  return Array.from(text).map((char) => {
    const count = seen.get(char) ?? 0
    seen.set(char, count + 1)
    return { char, id: `${char}-${count}` }
  })
}

function TextMorph({ texts = ["Design", "Delight"], className }: TextMorphProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const text = texts[index] ?? ""

  React.useEffect(() => {
    if (reduced || texts.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % texts.length)
    }, 1800)
    return () => window.clearInterval(timer)
  }, [reduced, texts.length])

  return (
    <span className={cn("inline-flex font-display text-4xl", className)} aria-label={text}>
      <AnimatePresence mode="popLayout" initial={false}>
        {glyphsOf(text).map((glyph) => (
          <motion.span
            key={glyph.id}
            layout={reduced ? false : "position"}
            initial={reduced ? false : { opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 1 } : { opacity: 0, filter: "blur(8px)" }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 28 }}
            className="inline-block"
          >
            {glyph.char === " " ? "\u00a0" : glyph.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

export { TextMorph }
