"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/letter-swap-pingpong-anim.tsx. Modified for effect-ui.

import { motion, useAnimate } from "motion/react"
import { useEffect, useRef, type MouseEventHandler } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LetterSwapPingPongProps {
  label: string
  reverse?: boolean
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

export function LetterSwapPingPong({
  label,
  reverse = true,
  staggerFrom = "first",
  staggerDuration = 0.03,
  className,
  onClick,
}: LetterSwapPingPongProps) {
  const reduced = usePrefersReducedMotion()
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const hovered = useRef(false)
  const bag = useRef<DebounceBag>({ trailed: false })
  const hiddenTop = reverse ? "-100%" : "100%"

  useEffect(() => {
    const current = bag.current
    return () => {
      if (current.timer !== undefined) window.clearTimeout(current.timer)
    }
  }, [])

  const play = (primary: string | number, secondary: string) => {
    const letters = scope.current?.querySelectorAll<HTMLElement>(".letter")
    const copies = scope.current?.querySelectorAll<HTMLElement>(".letter-secondary")
    letters?.forEach((node, index) => {
      animate(node, { y: primary }, { type: "spring", duration: 0.7, delay: staggerDelay(index, letters.length, staggerFrom, staggerDuration) })
    })
    copies?.forEach((node, index) => {
      animate(node, { top: secondary }, { type: "spring", duration: 0.7, delay: staggerDelay(index, copies.length, staggerFrom, staggerDuration) })
    })
  }

  return (
    <motion.span
      ref={scope}
      className={cn("relative inline-flex items-center overflow-hidden", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="letter-swap-pingpong"
      onClick={onClick}
      onHoverEnd={() => {
        if (reduced) return
        runDebounced(bag.current, 100, () => {
          hovered.current = false
          play(0, hiddenTop)
        })
      }}
      onHoverStart={() => {
        if (reduced) return
        runDebounced(bag.current, 100, () => {
          if (hovered.current) return
          hovered.current = true
          play(reverse ? "100%" : "-100%", "0%")
        })
      }}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter, index) => (
        <span key={`${letter}-${index}`} aria-hidden className="relative inline-flex whitespace-pre">
          <motion.span className="letter relative" style={{ top: 0 }}>
            {letter}
          </motion.span>
          <motion.span className="letter-secondary absolute" style={{ top: hiddenTop }}>
            {letter}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
