"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/container/fibonacci-lines.tsx

import { useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FibonacciLinesProps {
  className?: string
  children?: ReactNode
}

const FIBONACCI = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

const FRAME = (() => {
  const directions = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ] as const
  let x = 0
  let y = 0
  let direction = 0
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (const length of FIBONACCI) {
    const step = directions[direction] ?? [1, 0]
    const x2 = x + step[0] * length
    const y2 = y + step[1] * length
    lines.push({ x1: x, y1: y, x2, y2 })
    x = x2
    y = y2
    direction = (direction + 1) % 4
  }
  const xs = lines.flatMap((line) => [line.x1, line.x2])
  const ys = lines.flatMap((line) => [line.y1, line.y2])
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxX = Math.max(...xs)
  const maxY = Math.max(...ys)
  const pad = 12
  return {
    viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    lines,
  }
})()

const FIBONACCI_CSS = `
.fibonacci-line {
  stroke-dashoffset: 1;
  animation: fibonacci-draw 0.7s ease forwards;
}
@keyframes fibonacci-draw {
  to { stroke-dashoffset: 0; }
}
`

function FibonacciLines({ className, children }: FibonacciLinesProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(wrapRef)

  return (
    <div
      ref={wrapRef}
      data-slot="fibonacci-lines"
      data-reduced={reduced ? "true" : undefined}
      className={cn("relative flex h-64 w-full items-center justify-center text-foreground", className)}
    >
      <style>{FIBONACCI_CSS}</style>
      <svg viewBox={FRAME.viewBox} className="absolute inset-0 h-full w-full" aria-hidden="true">
        {FRAME.lines.map((line, index) => (
          <line
            key={`${line.x2}-${line.y2}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            pathLength={1}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={1}
            strokeDashoffset={reduced ? 0 : undefined}
            className={reduced ? undefined : "fibonacci-line"}
            style={{
              animationDelay: `${index * 0.08}s`,
              animationPlayState: !reduced && active ? "running" : "paused",
            }}
          />
        ))}
      </svg>
      {children ? <div className="relative z-10 px-6 text-center">{children}</div> : null}
    </div>
  )
}

export { FibonacciLines }
