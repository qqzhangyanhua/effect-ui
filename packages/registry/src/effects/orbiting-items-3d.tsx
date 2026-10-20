"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface OrbitingItems3DProps {
  items?: string[]
  className?: string
}

function OrbitingItems3D({
  items = ["UI", "FX", "MIT", "3D", "CSS"],
  className,
}: OrbitingItems3DProps) {
  const reduced = usePrefersReducedMotion()
  const refs = React.useRef<Array<HTMLSpanElement | null>>([])

  React.useEffect(() => {
    if (reduced) return
    let frame = 0
    let angle = 0
    const tick = () => {
      angle += 0.012
      refs.current.forEach((node, index) => {
        if (!node) return
        const theta = angle + (index / items.length) * Math.PI * 2
        const depth = Math.sin(theta)
        node.style.transform = `translate(${Math.cos(theta) * 108}px, ${depth * 36}px) scale(${0.72 + (depth + 1) * 0.22})`
        node.style.zIndex = String(Math.round((depth + 1) * 20))
        node.style.opacity = String(0.4 + (depth + 1) * 0.3)
      })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [items.length, reduced])

  return (
    <div className={cn("grid h-56 place-items-center", className)}>
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
                    transform: `translate(${Math.cos((index / items.length) * Math.PI * 2) * 108}px, ${Math.sin((index / items.length) * Math.PI * 2) * 36}px)`,
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
