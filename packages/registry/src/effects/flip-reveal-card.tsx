"use client"

import { useState, type CSSProperties, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FlipRevealCardProps {
  front: ReactNode
  back: ReactNode
  duration?: number
  perspective?: number
  axis?: "x" | "y"
  className?: string
}

export function FlipRevealCard({
  front,
  back,
  duration = 560,
  perspective = 1100,
  axis = "y",
  className,
}: FlipRevealCardProps) {
  const [flipped, setFlipped] = useState(false)
  const reduced = usePrefersReducedMotion()
  const turn = axis === "x" ? "rotateX" : "rotateY"

  return (
    <div className={cn("w-full max-w-sm", className)} style={{ perspective: reduced ? undefined : `${perspective}px` }}>
      <button
        type="button"
        data-slot="flip-reveal-card"
        data-motion={reduced ? "off" : "on"}
        data-axis={axis}
        aria-pressed={flipped}
        onClick={() => setFlipped((value) => !value)}
        className="relative block min-h-48 w-full cursor-pointer rounded-2xl border border-border bg-card text-left text-card-foreground shadow-sm [transform-style:preserve-3d] motion-reduce:transform-none motion-reduce:transition-none"
        style={
          {
            transform: reduced ? "none" : `${turn}(${flipped ? 180 : 0}deg)`,
            transition: reduced ? "none" : `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          } as CSSProperties
        }
      >
        <span
          className="block p-5 [backface-visibility:hidden]"
          aria-hidden={flipped}
          style={{ display: reduced && flipped ? "none" : "block" }}
        >
          <span className="mb-3 inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">翻转</span>
          {front}
        </span>
        <span
          className="absolute inset-0 block p-5 [backface-visibility:hidden]"
          aria-hidden={!flipped}
          style={{
            display: reduced && !flipped ? "none" : "block",
            transform: reduced ? undefined : `${turn}(180deg)`,
          }}
        >
          {back}
        </span>
      </button>
    </div>
  )
}
