"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SparklesProps extends React.HTMLAttributes<HTMLSpanElement> {
  count?: number
}

function Sparkles({ className, children, count = 8, ...props }: SparklesProps) {
  return (
    <span data-slot="sparkles" className={cn("relative inline-flex", className)} {...props}>
      {children}
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="pointer-events-none absolute size-1 rounded-full bg-amber-300 animate-[sparkle-twinkle_ease-in-out_infinite] motion-reduce:animate-none"
          style={{
            left: `${8 + ((index * 13) % 84)}%`,
            top: `${((index * 19) % 80) - 10}%`,
            animationDuration: `${1.4 + (index % 3) * 0.3}s`,
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}
    </span>
  )
}

export { Sparkles }
