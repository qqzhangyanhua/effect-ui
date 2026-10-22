"use client"

// Ported from beUI (MIT, (c) 2026 Saurabh Chauhan) — https://github.com/starc007/ui-components/blob/main/components/motion/chromatic-text-reveal.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { motion, type MotionStyle } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

const TRAIL = 14

const DEFAULT_COLORS = ["var(--primary)", "var(--ring)", "var(--accent)"]

export interface ChromaticTextRevealProps {
  prefix?: string
  words?: string[]
  colors?: string[]
  /** Settled text color. Defaults to the foreground token. */
  color?: string
  /** Sweep length, in milliseconds. */
  duration?: number
  /** Wait before the first sweep, in milliseconds. */
  delay?: number
  /** Rest between words, in milliseconds. */
  interval?: number
  loop?: boolean
  /** Type size, in pixels. */
  fontSize?: number
  startOnView?: boolean
  once?: boolean
  className?: string
}

function gradient(colors: string[], foreground: string) {
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS
  const stops = palette.map((stop, index) => {
    const offset = palette.length === 1 ? 0 : -TRAIL + (index / (palette.length - 1)) * TRAIL * 2
    const operator = offset < 0 ? "-" : "+"
    const distance = Number(Math.abs(offset).toFixed(2))
    return `${stop} calc(var(--chromatic-sweep) ${operator} ${distance}%)`
  })
  return `linear-gradient(90deg, ${foreground} 0%, ${foreground} calc(var(--chromatic-sweep) - ${TRAIL}%), ${stops.join(", ")}, transparent calc(var(--chromatic-sweep) + ${TRAIL}%), transparent 100%)`
}

export function ChromaticTextReveal({
  prefix = "Motion that feels",
  words = ["natural.", "intentional.", "alive."],
  colors = DEFAULT_COLORS,
  color = "var(--foreground)",
  duration = 1200,
  delay = 0,
  interval = 800,
  loop = true,
  fontSize = 48,
  startOnView = true,
  once = true,
  className,
}: ChromaticTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [wordIndex, setWordIndex] = useState(0)
  const [seen, setSeen] = useState(false)
  const still = prefersReduced || !live
  const hasWords = words.length > 0
  const activeIndex = hasWords ? wordIndex % words.length : 0
  const activeWord = words[activeIndex] ?? ""
  const sizingWords = Array.from(new Set(words))
  const shouldReveal = !startOnView || seen || prefersReduced

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1]
        if (!entry?.isIntersecting) {
          if (!once) setSeen(false)
          return
        }
        setSeen(true)
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  const clearPending = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    clearPending()
    if (still || !shouldReveal || words.length < 2) return
    const isLast = activeIndex === words.length - 1
    if (isLast && !loop) return
    timerRef.current = window.setTimeout(() => {
      setWordIndex((index) => (index + 1) % words.length)
    }, interval)
    return clearPending
  }, [activeIndex, clearPending, interval, live, loop, shouldReveal, still, words.length])

  const start = `-${TRAIL}%`
  const finish = `${100 + TRAIL}%`

  return (
    <span
      ref={ref}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      style={{ fontSize, color }}
      className={cn("inline-flex items-baseline motion-reduce:transition-none", className)}
    >
      <span className="whitespace-nowrap">
        {prefix}
        {hasWords ? "\u00A0" : null}
      </span>
      {hasWords ? (
        <span className="relative inline-grid">
          {sizingWords.map((word) => (
            <span key={word} aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
              {word}
            </span>
          ))}
          <motion.span
            key={`${activeWord}-${activeIndex}`}
            aria-hidden
            initial={still ? false : { opacity: 0.56, filter: "blur(6px)", transform: "translateY(5px)" }}
            animate={{
              "--chromatic-sweep": shouldReveal ? finish : start,
              opacity: 1,
              filter: "blur(0px)",
              transform: "translateY(0px)",
            }}
            transition={{
              "--chromatic-sweep": still ? { duration: 0 } : { duration: duration / 1000, delay: delay / 1000, ease: [0.77, 0, 0.175, 1] },
              opacity: still ? { duration: 0 } : { duration: 0.28 },
              filter: still ? { duration: 0 } : { duration: 0.36 },
              transform: still ? { duration: 0 } : { duration: 0.36 },
            }}
            className="absolute start-0 top-0 whitespace-nowrap bg-clip-text text-transparent [background-image:var(--chromatic-gradient)] [contain:paint]"
            style={
              {
                "--chromatic-sweep": still || prefersReduced ? finish : start,
                "--chromatic-gradient": gradient(colors, color),
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
              } as MotionStyle
            }
          >
            {activeWord}
          </motion.span>
          <span className="sr-only">{activeWord}</span>
        </span>
      ) : null}
    </span>
  )
}
