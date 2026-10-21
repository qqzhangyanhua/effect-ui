"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SparklesProps extends React.HTMLAttributes<HTMLSpanElement> {
  count?: number
  duration?: number
  delay?: number
  size?: number
  color?: string
}

function Sparkles({ className, children, count = 8, duration, delay, size, color, ...props }: SparklesProps) {
  const baseSec = duration === undefined || duration === 1400 ? undefined : duration / 1000
  const staggerMs = delay === undefined || delay === 120 ? undefined : delay
  const dot = size === undefined || size === 4 ? undefined : size
  return (
    <span data-slot="sparkles" className={cn("relative inline-flex", className)} {...props}>
      {children}
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={
            dot === undefined && !color
              ? "pointer-events-none absolute size-1 rounded-full bg-amber-300 animate-[sparkle-twinkle_ease-in-out_infinite] motion-reduce:animate-none"
              : cn(
                  "pointer-events-none absolute rounded-full animate-[sparkle-twinkle_ease-in-out_infinite] motion-reduce:animate-none",
                  dot === undefined && "size-1",
                  !color && "bg-amber-300",
                )
          }
          style={{
            left: `${8 + ((index * 13) % 84)}%`,
            top: `${((index * 19) % 80) - 10}%`,
            animationDuration: baseSec === undefined ? `${1.4 + (index % 3) * 0.3}s` : `${baseSec + (index % 3) * 0.3}s`,
            animationDelay: staggerMs === undefined ? `${index * 0.12}s` : `${index * staggerMs}ms`,
            ...(dot === undefined ? null : { width: dot, height: dot }),
            ...(color ? { backgroundColor: color } : null),
          }}
        />
      ))}
    </span>
  )
}

export { Sparkles }
