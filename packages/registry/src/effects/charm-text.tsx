"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/charm-text.tsx

import { useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type CharmGlyph = "spark" | "drop" | "bird" | "leaf" | "heart" | "bolt" | "star" | "moon"
export type CharmWord = { text: string; glyph: CharmGlyph; hint?: string }
export type CharmSegment = string | CharmWord

export interface CharmTextProps {
  segments?: CharmSegment[]
  variant?: "ink" | "chip"
  color?: string
  duration?: number
  intensity?: number
  fontSize?: number
  className?: string
}

const PATHS: Record<CharmGlyph, string> = {
  spark: "M12 2 L14 9 L21 11 L14 13 L12 21 L10 13 L3 11 L10 9Z",
  drop: "M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2Z",
  bird: "M3 14 C6 13 8 10 10 6 C12 9 14 11 16 11 L21 9 L17 14 C16 18 12 21 7 20 C9 19 10 17 10 16 C7 16 4 15 3 14Z",
  leaf: "M5 19 C5 9 11 4 20 4 C20 13 15 19 6 19 L3 22 L5 19Z",
  heart: "M12 21 C4 14 3 10 3 8 A5 5 0 0 1 12 6 A5 5 0 0 1 21 8 C21 10 20 14 12 21Z",
  bolt: "M13 2 L4 14 H11 L10 22 L20 9 H13Z",
  star: "M12 2 L15 9 L22 9.5 L16.5 14 L18.5 21 L12 17 L5.5 21 L7.5 14 L2 9.5 L9 9Z",
  moon: "M20 14 A8 8 0 1 1 10 4 A6.5 6.5 0 0 0 20 14Z",
}

const DEFAULT_SEGMENTS: CharmSegment[] = [
  "Interfaces that ",
  { text: "glow", glyph: "spark", hint: "micro-interactions" },
  " when you touch them, quiet like ",
  { text: "water", glyph: "drop", hint: "calm motion" },
  ", and grown with ",
  { text: "care", glyph: "heart", hint: "accessibility first" },
  ".",
]

function Glyph({ glyph, className }: { glyph: CharmGlyph; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d={PATHS[glyph]} />
    </svg>
  )
}

function Charm({
  word,
  variant,
  moving,
  color,
  duration,
  intensity,
}: {
  word: CharmWord
  variant: "ink" | "chip"
  moving: boolean
  color: string
  duration: number
  intensity: number
}) {
  const [hover, setHover] = useState(false)
  const [stuck, setStuck] = useState(false)
  const lit = hover || stuck
  const label = word.hint ? `${word.text}: ${word.hint}` : word.text
  const pin = () => setStuck((value) => !value)
  const keys = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      pin()
    }
  }

  if (variant === "chip") {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={stuck}
        onClick={pin}
        className="mx-0.5 inline-flex min-h-11 items-center gap-[0.35em] rounded-full border border-border bg-muted px-[0.55em] align-middle text-[0.62em] leading-none text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <motion.span animate={stuck && moving ? { rotate: 360, scale: [1, 1 + 0.4 * intensity, 1] } : { rotate: 0 }} transition={{ duration: duration / 1000 }} className="grid">
          <Glyph glyph={word.glyph} className="size-[1.1em] fill-primary" />
        </motion.span>
        {word.text}
      </button>
    )
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={stuck}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onPointerDown={() => setHover(true)}
      onKeyDown={keys}
      onClick={pin}
      className={cn("relative inline cursor-pointer rounded-md align-baseline outline-none focus-visible:ring-2 focus-visible:ring-ring", lit && "text-[var(--charm)]")}
      style={{ ["--charm" as string]: color }}
    >
      <span className="relative">
        {word.text}
        <motion.span aria-hidden className="absolute inset-x-0 -bottom-0.5 h-[0.07em] origin-left rounded-full bg-current motion-reduce:transition-none" initial={false} animate={{ scaleX: lit ? 1 : 0 }} transition={{ duration: moving ? duration / 1000 : 0 }} />
      </span>
      <AnimatePresence>
        {lit ? (
          <motion.span aria-hidden className="pointer-events-none absolute -top-[0.55em] -right-[0.3em] grid" initial={moving ? { opacity: 0, scale: 0, y: 8 } : { opacity: 0 }} animate={{ opacity: 1, scale: intensity, y: 0 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 16 }}>
            <Glyph glyph={word.glyph} className="size-[0.6em] fill-[var(--charm)]" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  )
}

export function CharmText({
  segments = DEFAULT_SEGMENTS,
  variant = "ink",
  color = "var(--primary)",
  duration = 350,
  intensity = 1,
  fontSize = 32,
  className,
}: CharmTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  return (
    <div ref={rootRef} data-motion={moving ? "on" : "off"} className={cn("max-w-2xl leading-[1.25] tracking-tight text-foreground motion-reduce:animate-none", className)} style={{ fontSize }}>
      {segments.map((segment, index) =>
        typeof segment === "string" ? (
          <span key={index}>{segment}</span>
        ) : (
          <Charm key={index} word={segment} variant={variant} moving={moving} color={color} duration={duration} intensity={intensity} />
        ),
      )}
    </div>
  )
}
