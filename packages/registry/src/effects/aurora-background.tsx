import * as React from "react"

import { cn } from "@/lib/cn"

const themeAurora =
  "radial-gradient(40% 50% at 20% 20%, color-mix(in oklab, var(--primary) 45%, transparent), transparent 70%), radial-gradient(40% 50% at 80% 10%, color-mix(in oklab, var(--chart-2) 40%, transparent), transparent 70%), radial-gradient(50% 40% at 50% 90%, color-mix(in oklab, var(--chart-4) 35%, transparent), transparent 70%)"

function playbackRate(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function auroraPaint(colors: readonly string[] | undefined) {
  if (!colors || colors.length === 0) return themeAurora
  const first = colors[0] || "color-mix(in oklab, var(--primary) 45%, transparent)"
  const second = colors[1] || "color-mix(in oklab, var(--chart-2) 40%, transparent)"
  const third = colors[2] || "color-mix(in oklab, var(--chart-4) 35%, transparent)"
  return `radial-gradient(40% 50% at 20% 20%, ${first}, transparent 70%), radial-gradient(40% 50% at 80% 10%, ${second}, transparent 70%), radial-gradient(50% 40% at 50% 90%, ${third}, transparent 70%)`
}

export interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number
  intensity?: number
  colors?: readonly string[]
  size?: number
}

function AuroraBackground({
  className,
  children,
  speed = 1,
  intensity = 0.7,
  colors,
  size = 64,
  ...props
}: AuroraBackgroundProps) {
  const rate = playbackRate(speed)

  return (
    <div
      data-slot="aurora-background"
      className={cn(
        "relative isolate overflow-hidden rounded-xl bg-background",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-16 motion-reduce:animate-none!"
        style={{
          background: auroraPaint(colors),
          animation: `aurora-flow ${10 / rate}s ease-in-out infinite`,
          opacity: intensity,
          filter: `blur(${size}px)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { AuroraBackground }
