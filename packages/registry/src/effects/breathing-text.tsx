"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/breathing-text.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, type Transition, type Variants } from "motion/react"
import { useRef, type ElementType } from "react"

export interface BreathingTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  fromFontVariationSettings: string
  toFontVariationSettings: string
  transition?: Transition
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number
  repeatDelay?: number
}

const defaultTransition: Transition = { duration: 1.5, ease: "easeInOut" }

function customIndex(index: number, total: number, staggerFrom: "first" | "last" | "center" | number) {
  if (typeof staggerFrom === "number") return Math.abs(index - staggerFrom)
  if (staggerFrom === "first") return index
  if (staggerFrom === "last") return total - 1 - index
  return Math.abs(index - Math.floor(total / 2))
}

export function BreathingText({
  children,
  as = "span",
  fromFontVariationSettings,
  toFontVariationSettings,
  transition = defaultTransition,
  staggerDuration = 0.1,
  staggerFrom = "first",
  repeatDelay = 0.1,
  className,
  ...props
}: BreathingTextProps) {
  const hostRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(hostRef)
  const breathing = !prefersReducedMotion && motionOn
  const letters = String(children ?? "").split("")
  const Tag = as as "span"
  const label = typeof children === "string" || typeof children === "number" ? String(children) : letters.join("")

  const letterVariants: Variants = {
    initial: { fontVariationSettings: fromFontVariationSettings },
    animate: (index: number) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: {
        ...transition,
        repeat: Infinity,
        repeatType: "mirror",
        delay: index * staggerDuration,
        repeatDelay,
      },
    }),
  }

  return (
    <Tag
      {...props}
      className={cn(
        "relative after:pointer-events-none after:invisible after:absolute after:h-0 after:overflow-hidden after:font-black after:select-none after:content-[attr(data-text)]",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="breathing-text"
      data-text={label}
      ref={hostRef as React.Ref<HTMLSpanElement>}
    >
      {letters.map((letter, index) => (
        <motion.span
          animate={breathing ? "animate" : "initial"}
          aria-hidden
          className="inline-block whitespace-pre"
          custom={customIndex(index, letters.length, staggerFrom)}
          initial="initial"
          key={`${letter}-${index}`}
          variants={letterVariants}
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{children}</span>
    </Tag>
  )
}
