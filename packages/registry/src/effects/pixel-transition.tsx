"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface PixelTransitionProps {
  from: string
  to: string
  className?: string
}

function PixelTransition({ from, to, className }: PixelTransitionProps) {
  const [revealed, setRevealed] = React.useState(false)
  const cells = 48

  return (
    <button
      type="button"
      onClick={() => setRevealed((value) => !value)}
      className={cn("relative block aspect-video w-full overflow-hidden rounded-xl border", className)}
    >
      <span className="absolute inset-0 bg-cover" style={{ backgroundImage: `url(${revealed ? to : from})` }} />
      <span className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cells / 4}, 1fr)` }}>
        {Array.from({ length: cells }, (_, index) => (
          <span
            key={index}
            className="bg-zinc-950 transition-opacity duration-500"
            style={{
              opacity: revealed ? 0 : 0.35 + ((index * 17) % 7) * 0.08,
              transitionDelay: `${(index % 12) * 28}ms`,
            }}
          />
        ))}
      </span>
      <span className="relative z-10 grid h-full place-items-center text-sm text-white">点击像素过渡</span>
    </button>
  )
}

export { PixelTransition }
