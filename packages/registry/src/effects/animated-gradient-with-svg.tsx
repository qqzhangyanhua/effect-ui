"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/background/animated-gradient-with-svg.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useDebouncedDimensions } from "@/hooks/use-debounced-dimensions"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useMemo, useRef, type CSSProperties } from "react"

export interface AnimatedGradientProps {
  colors: string[]
  speed?: number
  blur?: "light" | "medium" | "heavy"
  className?: string
}

function unit(seed: number) {
  return Math.sin(seed) * 0.5
}

function blobLayout(index: number) {
  const angle = index * 1.7
  return {
    top: `${18 + (index % 3) * 16}%`,
    left: `${12 + (index % 3) * 28}%`,
    scale: 1.05 + (index % 3) * 0.28,
    vars: {
      "--tx-1": unit(angle),
      "--ty-1": unit(angle + 1),
      "--tx-2": unit(angle + 2),
      "--ty-2": unit(angle + 3),
      "--tx-3": unit(angle + 4),
      "--ty-3": unit(angle + 5),
      "--tx-4": unit(angle + 6),
      "--ty-4": unit(angle + 7),
    } as CSSProperties,
  }
}

const KEYFRAMES = `
@keyframes effect-ui-blob-drift {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(calc(100% * var(--tx-1, 1)), calc(100% * var(--ty-1, 1))); }
  40% { transform: translate(calc(100% * var(--tx-2, -1)), calc(100% * var(--ty-2, 1))); }
  60% { transform: translate(calc(100% * var(--tx-3, 1)), calc(100% * var(--ty-3, -1))); }
  80% { transform: translate(calc(100% * var(--tx-4, -1)), calc(100% * var(--ty-4, -1))); }
}
`

export function AnimatedGradient({ colors, speed = 5, blur = "light", className }: AnimatedGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDebouncedDimensions(containerRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(containerRef)
  const animate = !prefersReducedMotion && motionOn
  const circleSize = useMemo(() => {
    const shortest = Math.min(dimensions.width, dimensions.height)
    const longest = Math.max(dimensions.width, dimensions.height)
    return shortest > 0 ? shortest : longest
  }, [dimensions.height, dimensions.width])
  const blurClass = blur === "light" ? "blur-2xl" : blur === "medium" ? "blur-3xl" : "blur-[100px]"

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="animated-gradient-with-svg"
      ref={containerRef}
    >
      <style>{KEYFRAMES}</style>
      <div className={cn("absolute inset-0", blurClass)}>
        {colors.map((color, index) => {
          const layout = blobLayout(index)
          return (
            <svg
              aria-hidden="true"
              className="absolute"
              height={circleSize * layout.scale}
              key={color + index}
              style={{
                top: layout.top,
                left: layout.left,
                ...layout.vars,
                animationName: animate ? "effect-ui-blob-drift" : "none",
                animationDuration: `${speed}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
              viewBox="0 0 100 100"
              width={circleSize * layout.scale}
            >
              <circle cx="50" cy="50" fill={color} r="50" />
            </svg>
          )
        })}
      </div>
    </div>
  )
}
