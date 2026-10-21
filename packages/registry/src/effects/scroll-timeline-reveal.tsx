"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScrollTimelineRevealProps {
  mode?: "reveal" | "parallax"
  className?: string
  children?: React.ReactNode
  speed?: number
  intensity?: number
}

const VIEW_CSS = `@keyframes eu11-reveal { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: none; } }
          @keyframes eu11-parallax { from { transform: translateY(2.5rem); } to { transform: translateY(-2.5rem); } }
          .eu11-reveal { animation: eu11-reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }
          .eu11-parallax { animation: eu11-parallax linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }`

function supportsViewTimeline() {
  return CSS.supports("animation-timeline", "view()")
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function ScrollTimelineReveal({ mode = "reveal", className, children, speed, intensity }: ScrollTimelineRevealProps) {
  const reduced = usePrefersReducedMotion()
  const supported = React.useSyncExternalStore(
    () => () => {},
    supportsViewTimeline,
    () => false,
  )
  const css = supported && !reduced
  const rate = pace(speed)
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const duration = reduced ? 0 : rate === 1 ? 0.55 : 0.55 / rate
  const revealShift = `${2 * gain}rem`
  const parallaxShift = `${2.5 * gain}rem`
  const viewCss =
    gain === 1
      ? VIEW_CSS
      : `@keyframes eu11-reveal { from { opacity: 0; transform: translateY(${revealShift}); } to { opacity: 1; transform: none; } }
          @keyframes eu11-parallax { from { transform: translateY(${parallaxShift}); } to { transform: translateY(-${parallaxShift}); } }
          .eu11-reveal { animation: eu11-reveal linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }
          .eu11-parallax { animation: eu11-parallax linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }`
  const body = children ?? (
    <div className="rounded-2xl border bg-card p-6">
      <p className="font-display text-3xl">{mode === "parallax" ? "视差" : "显现"}</p>
      <p className="mt-2 text-sm text-muted-foreground">进入视口时沿 view() 时间线运动。</p>
    </div>
  )

  return (
    <div className={cn("py-8", className)}>
      <style>{viewCss}</style>
      {css ? (
        <div className={mode === "parallax" ? "eu11-parallax" : "eu11-reveal"}>{body}</div>
      ) : (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: gain === 1 ? 28 : 28 * gain }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: mode === "reveal", amount: 0.45 }}
          transition={{ duration }}
        >
          {body}
        </motion.div>
      )}
    </div>
  )
}

function ScrollTimelineShowcase({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-[28vh]", className)}>
      <ScrollTimelineReveal mode="reveal" />
      <ScrollTimelineReveal mode="parallax" />
    </div>
  )
}

export { ScrollTimelineReveal, ScrollTimelineShowcase }
