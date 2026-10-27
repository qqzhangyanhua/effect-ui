"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PixelTransitionProps {
  from: string
  to: string
  className?: string
  count?: number
  duration?: number
  delay?: number
}

function PixelTransition({ from, to, className, count, duration, delay }: PixelTransitionProps) {
  const reduced = usePrefersReducedMotion()
  const [revealed, setRevealed] = React.useState(false)
  const cells = count === undefined || count === 48 ? 48 : count
  const columns = cells / 4
  const stagger = delay === undefined || delay === 28 ? 28 : delay
  const fadeMs = duration === undefined || duration === 500 ? undefined : duration

  return (
    <button
      type="button"
      onClick={() => setRevealed((value) => !value)}
      className={cn("relative block aspect-video w-full overflow-hidden rounded-xl border", className)}
      data-reduced={reduced ? "true" : undefined}
    >
      <span className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${revealed ? to : from})` }} />
      <span className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: cells }, (_, index) => (
          <span
            key={index}
            className={cn(
              "bg-zinc-950 motion-reduce:transition-none",
              reduced ? "transition-none" : fadeMs === undefined ? "transition-opacity duration-500" : "transition-opacity",
            )}
            style={{
              opacity: revealed ? 0 : 0.35 + ((index * 17) % 7) * 0.08,
              transitionDelay: reduced ? "0ms" : `${(index % columns) * stagger}ms`,
              ...(reduced ? { transitionDuration: "0ms" } : fadeMs === undefined ? {} : { transitionDuration: `${fadeMs}ms` }),
            }}
          />
        ))}
      </span>
      <span className="relative z-10 grid h-full place-items-center text-sm text-white">点击像素过渡</span>
    </button>
  )
}

export { PixelTransition }
