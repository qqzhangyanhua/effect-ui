"use client"

import * as React from "react"
import { motion, type Variants } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SplitTextProps {
  text: string
  /** 入场延迟，单位秒。保持原含义。 */
  delay?: number
  by?: "char" | "word"
  className?: string
  /** 入场结束后再播一次。不传则只播一次。 */
  loop?: boolean
  /** 精细指针移入时重播。触屏上忽略移入。 */
  interactive?: boolean
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches
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
  loop = false,
  interactive = false,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: SplitTextProps) {
  const reduced = usePrefersReducedMotion()
  const [replay, setReplay] = React.useState(0)
  const pieces = React.useMemo(
    () => (by === "word" ? text.split(/(\s+)/) : Array.from(text)),
    [by, text],
  )
  const style: React.CSSProperties = {}
  if (fontSize !== undefined) style.fontSize = fontSize
  if (fontWeight !== undefined) style.fontWeight = fontWeight
  if (letterSpacing !== undefined) style.letterSpacing = `${letterSpacing}em`
  if (align !== undefined) style.textAlign = align

  return (
    <motion.span
      key={replay}
      data-slot="split-text"
      className={cn("inline-flex flex-wrap", className)}
      style={Object.keys(style).length > 0 ? style : undefined}
      variants={container}
      initial={reduced ? false : "hidden"}
      animate="show"
      transition={reduced ? { duration: 0, delayChildren: 0 } : { delayChildren: delay }}
      onAnimationComplete={() => {
        if (loop && !reduced) setReplay((current) => current + 1)
      }}
      onPointerEnter={() => {
        if (reduced || !interactive || coarsePointer()) return
        setReplay((current) => current + 1)
      }}
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
