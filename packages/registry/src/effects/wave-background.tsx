import * as React from "react"

import { cn } from "@/lib/utils"

export interface WaveBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  color?: string
  intensity?: number
  size?: number
}

function playbackSpeed(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function WaveBackground({
  className,
  children,
  speed = 1,
  color,
  intensity = 0.25,
  size = 112,
  ...props
}: WaveBackgroundProps) {
  const rate = playbackSpeed(speed)
  const themeWave = color === undefined && intensity === 0.25
  const themeSize = size === 112
  return (
    <div
      data-slot="wave-background"
      className={cn("relative overflow-hidden rounded-xl bg-background", className)}
      {...props}
    >
      <svg
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 w-full",
          themeSize && "h-28",
          themeWave && "text-primary/25",
        )}
        style={{
          ...(themeSize ? {} : { height: size }),
          ...(themeWave ? {} : { color: color ?? "var(--primary)", opacity: intensity }),
        }}
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          className={
            rate === 1
              ? "animate-[wave-shift_8s_ease-in-out_infinite] motion-reduce:animate-none"
              : "motion-reduce:animate-none!"
          }
          style={rate === 1 ? undefined : { animation: `wave-shift ${8 / rate}s ease-in-out infinite` }}
          d="M0,64 C240,120 480,0 720,48 C960,96 1200,16 1440,64 L1440,120 L0,120 Z"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { WaveBackground }
