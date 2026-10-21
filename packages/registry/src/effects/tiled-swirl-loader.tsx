"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TiledSwirlLoaderProps {
  size?: number
  color?: string
  speed?: number
  className?: string
}

function spiralCells(count: number) {
  const cells: { x: number; y: number }[] = []
  const seen = new Set<string>()
  let x = 0
  let y = 0
  let dx = 1
  let dy = 0
  while (cells.length < count * count) {
    cells.push({ x, y })
    seen.add(`${x},${y}`)
    let nextX = x + dx
    let nextY = y + dy
    if (nextX < 0 || nextY < 0 || nextX >= count || nextY >= count || seen.has(`${nextX},${nextY}`)) {
      const turnX = -dy
      const turnY = dx
      dx = turnX
      dy = turnY
      nextX = x + dx
      nextY = y + dy
    }
    x = nextX
    y = nextY
  }
  return cells
}

function TiledSwirlLoader({ size = 168, color = "#38bdf8", speed = 1, className }: TiledSwirlLoaderProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const count = size < 120 ? 5 : 7
  const cells = React.useMemo(() => spiralCells(count), [count])
  const [phase, setPhase] = React.useState(0)

  React.useEffect(() => {
    if (reduced) return
    const host = hostRef.current
    if (!host) return
    let frame = 0
    let running = true
    const visibleRef = { current: true }
    let time = 0
    const tick = () => {
      if (!running) return
      if (!visibleRef.current) {
        frame = 0
        return
      }
      time += 0.016 * speed
      setPhase(time)
      frame = window.requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((entry) => entry.isIntersecting)
      if (visibleRef.current && running && frame === 0) frame = window.requestAnimationFrame(tick)
    })
    observer.observe(host)
    frame = window.requestAnimationFrame(tick)
    return () => {
      running = false
      window.cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [reduced, speed])

  if (reduced) {
    return (
      <div data-slot="tiled-swirl-loader" className={cn("inline-flex", className)} role="img" aria-label="加载中">
        <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="14" fill="none" stroke={color} strokeWidth="4" strokeDasharray="28 60" />
        </svg>
      </div>
    )
  }

  const cell = size / count
  return (
    <div ref={hostRef} data-slot="tiled-swirl-loader" className={cn("inline-grid", className)} style={{ width: size, height: size, gridTemplateColumns: `repeat(${count}, 1fr)` }} role="img" aria-label="方块旋涡加载">
      {cells.map((item, index) => {
        const wave = Math.sin(phase * 2.4 - index * 0.38)
        const scale = 0.35 + (wave + 1) * 0.32
        return (
          <span
            key={`${item.x}-${item.y}`}
            style={{
              width: cell - 3,
              height: cell - 3,
              margin: 1.5,
              background: color,
              borderRadius: 3,
              transform: `scale(${scale})`,
              opacity: 0.35 + scale * 0.6,
            }}
          />
        )
      })}
    </div>
  )
}

export { TiledSwirlLoader }
