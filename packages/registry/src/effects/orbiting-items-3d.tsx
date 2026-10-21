"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface OrbitingItems3DProps {
  items?: string[]
  className?: string
  speed?: number
  size?: number
}

function OrbitingItems3D({
  items = ["UI", "FX", "MIT", "3D", "CSS"],
  className,
  speed,
  size,
}: OrbitingItems3DProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const active = useAnimationActive(hostRef)
  const refs = React.useRef<Array<HTMLSpanElement | null>>([])
  const rate = speed === undefined || speed === 1 ? 1 : speed
  const radius = size === undefined || size === 108 ? 108 : size
  const depthAmp = size === undefined || size === 108 ? 36 : size / 3

  React.useEffect(() => {
    if (reduced || !active) return
    let frame = 0
    let angle = 0
    const step = rate === 1 ? 0.012 : 0.012 * rate
    const tick = () => {
      angle += step
      refs.current.forEach((node, index) => {
        if (!node) return
        const theta = angle + (index / items.length) * Math.PI * 2
        const depth = Math.sin(theta)
        node.style.transform = `translate(${Math.cos(theta) * radius}px, ${depth * depthAmp}px) scale(${0.72 + (depth + 1) * 0.22})`
        node.style.zIndex = String(Math.round((depth + 1) * 20))
        node.style.opacity = String(0.4 + (depth + 1) * 0.3)
      })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, depthAmp, items.length, radius, rate, reduced])

  return (
    <div ref={hostRef} className={cn("grid h-56 place-items-center", className)}>
      <div className="relative size-56 [transform:rotateX(58deg)]">
        <span className="absolute inset-8 rounded-full border border-dashed border-border" />
        {items.map((item, index) => (
          <span
            key={item}
            ref={(node) => {
              refs.current[index] = node
            }}
            className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-card text-xs font-medium shadow-sm"
            style={
              reduced
                ? {
                    transform: `translate(${Math.cos((index / items.length) * Math.PI * 2) * radius}px, ${Math.sin((index / items.length) * Math.PI * 2) * depthAmp}px)`,
                  }
                : undefined
            }
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export { OrbitingItems3D }
