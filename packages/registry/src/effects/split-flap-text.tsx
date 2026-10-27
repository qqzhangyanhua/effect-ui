"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { textStyle } from "@/lib/text-style"
import { cn } from "@/lib/cn"

export interface SplitFlapTextProps {
  target?: string
  className?: string
  /** 翻页速度倍率。不传则每格仍隔 80 毫秒。 */
  speed?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
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

function SplitFlapText({
  target = "GATE 12",
  className,
  speed,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: SplitFlapTextProps) {
  const goal = target.toUpperCase()
  return (
    <FlapRow
      key={goal}
      goal={goal}
      className={className}
      speed={speed}
      fontSize={fontSize}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      align={align}
    />
  )
}

function FlapRow({
  goal,
  className,
  speed,
  fontSize,
  fontWeight,
  letterSpacing,
  align,
}: {
  goal: string
  className?: string
  speed?: number
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
  align?: "left" | "center" | "right"
}) {
  const reduced = usePrefersReducedMotion()
  const [glyphs, setGlyphs] = React.useState(() => Array.from(goal, () => " "))

  React.useEffect(() => {
    if (reduced) return
    const tickMs = speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 80 : 80 / speed
    const timer = window.setInterval(() => {
      setGlyphs((current) => {
        const next = Array.from(goal, (char, index) => stepToward(current[index] ?? " ", char))
        const settled = next.every((char, index) => char === current[index])
        return settled ? current : next
      })
    }, tickMs)
    return () => window.clearInterval(timer)
  }, [goal, reduced, speed])

  const shown = reduced ? Array.from(goal) : glyphs

  return (
    <div
      data-slot="split-flap-text"
      role="img"
      aria-label={goal}
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      style={textStyle({ perspective: 600 }, undefined, undefined, undefined, align)}
    >
      {shown.map((glyph, index) => (
        <Flap
          key={`${goal}-${index}`}
          glyph={glyph}
          reduced={reduced}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
        />
      ))}
    </div>
  )
}

function Flap({
  glyph,
  reduced,
  fontSize,
  fontWeight,
  letterSpacing,
}: {
  glyph: string
  reduced: boolean
  fontSize?: number
  fontWeight?: number
  letterSpacing?: number
}) {
  const blank = glyph === " "
  const sized = fontSize !== undefined
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex overflow-hidden rounded-sm bg-zinc-900 font-mono text-amber-100 shadow-md",
        !sized && "h-16 text-2xl",
        !sized && (blank ? "w-4" : "w-11"),
      )}
      style={
        sized
          ? {
              ...textStyle(undefined, fontSize, fontWeight, letterSpacing, undefined),
              height: fontSize * 1.7,
              width: blank ? fontSize * 0.45 : fontSize * 1.15,
            }
          : textStyle(undefined, undefined, fontWeight, letterSpacing, undefined)
      }
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
