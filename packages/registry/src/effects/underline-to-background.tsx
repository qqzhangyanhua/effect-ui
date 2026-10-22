"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/underline-to-background.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion, type Transition } from "motion/react"
import { useEffect, useRef, type ReactNode, type Ref } from "react"

export interface UnderlineToBackgroundProps {
  children?: ReactNode
  as?: "span" | "a"
  className?: string
  href?: string
  transition?: Transition
  targetTextColor?: string
  underlineHeightRatio?: number
  underlinePaddingRatio?: number
}

export function UnderlineToBackground({
  children,
  as = "span",
  className,
  href,
  transition = { type: "spring", damping: 30, stiffness: 300 },
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  targetTextColor = "#fef",
}: UnderlineToBackgroundProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionTransition: Transition = prefersReducedMotion ? { duration: 0 } : transition
  const underlineVariants = {
    initial: { height: "var(--underline-height)" },
    target: { height: "100%", transition: motionTransition },
  }
  const textVariants = {
    initial: { color: "currentColor" },
    target: { color: targetTextColor, transition: motionTransition },
  }

  useEffect(() => {
    const updateUnderlineStyles = () => {
      const node = textRef.current
      if (!node) return
      const fontSize = Number.parseFloat(getComputedStyle(node).fontSize)
      node.style.setProperty("--underline-height", `${fontSize * underlineHeightRatio}px`)
      node.style.setProperty("--underline-padding", `${fontSize * underlinePaddingRatio}px`)
    }

    updateUnderlineStyles()
    window.addEventListener("resize", updateUnderlineStyles)
    return () => window.removeEventListener("resize", updateUnderlineStyles)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const classNames = cn("relative inline-block cursor-pointer", className)
  const content = (
    <>
      <motion.div
        aria-hidden="true"
        className="absolute w-full bg-current"
        style={{ height: "var(--underline-height)", bottom: "calc(-1 * var(--underline-padding))" }}
        variants={underlineVariants}
      />
      <motion.span className="relative text-current" variants={textVariants}>
        {children}
      </motion.span>
    </>
  )

  if (as === "a") {
    return (
      <motion.a
        className={classNames}
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-slot="underline-to-background"
        href={href}
        initial="initial"
        ref={textRef as Ref<HTMLAnchorElement>}
        whileHover="target"
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.span
      className={classNames}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="underline-to-background"
      initial="initial"
      ref={textRef}
      whileHover="target"
    >
      {content}
    </motion.span>
  )
}
