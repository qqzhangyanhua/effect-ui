"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FooterDotMatrixWordmarkProps {
  word?: string
  className?: string
}

const FONT: Record<string, string[]> = {
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
}

function layoutDots(word: string) {
  const points: { x: number; y: number }[] = []
  let cursor = 16
  for (const char of word.toUpperCase()) {
    const glyph = FONT[char]
    if (!glyph) {
      cursor += 28
      continue
    }
    glyph.forEach((row, y) => {
      ;[...row].forEach((bit, x) => {
        if (bit === "1") points.push({ x: cursor + x * 14, y: 20 + y * 14 })
      })
    })
    cursor += 5 * 14 + 16
  }
  return { points, width: Math.max(cursor, 80), height: 20 + 7 * 14 + 20 }
}

function FooterDotMatrixWordmark({ word = "FIELD", className }: FooterDotMatrixWordmarkProps) {
  const reduced = usePrefersReducedMotion()
  const filterId = React.useId().replace(/:/g, "")
  const layout = React.useMemo(() => layoutDots(word), [word])
  const nodes = React.useRef<Array<SVGCircleElement | null>>([])
  const pointer = React.useRef({ x: -999, y: -999 })

  React.useEffect(() => {
    if (reduced) return
    let frame = 0
    const tick = () => {
      layout.points.forEach((point, index) => {
        const node = nodes.current[index]
        if (!node) return
        const dx = point.x - pointer.current.x
        const dy = point.y - pointer.current.y
        const dist = Math.hypot(dx, dy) || 1
        const force = Math.max(0, 1 - dist / 72)
        node.setAttribute("cx", String(point.x + (dx / dist) * force * 22))
        node.setAttribute("cy", String(point.y + (dy / dist) * force * 22))
      })
      frame = window.requestAnimationFrame(tick)
      return
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [layout.points, reduced])

  return (
    <footer className={cn("overflow-hidden rounded-2xl border bg-zinc-950 px-6 py-10 text-white", className)}>
      <p className="font-mono text-xs tracking-[0.28em] text-white/45 uppercase">Dot matrix</p>
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="mt-4 h-36 w-full"
        role="img"
        aria-label={word}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          pointer.current = {
            x: ((event.clientX - box.left) / box.width) * layout.width,
            y: ((event.clientY - box.top) / box.height) * layout.height,
          }
        }}
        onPointerLeave={() => {
          pointer.current = { x: -999, y: -999 }
        }}
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {layout.points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}`}
              ref={(node) => {
                nodes.current[index] = node
              }}
              cx={point.x}
              cy={point.y}
              r="5.5"
              fill="white"
            />
          ))}
        </g>
      </svg>
      <p className="text-xs text-white/45">指针靠近时圆点散开，靠拢时又融成字。</p>
    </footer>
  )
}

export { FooterDotMatrixWordmark }
