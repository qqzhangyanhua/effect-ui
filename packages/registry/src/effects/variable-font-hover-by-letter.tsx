"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/variable-font-hover-by-letter.tsx. Modified for effect-ui.

import { motion, useAnimate } from "motion/react"
import { useEffect, useRef, type MouseEventHandler } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface VariableFontHoverByLetterProps {
  label: string
  from?: string
  to?: string
  staggerFrom?: "first" | "last" | "center" | number
  staggerDuration?: number
  className?: string
  onClick?: MouseEventHandler<HTMLSpanElement>
}

type DebounceBag = { timer?: number; trailed: boolean }

function runDebounced(bag: DebounceBag, wait: number, fn: () => void) {
  if (bag.timer === undefined) {
    bag.trailed = false
    fn()
  } else {
    bag.trailed = true
    window.clearTimeout(bag.timer)
  }
  bag.timer = window.setTimeout(() => {
    const again = bag.trailed
    bag.timer = undefined
    bag.trailed = false
    if (again) fn()
  }, wait)
}

function staggerDelay(index: number, count: number, from: "first" | "last" | "center" | number, step: number) {
  if (count <= 1) return 0
  if (from === "first") return index * step
  if (from === "last") return (count - 1 - index) * step
  if (from === "center") return Math.abs(index - (count - 1) / 2) * step
  return Math.abs(index - from) * step
}

export function VariableFontHoverByLetter({
  label,
  from = "'wght' 400, 'slnt' 0",
  to = "'wght' 900, 'slnt' -10",
  staggerFrom = "first",
  staggerDuration = 0.03,
  className,
  onClick,
}: VariableFontHoverByLetterProps) {
  const reduced = usePrefersReducedMotion()
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const hovered = useRef(false)
  const bag = useRef<DebounceBag>({ trailed: false })

  useEffect(() => {
    const current = bag.current
    return () => {
      if (current.timer !== undefined) window.clearTimeout(current.timer)
    }
  }, [])

  const play = (target: string) => {
    const nodes = scope.current?.querySelectorAll<HTMLElement>(".letter")
    if (!nodes) return
    nodes.forEach((node, index) => {
      animate(node, { fontVariationSettings: target }, { type: "spring", duration: 0.7, delay: staggerDelay(index, nodes.length, staggerFrom, staggerDuration) })
    })
  }

  return (
    <motion.span
      ref={scope}
      className={cn("inline-block", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="variable-font-hover-by-letter"
      onClick={onClick}
      onHoverEnd={() => {
        if (reduced) return
        runDebounced(bag.current, 100, () => {
          hovered.current = false
          play(from)
        })
      }}
      onHoverStart={() => {
        if (reduced) return
        runDebounced(bag.current, 100, () => {
          if (hovered.current) return
          hovered.current = true
          play(to)
        })
      }}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter, index) => (
        <motion.span key={`${letter}-${index}`} aria-hidden className="letter inline-block whitespace-pre" style={{ fontVariationSettings: from }}>
          {letter}
        </motion.span>
      ))}
    </motion.span>
  )
}
