import * as React from "react"

import { cn } from "@/lib/utils"

export interface RipplesProps extends React.HTMLAttributes<HTMLDivElement> {
  rings?: number
  speed?: number
  color?: string
  intensity?: number
}

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function rippleBorder(color: string | undefined, intensity: number) {
  if (color === undefined && intensity === 0.2) return undefined
  const source = color ?? "var(--foreground)"
  const percent = Math.round(intensity * 1000) / 10
  return `color-mix(in oklab, ${source} ${percent}%, transparent)`
}

function Ripples({
  rings = 4,
  speed = 1,
  color,
  intensity = 0.2,
  className,
  ...props
}: RipplesProps) {
  const rate = playbackRate(speed)

  return (
    <div
      data-slot="ripples"
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center overflow-hidden",
        className,
      )}
      {...props}
    >
      {Array.from({ length: rings }, (_, index) => (
        <span
          key={index}
          className={cn(
            "absolute aspect-square rounded-full border motion-reduce:animate-none!",
            color === undefined && intensity === 0.2 && "border-foreground/20",
          )}
          style={{
            width: `${28 + index * 22}%`,
            animation: `ripple-pulse ${3.6 / rate}s ease-out ${index * 0.45}s infinite`,
            borderColor: rippleBorder(color, intensity),
          }}
        />
      ))}
    </div>
  )
}

export { Ripples }
