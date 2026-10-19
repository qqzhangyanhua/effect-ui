"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface MorphingTextProps {
  texts: string[]
  className?: string
  interval?: number
}

function MorphingText({ texts, className, interval = 2200 }: MorphingTextProps) {
  const prefersReducedMotion = useReducedMotion()
  const [reduced, setReduced] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    setReduced(prefersReducedMotion === true)
  }, [prefersReducedMotion])

  React.useEffect(() => {
    if (reduced || texts.length === 0) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % texts.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [interval, reduced, texts.length])

  const text = (reduced ? texts[0] : texts[index]) ?? ""

  return (
    <span data-slot="morphing-text" className={cn("relative inline-grid", className)}>
      {reduced ? (
        <span className="col-start-1 row-start-1">{text}</span>
      ) : (
        <AnimatePresence mode="wait">
          <motion.span
            key={text}
            initial={{ filter: "blur(10px)", opacity: 0, scale: 0.96 }}
            animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
            exit={{ filter: "blur(10px)", opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4 }}
            className="col-start-1 row-start-1"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  )
}

export { MorphingText }
