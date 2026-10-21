"use client"

// Ported from Magic UI (MIT) — https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/warp-background.tsx

import * as React from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WarpBackgroundProps {
  children?: React.ReactNode
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDuration?: number
  className?: string
}

const SIDES = [
  { id: "top", origin: "50% 0%", transform: "rotateX(-90deg)", style: { top: 0, left: 0, width: "100%", height: "100%" } },
  { id: "bottom", origin: "50% 0%", transform: "rotateX(-90deg)", style: { top: "100%", left: 0, width: "100%", height: "100%" } },
  { id: "left", origin: "0% 0%", transform: "rotate(90deg) rotateX(-90deg)", style: { top: 0, left: 0, width: "100%", height: "100%" } },
  { id: "right", origin: "100% 0%", transform: "rotate(-90deg) rotateX(-90deg)", style: { top: 0, right: 0, width: "100%", height: "100%" } },
] as const

function WarpBackground({
  children,
  perspective = 120,
  beamsPerSide = 3,
  beamSize = 8,
  beamDuration = 2.8,
  className,
}: WarpBackgroundProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(ref)
  const grid = `linear-gradient(var(--border) 0 1px, transparent 1px), linear-gradient(90deg, var(--border) 0 1px, transparent 1px)`

  return (
    <div
      ref={ref}
      data-slot="warp-background"
      className={cn("relative isolate min-h-72 overflow-hidden rounded-xl border bg-background p-10", className)}
      style={{ perspective }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ perspective }}>
        {SIDES.map((side) => (
          <div
            key={side.id}
            className="absolute"
            style={{
              ...side.style,
              transform: side.transform,
              transformOrigin: side.origin,
              backgroundImage: grid,
              backgroundSize: `${beamSize}% ${beamSize}%`,
            }}
          >
            {!reduced && active
              ? Array.from({ length: beamsPerSide }, (_, index) => (
                  <motion.div
                    key={index}
                    className="absolute top-0"
                    style={{
                      left: `${index * (100 / beamsPerSide)}%`,
                      width: `${beamSize}%`,
                      height: "46%",
                      x: "-50%",
                      background: `linear-gradient(hsl(${(index * 70 + side.id.length * 20) % 360} 80% 62%), transparent)`,
                    }}
                    initial={{ y: "130%" }}
                    animate={{ y: "-140%" }}
                    transition={{ duration: beamDuration, delay: index * 0.45, repeat: Infinity, ease: "linear" }}
                  />
                ))
              : null}
          </div>
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { WarpBackground }
