"use client"

import * as React from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

import { cn } from "@/lib/utils"

export interface SplitTextProps {
  text: string
  delay?: number
  by?: "char" | "word"
  className?: string
}

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

function SplitText({
  text,
  delay = 0,
  by = "char",
  className,
}: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion()
  const [reduced, setReduced] = React.useState(false)
  const pieces = React.useMemo(
    () => (by === "word" ? text.split(/(\s+)/) : Array.from(text)),
    [by, text],
  )

  React.useEffect(() => {
    setReduced(prefersReducedMotion === true)
  }, [prefersReducedMotion])

  return (
    <motion.span
      data-slot="split-text"
      className={cn("inline-flex flex-wrap", className)}
      variants={container}
      initial={reduced ? false : "hidden"}
      animate="show"
      transition={reduced ? { duration: 0, delayChildren: 0 } : { delayChildren: delay }}
    >
      {pieces.map((piece, index) => (
        <motion.span
          key={`${piece}-${index}`}
          variants={item}
          className="inline-block"
          transition={
            reduced ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {piece === " " ? "\u00A0" : piece}
        </motion.span>
      ))}
    </motion.span>
  )
}

export { SplitText }
