"use client"

import * as React from "react"

import { cn } from "@/lib/cn"

export interface CursorTrailProps extends React.HTMLAttributes<HTMLDivElement> {
  dots?: number
  size?: number
  color?: string
  intensity?: number
}

function CursorTrail({ className, children, dots = 8, size, color, intensity, ...props }: CursorTrailProps) {
  const [points, setPoints] = React.useState<Array<{ x: number; y: number }>>(() =>
    Array.from({ length: dots }, () => ({ x: -20, y: -20 })),
  )
  const keepSize = size === undefined || size === 10
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity

  return (
    <div
      data-slot="cursor-trail"
      className={cn("relative overflow-hidden", className)}
      onMouseMove={(event) => {
        const media = window.matchMedia
        if (media("(prefers-reduced-motion: reduce)").matches || media("(pointer: coarse)").matches) return
        const rect = event.currentTarget.getBoundingClientRect()
        const next = { x: event.clientX - rect.left, y: event.clientY - rect.top }
        setPoints((current) => [next, ...current.slice(0, dots - 1)])
      }}
      {...props}
    >
      {points.map((point, index) => (
        <span
          key={index}
          className={cn(
            "pointer-events-none absolute rounded-full",
            keepSize && "size-2.5",
            color ? "" : "bg-primary",
          )}
          style={{
            left: point.x,
            top: point.y,
            width: keepSize ? undefined : size,
            height: keepSize ? undefined : size,
            opacity: (1 - index / dots) * gain,
            backgroundColor: color,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {children}
    </div>
  )
}

export { CursorTrail }
