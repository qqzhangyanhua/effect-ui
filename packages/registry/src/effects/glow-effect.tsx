"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/glow-effect.tsx

import { useRef } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type GlowMode = "rotate" | "pulse" | "breathe" | "colorShift" | "flowHorizontal" | "static"

export interface GlowEffectProps {
  colors?: readonly string[]
  mode?: GlowMode
  duration?: number
  scale?: number
  blur?: number
  className?: string
}

function GlowEffect({
  colors = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  mode = "rotate",
  duration = 5,
  scale = 1,
  blur = 16,
  className,
}: GlowEffectProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(rootRef)
  const palette = colors.length > 0 ? colors : ["#FF5733", "#3357FF"]
  const joined = palette.join(", ")
  const resolved = reduced || !active ? "static" : mode
  const animate =
    resolved === "rotate"
      ? { background: [`conic-gradient(from 0deg, ${joined})`, `conic-gradient(from 360deg, ${joined})`] }
      : resolved === "pulse"
        ? {
            background: palette.map((color) => `radial-gradient(circle, ${color} 0%, transparent 70%)`),
            scale: [scale, scale * 1.08, scale],
            opacity: [0.55, 0.9, 0.55],
          }
        : resolved === "breathe"
          ? {
              background: palette.map((color) => `radial-gradient(circle, ${color} 0%, transparent 72%)`),
              scale: [scale, scale * 1.04, scale],
            }
          : resolved === "colorShift"
            ? {
                background: palette.map((color, index) => {
                  const next = palette[(index + 1) % palette.length]
                  return `conic-gradient(from 0deg, ${color}, ${next}, ${color})`
                }),
              }
            : resolved === "flowHorizontal"
              ? {
                  background: palette.map((color, index) => {
                    const next = palette[(index + 1) % palette.length]
                    return `linear-gradient(to right, ${color}, ${next})`
                  }),
                }
              : { background: `linear-gradient(to right, ${joined})`, scale }

  return (
    <motion.div
      ref={rootRef}
      data-slot="glow-effect"
      data-reduced={reduced ? "true" : "false"}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ filter: `blur(${blur}px)`, scale: resolved === "static" ? scale : undefined }}
      animate={animate}
      transition={resolved === "static" ? { duration: 0 } : { duration, repeat: Infinity, ease: "linear" }}
    />
  )
}

export { GlowEffect }
