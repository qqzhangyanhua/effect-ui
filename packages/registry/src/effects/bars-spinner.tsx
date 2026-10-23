"use client"

// Ported from Spell UI (MIT, (c) 2025 Spell UI) — https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/bars-spinner.tsx

import { useId, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BarsSpinnerProps {
  color?: string
  size?: number
  duration?: number
  count?: number
  label?: string
  className?: string
}

function cssName(id: string) {
  return `bars-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

export function BarsSpinner({
  color = "var(--foreground)",
  size = 28,
  duration = 1200,
  count = 12,
  label = "Loading",
  className,
}: BarsSpinnerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const animation = cssName(useId())
  const bars = Math.max(6, Math.min(16, Math.round(count)))
  const moving = live && !reduced
  const life = Math.max(300, duration)

  return (
    <div ref={rootRef} className={cn("inline-flex flex-col items-center gap-2", className)}>
      <style>{`@keyframes ${animation} { 0% { opacity: 1; } 100% { opacity: 0.15; } }`}</style>
      <div role="status" aria-label={label} className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
        {Array.from({ length: bars }, (_, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 block rounded-full motion-reduce:animate-none"
            style={{
              width: `${Math.max(2, size * 0.08)}px`,
              height: `${size * 0.28}px`,
              background: color,
              opacity: moving ? undefined : index % 3 === 0 ? 1 : 0.28,
              transform: `translate(-50%, -50%) rotate(${index * (360 / bars)}deg) translateY(${-size * 0.32}px)`,
              animationName: moving ? animation : "none",
              animationDuration: `${life}ms`,
              animationDelay: `${-index * (life / bars)}ms`,
              animationIterationCount: "infinite",
              animationTimingFunction: "linear",
              animationPlayState: moving ? "running" : "paused",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
