"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/border-trail.tsx

import { useRef, type ReactNode } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BorderTrailProps {
  children?: ReactNode
  size?: number
  duration?: number
  radius?: number
  className?: string
}

function BorderTrail({ children, size = 14, duration = 4, radius = 16, className }: BorderTrailProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const active = useAnimationActive(rootRef)
  const moving = !reduced && active

  return (
    <div ref={rootRef} data-slot="border-trail" data-reduced={reduced ? "true" : "false"} className={cn("relative w-full", className)}>
      {children}
      {moving ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent"
          style={{
            borderWidth: Math.max(2, Math.round(size / 2)),
            maskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
            WebkitMaskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
            maskClip: "padding-box, border-box",
            WebkitMaskClip: "padding-box, border-box",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        >
          <motion.div
            className="absolute aspect-square rounded-full bg-primary"
            style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${radius}px)` }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ) : (
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-primary/70" />
      )}
    </div>
  )
}

export { BorderTrail }
