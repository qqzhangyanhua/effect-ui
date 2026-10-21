"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/svg-bands.tsx

import { useId, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SvgBandsProps {
  colors?: readonly string[]
  className?: string
  children?: ReactNode
}

const DEFAULT_COLORS = ["#38bdf8", "#a78bfa", "#f472b6"]

const BANDS = [
  "M-40,90 C80,10 180,150 320,40 C420,-20 520,120 640,70 L640,170 C500,210 400,90 280,150 C160,210 40,120 -40,180 Z",
  "M-40,130 C90,50 200,190 340,90 C460,10 540,160 640,110 L640,210 C520,250 430,140 310,190 C180,250 70,160 -40,220 Z",
  "M-40,40 C110,-20 210,120 360,20 C480,-40 560,100 640,50 L640,140 C530,190 420,70 290,130 C150,190 40,90 -40,130 Z",
]

function safeToken(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "")
  return cleaned || "bands"
}

function SvgBands({ colors = DEFAULT_COLORS, className, children }: SvgBandsProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(wrapRef)
  const token = safeToken(useId())
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS
  const flowing = !reduced && active

  const css = `
@keyframes svg-bands-${token} {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-56px, 16px, 0); }
}
.svg-bands-${token} {
  animation: svg-bands-${token} 16s linear infinite;
  animation-play-state: ${flowing ? "running" : "paused"};
}
`

  return (
    <div
      ref={wrapRef}
      data-slot="svg-bands"
      data-reduced={reduced ? "true" : undefined}
      className={cn("relative h-56 w-full overflow-hidden rounded-xl bg-[#070b16]", className)}
    >
      <style>{css}</style>
      <svg viewBox="0 0 600 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          {palette.map((color, index) => (
            <linearGradient id={`svg-band-${token}-${index}`} key={color + index} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.15" />
              <stop offset="0.5" stopColor={color} stopOpacity="0.85" />
              <stop offset="1" stopColor={palette[(index + 1) % palette.length]} stopOpacity="0.2" />
            </linearGradient>
          ))}
        </defs>
        {BANDS.map((path, index) => (
          <path
            key={path}
            d={path}
            fill={`url(#svg-band-${token}-${index % palette.length})`}
            className={reduced ? undefined : `svg-bands-${token}`}
            style={{ animationDelay: `${index * -3}s` }}
          />
        ))}
      </svg>
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
    </div>
  )
}

export { SvgBands }
