"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SplitFlapTextProps {
  target?: string
  className?: string
}

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·"

function stepToward(current: string, goalChar: string) {
  const goalIndex = CHARSET.indexOf(goalChar)
  if (goalIndex < 0) return goalChar
  const currentIndex = CHARSET.indexOf(current)
  const from = currentIndex < 0 ? 0 : currentIndex
  if (from === goalIndex) return goalChar
  return CHARSET[(from + 1) % CHARSET.length] ?? goalChar
}

function SplitFlapText({ target = "GATE 12", className }: SplitFlapTextProps) {
  const goal = target.toUpperCase()
  return <FlapRow key={goal} goal={goal} className={className} />
}

function FlapRow({ goal, className }: { goal: string; className?: string }) {
  const reduced = usePrefersReducedMotion()
  const [glyphs, setGlyphs] = React.useState(() => Array.from(goal, () => " "))

  React.useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(() => {
      setGlyphs((current) => {
        const next = Array.from(goal, (char, index) => stepToward(current[index] ?? " ", char))
        const settled = next.every((char, index) => char === current[index])
        return settled ? current : next
      })
    }, 80)
    return () => window.clearInterval(timer)
  }, [goal, reduced])

  const shown = reduced ? Array.from(goal) : glyphs

  return (
    <div
      data-slot="split-flap-text"
      role="img"
      aria-label={goal}
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      style={{ perspective: 600 }}
    >
      {shown.map((glyph, index) => (
        <Flap key={`${goal}-${index}`} glyph={glyph} reduced={reduced} />
      ))}
    </div>
  )
}

function Flap({ glyph, reduced }: { glyph: string; reduced: boolean }) {
  const blank = glyph === " "
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-16 overflow-hidden rounded-sm bg-zinc-900 font-mono text-2xl text-amber-100 shadow-md",
        blank ? "w-4" : "w-11",
      )}
    >
      <span className="absolute inset-x-0 top-0 flex h-1/2 items-end justify-center overflow-hidden border-b border-black/70 bg-zinc-800">
        <span className="translate-y-1/2">{blank ? "" : glyph}</span>
      </span>
      <span className="absolute inset-x-0 bottom-0 flex h-1/2 items-start justify-center overflow-hidden bg-zinc-950">
        <span className="-translate-y-1/2">{blank ? "" : glyph}</span>
      </span>
      {reduced || blank ? null : (
        <motion.span
          key={glyph}
          initial={{ rotateX: -88 }}
          animate={{ rotateX: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="absolute inset-x-0 top-0 flex h-1/2 origin-bottom items-end justify-center overflow-hidden bg-zinc-700"
        >
          <span className="translate-y-1/2">{glyph}</span>
        </motion.span>
      )}
    </span>
  )
}

export { SplitFlapText }
