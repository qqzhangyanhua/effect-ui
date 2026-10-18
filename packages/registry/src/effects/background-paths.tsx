"use client"

import { cn } from "@/lib/utils"

export interface BackgroundPathsProps {
  className?: string
  count?: number
}

function BackgroundPaths({ className, count = 10 }: BackgroundPathsProps) {
  const paths = Array.from({ length: count }, (_, index) => {
    const y = 20 + index * (60 / count)
    return `M -10 ${y} C 30 ${y - 18}, 70 ${y + 18}, 110 ${y}`
  })

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full text-foreground/25"
      >
        {paths.map((d, index) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.35"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 1,
              animation: `path-draw 2.4s ${index * 80}ms ease forwards, path-flow 8s ${index * 200}ms linear infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export { BackgroundPaths }
