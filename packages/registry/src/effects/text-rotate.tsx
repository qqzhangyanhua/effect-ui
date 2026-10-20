"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type TextRotateAnimation = "slide" | "blur" | "glyph"

export interface TextRotateProps extends Omit<React.ComponentProps<"span">, "children"> {
  texts: string[]
  interval?: number
  animation?: TextRotateAnimation
  "data-slot"?: string
}

function rootClass(animation: TextRotateAnimation) {
  if (animation === "slide") return "inline-flex overflow-hidden"
  if (animation === "blur") return "relative inline-grid"
  return "inline-flex"
}

function itemClass(animation: "slide" | "blur") {
  if (animation === "blur") return "col-start-1 row-start-1"
  return "inline-block"
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

function glyphChar(char: string) {
  return char === " " ? "\u00a0" : char
}

function SwapText({ animation, text }: { animation: "slide" | "blur"; text: string }) {
  const item = itemClass(animation)
  if (animation === "blur") {
    return (
      <AnimatePresence mode="wait">
        <motion.span
          key={text}
          initial={{ filter: "blur(10px)", opacity: 0, scale: 0.96 }}
          animate={{ filter: "blur(0px)", opacity: 1, scale: 1 }}
          exit={{ filter: "blur(10px)", opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.4 }}
          className={item}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    )
  }
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={text}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.28 }}
        className={item}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}

function Glyphs({ reduced, text }: { reduced: boolean; text: string }) {
  const glyphs = glyphsOf(text)
  if (reduced) {
    return glyphs.map((glyph) => (
      <span key={glyph.id} className="inline-block">
        {glyphChar(glyph.char)}
      </span>
    ))
  }
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      {glyphs.map((glyph) => (
        <motion.span
          key={glyph.id}
          layout="position"
          initial={{ opacity: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="inline-block"
        >
          {glyphChar(glyph.char)}
        </motion.span>
      ))}
    </AnimatePresence>
  )
}

function TextBody({
  animation,
  reduced,
  text,
}: {
  animation: TextRotateAnimation
  reduced: boolean
  text: string
}) {
  if (animation === "glyph") return <Glyphs reduced={reduced} text={text} />
  if (reduced) return <span className={itemClass(animation)}>{text}</span>
  return <SwapText animation={animation} text={text} />
}

function TextRotate({
  texts,
  interval = 1800,
  animation = "slide",
  className,
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

  return (
    <span
      {...props}
      aria-label={animation === "glyph" ? text : ariaLabel}
      className={cn(rootClass(animation), className)}
      data-slot={dataSlot ?? "text-rotate"}
    >
      <TextBody animation={animation} reduced={reduced} text={text} />
    </span>
  )
}

export { TextRotate }
