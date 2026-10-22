"use client"

// Ported from MosaicUI (MIT, (c) 2026 Darshan Sunil Rajadhyaksha) — https://github.com/darshan-rajadhyaksha/mosaicui/blob/2baca92/src/registry/text-effects/rolling-letters-animation/rolling-letters-animation.tsx

import { useId, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface RollingLettersAnimationProps {
  text?: string
  color?: string
  duration?: number
  size?: number
  gap?: number
  count?: number
  speed?: number
  className?: string
}

function hash(n: number) {
  const value = Math.sin(n * 127.1) * 43758.5453123
  return value - Math.floor(value)
}

function fillers(letter: string, total: number, seed: number) {
  const upper = letter === letter.toUpperCase()
  const alphabet = upper ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "abcdefghijklmnopqrstuvwxyz"
  const needed = Math.max(0, total - 1)
  const out: string[] = []
  let step = 0
  while (out.length < needed && step < 80) {
    const index = Math.floor(hash(seed * 13 + step + 3) * 26) % 26
    const next = alphabet[index]
    step += 1
    if (!next || next === letter || out.includes(next)) continue
    out.push(next)
  }
  return out
}

export function RollingLettersAnimation({
  text = "Hello",
  color = "var(--foreground)",
  duration = 1600,
  size = 32,
  gap = 2,
  count = 8,
  speed = 1,
  className,
}: RollingLettersAnimationProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const reelName = `roll-${useId().replace(/:/g, "")}`
  const length = Math.max(2, Math.min(12, Math.round(count)))
  const seconds = Math.max(0.1, duration / 1000 / Math.max(0.1, speed))
  const playing = live && !reduced

  return (
    <span
      ref={rootRef}
      data-slot="rolling-letters-animation"
      data-motion={playing ? "on" : "off"}
      className={cn("relative inline-flex items-end motion-reduce:transform-none", className)}
      style={{ gap, color }}
    >
      <style>{`@keyframes ${reelName}{from{transform:translateY(0)}to{transform:translateY(var(--roll-end))}}`}</style>
      {[...text].map((letter, index) => {
        const isLetter = letter.toLowerCase() !== letter.toUpperCase()
        const even = index % 2 === 0
        const series = isLetter ? (even ? [letter, ...fillers(letter, length, index + 1)] : [...fillers(letter, length, index + 1), letter]) : [letter]
        const steps = series.length - 1
        const end = steps * size * (even ? 1 : -1)
        return (
          <span
            key={`${letter}-${index}`}
            aria-hidden="true"
            className="inline-block overflow-hidden leading-none"
            style={{ height: size }}
          >
            <span
              className="inline-block motion-reduce:animate-none"
              style={{
                marginTop: even ? -steps * size : 0,
                ["--roll-end" as string]: `${end}px`,
                animationName: reduced || !isLetter ? "none" : reelName,
                animationDuration: `${seconds}s`,
                animationTimingFunction: "ease-in-out",
                animationFillMode: "forwards",
                animationPlayState: playing ? "running" : "paused",
                transform: reduced ? `translateY(${end}px)` : undefined,
              }}
            >
              {series.map((glyph, glyphIndex) => (
                <span key={`${glyph}-${glyphIndex}`} className="flex items-end justify-center" style={{ height: size }}>
                  {glyph === " " ? "\u00a0" : glyph}
                </span>
              ))}
            </span>
          </span>
        )
      })}
      <span className="sr-only">{text}</span>
    </span>
  )
}
