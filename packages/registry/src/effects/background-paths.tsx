"use client"

import { cn } from "@/lib/utils"

export interface BackgroundPathsProps {
  className?: string
  count?: number
  color?: string
  intensity?: number
  speed?: number
  duration?: number
}

function BackgroundPaths({
  className,
  count = 10,
  color,
  intensity = 0.45,
  speed = 1,
  duration = 2400,
}: BackgroundPathsProps) {
  const paths = Array.from({ length: count }, (_, index) => {
    const y = 20 + index * (60 / count)
    return `M -10 ${y} C 30 ${y - 18}, 70 ${y + 18}, 110 ${y}`
  })
  const themeStroke = color === undefined && intensity === 0.45
  const rate = Number.isFinite(speed) && speed > 0 ? speed : 1

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className={
          themeStroke
            ? "absolute inset-0 size-full text-foreground/45"
            : cn("absolute inset-0 size-full", color === undefined && "text-foreground")
        }
      >
        {paths.map((d, index) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={color ?? "currentColor"}
            strokeOpacity={themeStroke ? undefined : intensity}
            strokeWidth="0.35"
            pathLength={1}
            className="motion-reduce:animate-none!"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: 0.15,
              animation: `path-draw ${duration / 1000}s ${index * 80}ms ease forwards, path-flow ${8 / rate}s ${index * 200}ms linear infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export { BackgroundPaths }
