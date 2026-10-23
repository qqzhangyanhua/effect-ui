"use client"

// Ported from interior (MIT, (c) 2026 ozzy) — https://github.com/ddoemonn/interior/blob/main/components/interior/value-flash.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"

const GLYPH = {
  up: <path d="M128 68 L210 180 H46 Z" />,
  down: <path d="M128 188 L46 76 H210 Z" />,
} as const

export interface ValueFlashProps {
  value: number
  format?: (value: number) => string
  label?: string
  /** How long the tint stays, in milliseconds. */
  duration?: number
  /** Rising change color. Defaults to the primary token. */
  color?: string
  /** Falling change color. Defaults to the destructive token. */
  downColor?: string
  /** Readout size, in pixels. */
  fontSize?: number
  /** Extra scale while the value is flashing. 1 is a 5% pop. */
  intensity?: number
  hold?: number
  announceAfter?: number
  className?: string
}

export function ValueFlash({
  value,
  format,
  label,
  duration = 900,
  color = "var(--primary)",
  downColor = "var(--destructive)",
  fontSize = 13,
  intensity = 1,
  hold,
  announceAfter = 700,
  className = "",
}: ValueFlashProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const still = prefersReduced || !live
  const flashMs = hold ?? duration
  const text = format ? format(value) : String(value)
  const [settled, setSettled] = useState(text)
  const [previous, setPrevious] = useState(value)
  const [flash, setFlash] = useState<{ direction: "up" | "down"; changeId: number } | null>(null)

  if (!Object.is(previous, value)) {
    const prior = previous
    setPrevious(value)
    const delta = value - prior
    if (delta !== 0) {
      setFlash((prev) => ({
        direction: delta > 0 ? "up" : "down",
        changeId: (prev?.changeId ?? 0) + 1,
      }))
    }
  }

  const changeId = flash?.changeId ?? 0
  const direction = flash?.direction ?? null

  useEffect(() => {
    if (!flash) return
    const timer = setTimeout(() => setFlash(null), flashMs)
    return () => clearTimeout(timer)
  }, [flash, flashMs])

  useEffect(() => {
    const timer = setTimeout(() => setSettled(text), announceAfter)
    return () => clearTimeout(timer)
  }, [text, announceAfter])

  const flashing = flash != null
  const ink = flashing ? (direction === "up" ? color : downColor) : "var(--foreground)"
  const travel = still ? { duration: 0 } : { type: "spring" as const, stiffness: 460, damping: 32, mass: 0.55 }
  const glyph: ReactNode = direction ? GLYPH[direction] : null

  return (
    <motion.span
      ref={rootRef}
      initial={false}
      animate={{ scale: still ? 1 : flashing ? 1 + 0.05 * intensity : 1 }}
      transition={still ? { duration: 0 } : flashing ? { type: "spring", stiffness: 380, damping: 26 } : { type: "spring", stiffness: 260, damping: 34 }}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      style={{ color: ink, fontSize }}
      className={`relative inline-grid grid-flow-col items-center gap-1.5 rounded-[6px] px-1.5 py-[3px] font-medium tabular-nums motion-reduce:transform-none ${className}`}
    >
      {direction ? (
        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: flashing ? 0.18 : 0 }}
          transition={still ? { duration: 0 } : { duration: 0.16 }}
          className="pointer-events-none absolute inset-0 rounded-[6px] bg-current"
        />
      ) : null}
      <span aria-hidden className="relative inline-grid overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={changeId}
            initial={still ? { opacity: 0 } : { opacity: 0, y: direction === "down" ? "-0.85em" : "0.85em", filter: "blur(5px)" }}
            animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
            exit={still ? { opacity: 0 } : { opacity: 0, y: direction === "down" ? "0.7em" : "-0.7em", filter: "blur(4px)" }}
            transition={travel}
            className="col-start-1 row-start-1"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-hidden className="relative grid size-[1em] place-items-center">
        <AnimatePresence initial={false}>
          {flashing && direction && glyph ? (
            <motion.svg
              key={`${changeId}-${direction}`}
              viewBox="0 0 256 256"
              fill="currentColor"
              initial={still ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 640, damping: 22 }}
              className="col-start-1 row-start-1 block h-[0.68em] w-[0.68em]"
            >
              {glyph}
            </motion.svg>
          ) : null}
        </AnimatePresence>
      </span>
      <span className="sr-only" aria-live="polite">
        {label ? `${label}: ${settled}` : settled}
      </span>
    </motion.span>
  )
}
