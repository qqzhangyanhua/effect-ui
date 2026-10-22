"use client"

// Ported from Sera UI (MIT, (c) 2025 Sera UI) — https://github.com/seraui/seraui/blob/main/src/app/docs/glowline/glowline.tsx

import { useId, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GlowDividerProps {
  color?: string
  duration?: number
  intensity?: number
  size?: number
  orientation?: "horizontal" | "vertical"
  className?: string
}

function cssName(id: string) {
  return `glow-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

export function GlowDivider({
  color = "var(--primary)",
  duration = 2400,
  intensity = 1,
  size = 2,
  orientation = "horizontal",
  className,
}: GlowDividerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const animation = cssName(useId())
  const vertical = orientation === "vertical"
  const moving = live && !reduced
  const blur = 8 * intensity

  return (
    <div
      ref={rootRef}
      role="separator"
      aria-orientation={orientation}
      className={cn("relative", vertical ? "h-36 w-8" : "h-8 w-full", className)}
    >
      <style>{`@keyframes ${animation} { from { opacity: 0.45; } to { opacity: 1; } }`}</style>
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none"
        style={{
          width: vertical ? `${size}px` : "100%",
          height: vertical ? "100%" : `${size}px`,
          background: `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, ${color}, transparent)`,
          boxShadow: `0 0 ${blur}px ${color}`,
          opacity: moving ? undefined : 0.9,
          animationName: moving ? animation : "none",
          animationDuration: `${Math.max(400, duration)}ms`,
          animationIterationCount: "infinite",
          animationDirection: "alternate",
          animationTimingFunction: "ease-in-out",
          animationPlayState: moving ? "running" : "paused",
        }}
      />
    </div>
  )
}
