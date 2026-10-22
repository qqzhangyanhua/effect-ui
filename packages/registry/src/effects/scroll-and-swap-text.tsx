"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/scroll-and-swap-text.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, useScroll, useSpring, useTransform } from "motion/react"
import { isValidElement, useMemo, useRef, type ReactNode, type RefObject } from "react"

function extractText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return ""
  if (typeof children === "string" || typeof children === "number") return String(children)
  if (Array.isArray(children)) return children.map((child) => extractText(child)).join("")
  if (isValidElement<{ children?: ReactNode }>(children)) return extractText(children.props.children)
  return ""
}

export interface ScrollAndSwapTextProps {
  children?: ReactNode
  as?: "span" | "div" | "p" | "a"
  containerRef: RefObject<HTMLElement | null>
  offset?: [string, string]
  className?: string
  springConfig?: { stiffness?: number; damping?: number; mass?: number }
}

export function ScrollAndSwapText({
  children,
  as = "span",
  offset = ["0 0", "0 1"],
  className,
  containerRef,
  springConfig = { stiffness: 200, damping: 30 },
}: ScrollAndSwapTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const text = useMemo(() => extractText(children), [children])
  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: ref,
    offset: offset as ["start start", "end end"],
  })
  const springScrollYProgress = useSpring(scrollYProgress, springConfig)
  const top = useTransform(springScrollYProgress, [0, 1], ["0%", "-100%"])
  const bottom = useTransform(springScrollYProgress, [0, 1], ["100%", "0%"])
  const Tag = as as "span"

  return (
    <Tag
      className={cn("relative flex items-center justify-center overflow-hidden p-0", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="scroll-and-swap-text"
      ref={ref}
    >
      <span aria-hidden="true" className="relative text-transparent">
        {text}
      </span>
      {prefersReducedMotion ? (
        <span className="absolute top-0">{text}</span>
      ) : (
        <>
          <motion.span className="absolute" style={{ top }}>
            {text}
          </motion.span>
          <motion.span aria-hidden="true" className="absolute" style={{ top: bottom }}>
            {text}
          </motion.span>
        </>
      )}
    </Tag>
  )
}
