"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/text-highlighter.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, useInView, type Transition, type UseInViewOptions } from "motion/react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type CSSProperties, type ElementType } from "react"

type HighlightDirection = "ltr" | "rtl" | "ttb" | "btt"

export interface TextHighlighterProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as?: ElementType
  triggerType?: "hover" | "ref" | "inView" | "auto"
  transition?: Transition
  useInViewOptions?: UseInViewOptions
  highlightColor?: string
  direction?: HighlightDirection
}

export interface TextHighlighterRef {
  animate: (direction?: HighlightDirection) => void
  reset: () => void
}

const defaultTransition: Transition = { type: "spring", duration: 1, delay: 0, bounce: 0 }
const defaultInView: UseInViewOptions = { once: true, initial: false, amount: 0.1 }

function backgroundSize(direction: HighlightDirection, animated: boolean) {
  if (!animated) return direction === "ttb" || direction === "btt" ? "100% 0%" : "0% 100%"
  return "100% 100%"
}

function backgroundPosition(direction: HighlightDirection) {
  if (direction === "rtl") return "100% 0%"
  if (direction === "btt") return "0% 100%"
  return "0% 0%"
}

export const TextHighlighter = forwardRef<TextHighlighterRef, TextHighlighterProps>(function TextHighlighter(
  {
    children,
    as = "span",
    triggerType = "inView",
    transition = defaultTransition,
    useInViewOptions = defaultInView,
    className,
    highlightColor = "hsl(25, 90%, 80%)",
    direction = "ltr",
    ...props
  },
  ref,
) {
  const componentRef = useRef<HTMLSpanElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [currentDirection, setCurrentDirection] = useState<HighlightDirection>(direction)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isInView = useInView(componentRef, useInViewOptions)
  const Tag = (as || "span") as "span"

  useEffect(() => {
    queueMicrotask(() => setCurrentDirection(direction))
  }, [direction])

  useImperativeHandle(ref, () => ({
    animate: (animationDirection?: HighlightDirection) => {
      if (animationDirection) setCurrentDirection(animationDirection)
      setIsAnimating(true)
    },
    reset: () => setIsAnimating(false),
  }))

  const triggered =
    triggerType === "hover"
      ? isHovered
      : triggerType === "inView"
        ? isInView
        : triggerType === "ref"
          ? isAnimating
          : triggerType === "auto"
  const highlighted = prefersReducedMotion || triggered
  const animatedSize = backgroundSize(currentDirection, highlighted)
  const initialSize = backgroundSize(currentDirection, prefersReducedMotion)
  const position = backgroundPosition(currentDirection)
  const highlightStyle = useMemo(
    () =>
      ({
        backgroundImage: `linear-gradient(${highlightColor}, ${highlightColor})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: position,
        backgroundSize: animatedSize,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }) as CSSProperties,
    [animatedSize, highlightColor, position],
  )

  return (
    <Tag
      {...props}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="text-highlighter"
      onMouseEnter={() => {
        if (triggerType === "hover") setIsHovered(true)
      }}
      onMouseLeave={() => {
        if (triggerType === "hover") setIsHovered(false)
      }}
      ref={componentRef}
    >
      <motion.span
        animate={{ backgroundSize: animatedSize }}
        className={cn("inline", className)}
        initial={{ backgroundSize: initialSize }}
        style={highlightStyle}
        transition={prefersReducedMotion ? { duration: 0 } : transition}
      >
        {children}
      </motion.span>
    </Tag>
  )
})
