"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export interface WordRotateProps {
  words: string[]
  className?: string
  interval?: number
}

function WordRotate({ words, className, interval = 1800 }: WordRotateProps) {
  const prefersReducedMotion = useReducedMotion()
  const [reduced, setReduced] = React.useState(false)
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    setReduced(prefersReducedMotion === true)
  }, [prefersReducedMotion])

  React.useEffect(() => {
    if (reduced || words.length === 0) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [interval, reduced, words.length])

  const word = (reduced ? words[0] : words[index]) ?? ""

  return (
    <span data-slot="word-rotate" className={cn("inline-flex overflow-hidden", className)}>
      {reduced ? (
        <span className="inline-block">{word}</span>
      ) : (
        <AnimatePresence mode="wait">
          <motion.span
            key={word}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  )
}

export { WordRotate }
