import * as React from "react"

import { cn } from "@/lib/utils"

export interface LightBeamsProps extends React.HTMLAttributes<HTMLDivElement> {
  beams?: number
  speed?: number
  color?: string
  intensity?: number
}

function playbackSpeed(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function beamGradient(color: string | undefined, intensity: number) {
  const percent = Math.round(intensity * 100)
  const tint = color ?? "var(--primary)"
  return `linear-gradient(to bottom in oklab, transparent, color-mix(in oklab, ${tint} ${percent}%, transparent), transparent)`
}

function LightBeams({
  className,
  beams = 6,
  speed = 1,
  color,
  intensity = 0.5,
  ...props
}: LightBeamsProps) {
  const rate = playbackSpeed(speed)
  const themeBeam = color === undefined && intensity === 0.5
  return (
    <div
      data-slot="light-beams"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      {...props}
    >
      {Array.from({ length: beams }, (_, index) => (
        <span
          key={index}
          className={cn(
            "absolute top-0 h-[140%] w-px origin-top motion-reduce:animate-none!",
            themeBeam && "bg-linear-to-b from-transparent via-primary/50 to-transparent",
          )}
          style={{
            left: `${12 + index * (76 / beams)}%`,
            transform: `rotate(${-18 + index * 6}deg)`,
            animation: `beam-rise ${(7 + index) / rate}s ease-in-out ${index * 0.4}s infinite`,
            ...(themeBeam ? {} : { backgroundImage: beamGradient(color, intensity) }),
          }}
        />
      ))}
    </div>
  )
}

export { LightBeams }
