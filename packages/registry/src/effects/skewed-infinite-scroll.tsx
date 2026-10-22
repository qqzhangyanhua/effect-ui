"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/animations/SkewedInfiniteScroll.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef } from "react"

export interface SkewScrollItem {
  id: string
  text: string
}

export interface SkewedInfiniteScrollProps {
  items: SkewScrollItem[]
  speed?: number
  columns?: number
  className?: string
}

const KEYFRAMES = `
@keyframes effect-ui-skew-scroll {
  from { transform: rotateX(20deg) rotateZ(-20deg) skewX(20deg) translateY(0); }
  to { transform: rotateX(20deg) rotateZ(-20deg) skewX(20deg) translateY(-50%); }
}
`

export function SkewedInfiniteScroll({
  items,
  speed = 20,
  columns = 2,
  className,
}: SkewedInfiniteScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const loop = [...items, ...items]

  return (
    <div
      className={cn("relative h-64 w-full overflow-hidden", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="skewed-infinite-scroll"
      ref={ref}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 2rem), linear-gradient(to left, transparent, black 2rem), linear-gradient(to bottom, transparent, black 2rem), linear-gradient(to top, transparent, black 2rem)",
        maskComposite: "intersect",
      }}
    >
      <style>{KEYFRAMES}</style>
      <div
        className="grid gap-4 p-6"
        style={{
          gridTemplateColumns: `repeat(${Math.max(columns, 1)}, minmax(0, 1fr))`,
          transform: "rotateX(20deg) rotateZ(-20deg) skewX(20deg)",
          animationName: animate ? "effect-ui-skew-scroll" : "none",
          animationDuration: `${speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}
      >
        {loop.map((item, index) => (
          <div
            className="flex items-center gap-2 rounded-md border bg-card px-4 py-3 text-sm shadow-sm"
            key={`${item.id}-${index}`}
          >
            <span className="bg-primary text-primary-foreground grid size-6 place-items-center rounded-full text-xs">✓</span>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
