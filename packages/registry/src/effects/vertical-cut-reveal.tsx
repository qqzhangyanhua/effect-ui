"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/vertical-cut-reveal.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, type AnimationOptions } from "motion/react"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react"

export interface VerticalCutRevealProps {
  children: React.ReactNode
  reverse?: boolean
  transition?: AnimationOptions
  splitBy?: "words" | "characters" | "lines" | string
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | "random" | number
  containerClassName?: string
  wordLevelClassName?: string
  elementLevelClassName?: string
  onClick?: () => void
  onStart?: () => void
  onComplete?: () => void
  autoStart?: boolean
}

export interface VerticalCutRevealRef {
  startAnimation: () => void
  reset: () => void
}

interface Segment {
  characters: string[]
  needsSpace: boolean
}

const spring: AnimationOptions = { type: "spring", stiffness: 190, damping: 22 }

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" })
    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }
  return Array.from(text)
}

function toSegments(text: string, splitBy: string): Segment[] {
  const words = text.split(" ")
  if (splitBy === "characters") {
    return words.map((word, index) => ({
      characters: splitIntoCharacters(word),
      needsSpace: index !== words.length - 1,
    }))
  }
  const parts = splitBy === "words" ? words : splitBy === "lines" ? text.split("\n") : text.split(splitBy)
  return parts.map((part, index) => ({
    characters: [part],
    needsSpace: index !== parts.length - 1,
  }))
}

function transitionDelay(transition: AnimationOptions): number {
  if ("delay" in transition && typeof transition.delay === "number") return transition.delay
  return 0
}

export const VerticalCutReveal = forwardRef<VerticalCutRevealRef, VerticalCutRevealProps>(function VerticalCutReveal(
  {
    children,
    reverse = false,
    transition = spring,
    splitBy = "words",
    staggerDuration = 0.2,
    staggerFrom = "first",
    containerClassName,
    wordLevelClassName,
    elementLevelClassName,
    onClick,
    onStart,
    onComplete,
    autoStart = true,
  },
  ref,
) {
  const text = typeof children === "string" ? children : children == null ? "" : String(children)
  const [isAnimating, setIsAnimating] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()
  const elements = useMemo(() => toSegments(text, splitBy), [splitBy, text])

  const getStaggerDelay = useCallback(
    (index: number) => {
      const total =
        splitBy === "characters"
          ? elements.reduce((acc, word) => acc + word.characters.length + (word.needsSpace ? 1 : 0), 0)
          : elements.length
      if (staggerFrom === "first") return index * staggerDuration
      if (staggerFrom === "last") return (total - 1 - index) * staggerDuration
      if (staggerFrom === "center") return Math.abs(Math.floor(total / 2) - index) * staggerDuration
      if (staggerFrom === "random") {
        const randomIndex = Math.floor(Math.random() * total)
        return Math.abs(randomIndex - index) * staggerDuration
      }
      return Math.abs(staggerFrom - index) * staggerDuration
    },
    [elements, splitBy, staggerDuration, staggerFrom],
  )

  const startAnimation = useCallback(() => {
    setIsAnimating(true)
    onStart?.()
  }, [onStart])

  useImperativeHandle(ref, () => ({
    startAnimation,
    reset: () => setIsAnimating(false),
  }))

  useEffect(() => {
    if (!autoStart || prefersReducedMotion) return
    queueMicrotask(() => startAnimation())
  }, [autoStart, prefersReducedMotion, startAnimation])

  const variants = {
    hidden: { y: prefersReducedMotion ? 0 : reverse ? "-100%" : "100%" },
    visible: (index: number) => ({
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0 }
        : { ...transition, delay: transitionDelay(transition) + getStaggerDelay(index) },
    }),
  }

  const revealed = prefersReducedMotion || isAnimating

  return (
    <span
      className={cn("flex flex-wrap whitespace-pre-wrap", splitBy === "lines" && "flex-col", containerClassName)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="vertical-cut-reveal"
      onClick={onClick}
    >
      <span className="sr-only">{text}</span>
      {elements.map((wordObj, wordIndex, array) => {
        const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0)
        const lastWord = wordIndex === array.length - 1
        return (
          <span aria-hidden="true" className={cn("inline-flex overflow-hidden", wordLevelClassName)} key={wordIndex}>
            {wordObj.characters.map((char, charIndex) => (
              <span className={cn("relative whitespace-pre-wrap", elementLevelClassName)} key={charIndex}>
                <motion.span
                  animate={revealed ? "visible" : "hidden"}
                  className="inline-block"
                  custom={previousCharsCount + charIndex}
                  initial={prefersReducedMotion ? "visible" : "hidden"}
                  onAnimationComplete={lastWord && charIndex === wordObj.characters.length - 1 ? onComplete : undefined}
                  variants={variants}
                >
                  {char}
                </motion.span>
              </span>
            ))}
            {wordObj.needsSpace ? <span> </span> : null}
          </span>
        )
      })}
    </span>
  )
})
