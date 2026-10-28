"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GlyphBlockSwapProps {
  pace?: number
  intensity?: number
  eyes?: boolean
  cycle?: boolean
  className?: string
  onValueChange?: (state: { mode: GlyphMode; focus: number }) => void
}

export type GlyphMode = "letters" | "mixed" | "blocks"

export const GLYPH_TITLE = "Build calm tools"
export const GLYPH_SWAP = [0, 2, 7, 12, 14] as const

const BLOCK_TONES = ["bg-primary", "bg-chart-2", "bg-chart-4", "bg-accent", "bg-chart-3"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function glyphMode(count: number, total = GLYPH_SWAP.length): GlyphMode {
  if (count <= 0) return "letters"
  if (count >= total) return "blocks"
  return "mixed"
}

export function glyphActiveAt(cursor: number, swap: readonly number[] = GLYPH_SWAP) {
  const span = swap.length * 2
  const place = ((cursor % span) + span) % span
  if (place <= swap.length) return swap.slice(0, place)
  return swap.slice(place - swap.length)
}

export function glyphStatic(swap: readonly number[] = GLYPH_SWAP) {
  return swap.filter((_, index) => index % 2 === 0)
}

export function glyphFocusStep(title: string, focus: number, direction: 1 | -1) {
  const chars = Array.from(title)
  let next = focus
  for (let guard = 0; guard < chars.length; guard += 1) {
    next = (next + direction + chars.length) % chars.length
    if (chars[next] !== " ") return next
  }
  return focus
}

export function GlyphBlockSwap({
  pace = 1,
  intensity = 0.7,
  eyes = true,
  cycle = true,
  className,
  onValueChange,
}: GlyphBlockSwapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const [cursor, setCursor] = useState(0)
  const [focus, setFocus] = useState(0)
  const [manual, setManual] = useState<number[]>([])
  const [hover, setHover] = useState<number | null>(null)
  const playing = cycle && live && !reduced
  const chars = Array.from(GLYPH_TITLE)
  const cycled = reduced ? glyphStatic() : cycle ? glyphActiveAt(cursor) : []
  const manualSet = new Set(manual)
  const blocks = chars.map((_, index) => {
    if (reduced) return cycled.includes(index)
    if (hover === index) return true
    return cycled.includes(index) !== manualSet.has(index)
  })
  const glyphs = blocks.filter(Boolean).length
  const mode = glyphMode(glyphs)
  const blockSize = 1.05 + gain * 0.7
  const words: { word: string; start: number }[] = []
  {
    let start = 0
    for (const word of GLYPH_TITLE.split(" ")) {
      words.push({ word, start })
      start += word.length + 1
    }
  }

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    onValueRef.current?.({ mode, focus })
  }, [mode, focus])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    let acc = 0
    const stepMs = 640 / paceRate
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      acc += dt * 1000
      if (acc >= stepMs) {
        acc -= stepMs
        setCursor((value) => value + 1)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function toggle(index: number) {
    if (reduced || chars[index] === " ") return
    setManual((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") setFocus((value) => glyphFocusStep(GLYPH_TITLE, value, 1))
    else if (event.key === "ArrowLeft") setFocus((value) => glyphFocusStep(GLYPH_TITLE, value, -1))
    else if (event.key === "Enter" && event.target === event.currentTarget) toggle(focus)
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="glyph-block-swap"
      data-ritual="glyph-swap"
      data-title={GLYPH_TITLE}
      data-pace={paceRate}
      data-intensity={gain}
      data-mode={mode}
      data-focus={focus}
      data-glyphs={glyphs}
      data-cursor={cursor}
      data-cycle={cycle ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      data-eyes={eyes ? "on" : "off"}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card px-4 py-8 text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <p data-part="line" className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2 text-4xl font-semibold tracking-tight text-foreground">
        {words.map(({ word, start }) => (
          <span key={start} className="inline-flex">
            {Array.from(word).map((char, offset) => {
              const index = start + offset
              const block = blocks[index] === true
              const arch = index % 2 === 1
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={char}
                  data-glyph={index}
                  data-form={block ? "block" : "letter"}
                  tabIndex={index === focus ? 0 : -1}
                  onFocus={() => setHover(index)}
                  onBlur={() => setHover((value) => (value === index ? null : value))}
                  onPointerEnter={() => setHover(index)}
                  onPointerLeave={() => setHover((value) => (value === index ? null : value))}
                  onClick={() => {
                    setFocus(index)
                    toggle(index)
                  }}
                  className={cn(
                    "relative inline-grid h-12 w-8 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === focus && "ring-2 ring-ring",
                  )}
                >
                  <span className={cn("motion-reduce:transition-none", block ? "scale-75 opacity-0" : "opacity-100")}>{char}</span>
                  {block ? (
                    <motion.span
                      data-part="block"
                      aria-hidden="true"
                      className={cn(
                        "absolute grid place-items-center motion-reduce:transition-none",
                        arch ? "rounded-t-full" : "rounded-md",
                        BLOCK_TONES[index % BLOCK_TONES.length],
                      )}
                      style={{ width: `${blockSize}rem`, height: `${arch ? blockSize * 0.86 : blockSize}rem`, opacity: 0.72 + gain * 0.28 }}
                    >
                      {eyes ? (
                        <span className="flex gap-1">
                          <span data-part="eye" className="size-1 rounded-full bg-primary-foreground" />
                          <span data-part="eye" className="size-1 rounded-full bg-primary-foreground" />
                        </span>
                      ) : null}
                    </motion.span>
                  ) : null}
                </button>
              )
            })}
          </span>
        ))}
      </p>
    </div>
  )
}
