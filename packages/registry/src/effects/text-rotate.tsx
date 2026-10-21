"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/utils"

export type TextRotateAnimation = "slide" | "blur" | "glyph"

export interface TextRotateProps extends Omit<React.ComponentProps<"span">, "children"> {
  texts: string[]
  interval?: number
  animation?: TextRotateAnimation
  "data-slot"?: string
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}

// 同一字符多次出现时用序号区分，layout 才能对上共同字母。
function glyphsOf(text: string) {
  const seen = new Map<string, number>()
  return Array.from(text).map((char) => {
    const count = seen.get(char) ?? 0
    seen.set(char, count + 1)
    return { char, id: `${char}-${count}` }
  })
}

const slideMotion = {
  initial: { y: 16, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -16, opacity: 0 },
  transition: { duration: 0.28 },
}

const blurMotion = {
  initial: { filter: "blur(10px)", opacity: 0, scale: 0.96 },
  animate: { filter: "blur(0px)", opacity: 1, scale: 1 },
  exit: { filter: "blur(10px)", opacity: 0, scale: 1.04 },
  transition: { duration: 0.4 },
}

function TextRotate({
  texts,
  interval = 1800,
  animation = "slide",
  className,
  style,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
  "data-slot": dataSlot,
  "aria-label": ariaLabel,
  ...props
}: TextRotateProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    if (reduced || texts.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % texts.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [interval, reduced, texts.length])

  const text = (reduced ? texts[0] : texts[index]) ?? ""
  const itemClass = animation === "blur" ? "col-start-1 row-start-1" : "inline-block"

  return (
    <span
      {...props}
      style={textStyle(style, fontSize, fontWeight, letterSpacing, align)}
      aria-label={animation === "glyph" ? text : ariaLabel}
      className={cn(
        animation === "blur" ? "relative inline-grid" : "inline-flex",
        animation === "slide" && "overflow-hidden",
        className,
      )}
      data-slot={dataSlot ?? "text-rotate"}
    >
      {animation === "glyph" ? (
        <AnimatePresence mode="popLayout" initial={false}>
          {glyphsOf(text).map((glyph) => (
            <motion.span
              key={glyph.id}
              layout={reduced ? false : "position"}
              initial={reduced ? false : { opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="inline-block"
            >
              {glyph.char === " " ? "\u00a0" : glyph.char}
            </motion.span>
          ))}
        </AnimatePresence>
      ) : reduced ? (
        <span className={itemClass}>{text}</span>
      ) : (
        <AnimatePresence mode="wait">
          <motion.span
            key={text}
            className={itemClass}
            {...(animation === "blur" ? blurMotion : slideMotion)}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      )}
    </span>
  )
}

export { TextRotate }
