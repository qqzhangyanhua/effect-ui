"use client"

// Ported from Sera UI (MIT, (c) 2025 Sera UI) — https://github.com/seraui/seraui/blob/main/src/app/docs/noisetext/noisetext.tsx

import { useId, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface NoiseTextProps {
  children?: ReactNode
  color?: string
  intensity?: number
  fontSize?: number
  duration?: number
  className?: string
}

function cssName(id: string) {
  return `noise-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

export function NoiseText({
  children = "Noise",
  color = "var(--foreground)",
  intensity = 0.35,
  fontSize = 16,
  duration = 1400,
  className,
}: NoiseTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const filterId = cssName(useId())
  const animation = `${filterId}-flicker`
  const moving = live && !reduced
  const grain = Math.max(0, Math.min(1, intensity))

  return (
    <span
      ref={rootRef}
      className={cn(
        "relative inline-flex overflow-hidden rounded-lg border border-border bg-card/80 px-4 py-2 shadow-sm",
        className,
      )}
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        </filter>
      </svg>
      <style>{`@keyframes ${animation} { from { opacity: ${grain * 0.45}; } to { opacity: ${grain}; } }`}</style>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 motion-reduce:animate-none"
        style={{
          filter: `url(#${filterId})`,
          opacity: moving ? undefined : grain,
          mixBlendMode: "multiply",
          animationName: moving ? animation : "none",
          animationDuration: `${Math.max(400, duration)}ms`,
          animationIterationCount: "infinite",
          animationDirection: "alternate",
          animationPlayState: moving ? "running" : "paused",
        }}
      />
      <span className="relative font-medium" style={{ color, fontSize: `${fontSize}px` }}>
        {children}
      </span>
    </span>
  )
}
