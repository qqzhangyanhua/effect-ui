import * as React from "react"

import { cn } from "@/lib/utils"

export interface AnimatedGridProps extends React.SVGAttributes<SVGSVGElement> {
  cell?: number
  speed?: number
  color?: string
  intensity?: number
}

function playbackSpeed(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function strokeColor(color: string | undefined, intensity: number) {
  const percent = Math.round(intensity * 100)
  const tint = color ?? "var(--foreground)"
  return `color-mix(in oklab, ${tint} ${percent}%, transparent)`
}

function AnimatedGrid({
  className,
  cell = 36,
  speed = 1,
  color,
  intensity = 0.15,
  style,
  ...props
}: AnimatedGridProps) {
  const id = React.useId()
  const rate = playbackSpeed(speed)
  const themeStroke = color === undefined && intensity === 0.15
  return (
    <svg
      aria-hidden
      data-slot="animated-grid"
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        themeStroke && "stroke-foreground/15",
        className,
      )}
      style={themeStroke ? style : { ...style, stroke: strokeColor(color, intensity) }}
      {...props}
    >
      <defs>
        <pattern id={id} width={cell} height={cell} patternUnits="userSpaceOnUse">
          <path d={`M ${cell} 0 L 0 0 0 ${cell}`} fill="none" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill={`url(#${id})`}
        className={
          rate === 1
            ? "animate-[grid-drift_12s_linear_infinite] motion-reduce:animate-none"
            : "motion-reduce:animate-none!"
        }
        style={rate === 1 ? undefined : { animation: `grid-drift ${12 / rate}s linear infinite` }}
      />
    </svg>
  )
}

export { AnimatedGrid }
