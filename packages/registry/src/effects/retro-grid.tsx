import * as React from "react"

import { cn } from "@/lib/utils"

export interface RetroGridProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  speed?: number
  color?: string
  intensity?: number
  angle?: number
}

function playbackSpeed(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function lineColor(color: string | undefined, intensity: number) {
  const percent = Math.round(intensity * 100)
  const tint = color ?? "var(--primary)"
  return `color-mix(in oklab, ${tint} ${percent}%, transparent)`
}

function RetroGrid({
  className,
  size = 48,
  speed = 1,
  color,
  intensity = 0.28,
  angle = 62,
  ...props
}: RetroGridProps) {
  const rate = playbackSpeed(speed)
  const themeLines = color === undefined && intensity === 0.28
  const themeSize = size === 48
  const themeAngle = angle === 62
  const gridStyle: React.CSSProperties = {}
  if (!themeLines) {
    const line = lineColor(color, intensity)
    gridStyle.backgroundImage = `linear-gradient(to right, ${line} 1px, transparent 1px), linear-gradient(to bottom, ${line} 1px, transparent 1px)`
  }
  if (!themeSize) gridStyle.backgroundSize = `${size}px ${size}px`
  if (rate !== 1) gridStyle.animation = `grid-drift ${8 / rate}s linear infinite`

  return (
    <div
      data-slot="retro-grid"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:220px]",
        className,
      )}
      {...props}
    >
      <div
        className={cn("absolute inset-0 origin-bottom", themeAngle && "[transform:rotateX(62deg)]")}
        style={themeAngle ? undefined : { transform: `rotateX(${angle}deg)` }}
      >
        <div
          className={cn(
            "h-[200%] w-full",
            themeLines &&
              "bg-[linear-gradient(to_right,color-mix(in_oklab,var(--primary)_28%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_28%,transparent)_1px,transparent_1px)]",
            themeSize && "bg-size-[48px_48px]",
            rate === 1
              ? "animate-[grid-drift_8s_linear_infinite] motion-reduce:animate-none"
              : "motion-reduce:animate-none!",
          )}
          style={Object.keys(gridStyle).length > 0 ? gridStyle : undefined}
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
    </div>
  )
}

export { RetroGrid }
