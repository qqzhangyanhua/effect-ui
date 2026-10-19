"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CursorTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  dots?: number
}

function CursorTrail({ className, children, dots = 8, ...props }: CursorTrailProps) {
  const [points, setPoints] = React.useState<Array<{ x: number; y: number }>>(() =>
    Array.from({ length: dots }, () => ({ x: -20, y: -20 })),
  )

  return (
    <div
      data-slot="cursor-trail"
      className={cn("relative overflow-hidden", className)}
      onMouseMove={(event) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
        const rect = event.currentTarget.getBoundingClientRect()
        const next = { x: event.clientX - rect.left, y: event.clientY - rect.top }
        setPoints((current) => [next, ...current.slice(0, dots - 1)])
      }}
      {...props}
    >
      {points.map((point, index) => (
        <span
          key={index}
          className="pointer-events-none absolute size-2.5 rounded-full bg-primary"
          style={{
            left: point.x,
            top: point.y,
            opacity: 1 - index / dots,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {children}
    </div>
  )
}

export { CursorTrail }
