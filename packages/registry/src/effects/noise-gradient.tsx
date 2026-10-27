import * as React from "react"

import { cn } from "@/lib/cn"

const NOISE_COLORS = ["#7c3aed", "#d946ef", "#22d3ee"]
const NOISE_THEME_STOPS = [
  "var(--color-violet-600)",
  "var(--color-fuchsia-500)",
  "var(--color-cyan-400)",
]
const NOISE_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export interface NoiseGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  colors?: string[]
  angle?: number
  intensity?: number
  scale?: number
}

function sameNoisePalette(colors: readonly string[]) {
  return (
    colors.length === NOISE_COLORS.length &&
    colors.every((color, index) => color.toLowerCase() === NOISE_COLORS[index])
  )
}

function noiseGradient(colors: readonly string[] | undefined, angle: number) {
  const stops = colors ?? NOISE_THEME_STOPS
  const direction = angle === 135 ? "to bottom right" : `${angle}deg`
  return `linear-gradient(${direction} in oklab, ${stops.join(", ")})`
}

function noiseImage(scale: number) {
  if (scale === 1) return NOISE_IMAGE
  const frequency = Number((0.85 * scale).toFixed(4)).toString()
  const svg = `<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='4'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function NoiseGradient({
  className,
  children,
  colors,
  angle = 135,
  intensity = 0.25,
  scale = 1,
  ...props
}: NoiseGradientProps) {
  const defaultColors = colors === undefined || sameNoisePalette(colors)
  const themeGradient = defaultColors && angle === 135
  return (
    <div
      data-slot="noise-gradient"
      className={cn("relative overflow-hidden rounded-xl", className)}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0",
          themeGradient && "bg-linear-to-br from-violet-600 via-fuchsia-500 to-cyan-400",
        )}
        style={
          themeGradient
            ? undefined
            : { backgroundImage: noiseGradient(defaultColors ? undefined : colors, angle) }
        }
      />
      <div
        aria-hidden
        className={cn("absolute inset-0 mix-blend-overlay", intensity === 0.25 && "opacity-25")}
        style={{
          backgroundImage: noiseImage(scale),
          ...(intensity === 0.25 ? {} : { opacity: intensity }),
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export { NoiseGradient }
