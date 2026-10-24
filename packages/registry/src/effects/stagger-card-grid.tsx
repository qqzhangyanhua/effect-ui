"use client"

import { Children, useRef, type CSSProperties, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StaggerCardGridProps {
  pace?: number
  stagger?: number
  intensity?: number
  columns?: number
  className?: string
  children?: ReactNode
}

const KEYFRAMES = `
@keyframes stagger-card-grid-in {
  from {
    opacity: 0;
    transform: translateY(var(--stagger-y));
  }
  to {
    opacity: 1;
    transform: none;
  }
}
`

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function columnCount(columns: number) {
  if (!Number.isFinite(columns)) return 3
  return Math.min(6, Math.max(1, Math.round(columns)))
}

export function StaggerCardGrid({
  pace = 1,
  stagger = 0.08,
  intensity = 1,
  columns = 3,
  className,
  children,
}: StaggerCardGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const rate = rateOf(pace)
  const cols = columnCount(columns)
  const play = live && !reduced
  const items = Children.toArray(children)

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        ref={ref}
        data-slot="stagger-card-grid"
        data-motion={play ? "on" : "off"}
        data-columns={cols}
        className={cn("grid gap-3 motion-reduce:animate-none", className)}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
      {items.map((child, index) => {
        const col = index % cols
        const row = Math.floor(index / cols)
        const wait = Math.round(((row * stagger + col * stagger * 0.65) / rate) * 1000)
        return (
          <div
            key={index}
            data-slot="stagger-card-grid-item"
            data-delay={wait}
            className="rounded-xl border border-border bg-card text-card-foreground shadow-sm motion-reduce:animate-none motion-reduce:transform-none motion-reduce:opacity-100"
            style={
              {
                "--stagger-y": `${18 * intensity}px`,
                animationName: reduced ? "none" : "stagger-card-grid-in",
                animationDuration: `${Math.round(460 / rate)}ms`,
                animationDelay: `${reduced ? 0 : wait}ms`,
                animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                animationFillMode: "both",
                animationPlayState: play ? "running" : "paused",
              } as CSSProperties
            }
          >
            {child}
          </div>
        )
      })}
      </div>
    </>
  )
}
