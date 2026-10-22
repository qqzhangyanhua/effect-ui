"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/random-letter-swap-forward-anim.tsx. Modified for effect-ui.

import { motion, useAnimate } from "motion/react"
import { useEffect, useRef, type MouseEventHandler } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface RandomLetterSwapProps {
  label: string
  reverse?: boolean
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

function shuffle(length: number) {
  const order = Array.from({ length }, (_, index) => index)
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    const current = order[index]
    const next = order[swap]
    if (current === undefined || next === undefined) continue
    order[index] = next
    order[swap] = current
  }
  return order
}

export function RandomLetterSwap({ label, reverse = true, staggerDuration = 0.02, className, onClick }: RandomLetterSwapProps) {
  const reduced = usePrefersReducedMotion()
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const blocked = useRef(false)
  const bag = useRef<DebounceBag>({ trailed: false })
  const hiddenTop = reverse ? "-100%" : "100%"

  useEffect(() => {
    const current = bag.current
    return () => {
      if (current.timer !== undefined) window.clearTimeout(current.timer)
    }
  }, [])

  const play = () => {
    if (blocked.current || label.length === 0) return
    blocked.current = true
    const order = shuffle(label.length)
    let pending = label.length
    order.forEach((letterIndex, step) => {
      const primary = scope.current?.querySelector<HTMLElement>(`.letter-${letterIndex}`)
      const secondary = scope.current?.querySelector<HTMLElement>(`.letter-secondary-${letterIndex}`)
      const delay = step * staggerDuration
      const finish = () => {
        pending -= 1
        if (pending <= 0) blocked.current = false
      }
      if (primary) {
        void animate(primary, { y: reverse ? "100%" : "-100%" }, { type: "spring", duration: 0.8, delay }).then(() => {
          animate(primary, { y: 0 }, { duration: 0 })
        })
      }
      if (secondary) {
        void animate(secondary, { top: "0%" }, { type: "spring", duration: 0.8, delay }).then(() => {
          animate(secondary, { top: hiddenTop }, { duration: 0 })
          finish()
        })
      } else {
        finish()
      }
    })
  }

  return (
    <motion.span
      ref={scope}
      className={cn("relative inline-flex items-center overflow-hidden", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="random-letter-swap"
      onClick={onClick}
      onHoverStart={() => {
        if (reduced) return
        runDebounced(bag.current, 100, play)
      }}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter, index) => (
        <span key={`${letter}-${index}`} aria-hidden className="relative inline-flex whitespace-pre">
          <motion.span className={`letter-${index} relative`} style={{ top: 0 }}>
            {letter}
          </motion.span>
          <motion.span className={`letter-secondary-${index} absolute`} style={{ top: hiddenTop }}>
            {letter}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
