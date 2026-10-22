"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author jeremyssocial, elijahgummer, mobinkakei）— https://github.com/uiverse-io/galaxy/tree/main/Patterns

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type HTMLAttributes, type ReactNode } from "react"

export type CssPatternVariant = "stripes" | "dots" | "honeycomb"

export interface CssPatternBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CssPatternVariant
  color?: string
  size?: number
  speed?: number
  children?: ReactNode
}

const honeycomb = `
radial-gradient(circle at 50% 50%, var(--b4) calc(var(--sz) * 1), #fff0 calc(var(--sz) * 8)) var(--ts),
radial-gradient(circle at 0% 0%, var(--b4) calc(var(--sz) * 1), #fff0 calc(var(--sz) * 8)) var(--ts),
radial-gradient(circle at 0% 100%, var(--b4) calc(var(--sz) * 1), #fff0 calc(var(--sz) * 8)) var(--ts),
radial-gradient(circle at 100% 0%, var(--b4) calc(var(--sz) * 1), #fff0 calc(var(--sz) * 8)) var(--ts),
radial-gradient(circle at 100% 100%, var(--b4) calc(var(--sz) * 1), #fff0 calc(var(--sz) * 8)) var(--ts),
conic-gradient(from 90deg at 97.5% 67%, var(--c1) 0 87.5deg, #fff0 88deg 100%) var(--ts),
conic-gradient(from 90deg at 97.5% 67%, var(--c1) 0 87.5deg, #fff0 88deg 100%) var(--ts),
conic-gradient(from 182.5deg at 2.5% 67%, #fff0 0 0deg, var(--c1) 0.5deg 90deg, #fff0 0 100%) var(--ts),
conic-gradient(from 182.5deg at 2.5% 67%, #fff0 0 0deg, var(--c1) 0.5deg 90deg, #fff0 0 100%) var(--ts),
conic-gradient(from 270deg at 2.5% 33%, var(--c1) 0 87.5deg, #fff0 88deg 100%) var(--ts),
conic-gradient(from 270deg at 2.5% 33%, var(--c1) 0 87.5deg, #fff0 88deg 100%) var(--ts),
conic-gradient(from 2.5deg at 97.5% 33%, #fff0 0 0deg, var(--c1) 0.5deg 90deg, #fff0 0 100%) var(--ts),
conic-gradient(from 2.5deg at 97.5% 33%, #fff0 0 0deg, var(--c1) 0.5deg 90deg, #fff0 0 100%) var(--ts),
conic-gradient(from 116.5deg at 50% 85.5%, var(--b1) 0 127deg, #fff0 0 100%) var(--ts),
conic-gradient(from 116.5deg at 50% 85.5%, var(--b1) 0 127deg, #fff0 0 100%) var(--ts),
conic-gradient(from 116.5deg at 50% 85.5%, var(--b1) 0 127deg, #fff0 0 100%) var(--ts),
conic-gradient(from 120deg at 50% 83%, var(--c1) 0 120deg, #fff0 0 100%) var(--ts),
conic-gradient(from -63.5deg at 50% 14.5%, var(--b1) 0 127deg, #fff0 0 100%) var(--ts),
conic-gradient(from -63.5deg at 50% 14.5%, var(--b1) 0 127deg, #fff0 0 100%) var(--ts),
conic-gradient(from -63.5deg at 50% 14.5%, var(--b1) 0 127deg, #fff0 0 100%) var(--ts),
conic-gradient(from -60deg at 50% 17%, var(--c1) 0 120deg, #fff0 0 100%) var(--ts),
conic-gradient(from 0deg at 50% 50%, #fff0 0 2deg, var(--b2) 2.5deg 57.5deg, #fff0 58deg 62.5deg, var(--b1) 63deg 117.5deg, #fff0 118deg 122.5deg, var(--b3) 123deg 177.5deg, #fff0 178deg 182deg, var(--b2) 182.5deg 237.5deg, #fff0 0 242.5deg, var(--b1) 243deg 297.5deg, #fff0 298deg 302.5deg, var(--b3) 303deg 357.5deg, #fff0 358deg 360deg) var(--ts),
var(--c1)`

export function CssPatternBackground({
  variant = "stripes",
  color = "var(--primary)",
  size,
  speed,
  className,
  children,
  style,
  ...props
}: CssPatternBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const cell = size ?? (variant === "honeycomb" ? 4 : variant === "dots" ? 30 : 40)
  const seconds = speed ?? (variant === "dots" ? 8 : variant === "honeycomb" ? 5 : 4)
  const stripe = `linear-gradient(135deg, ${color} 25%, color-mix(in oklab, ${color}, black 18%) 25%, color-mix(in oklab, ${color}, black 18%) 50%, ${color} 50%, ${color} 75%, color-mix(in oklab, ${color}, black 18%) 75%)`

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="css-pattern-background"
      data-variant={variant}
      style={{
        ...style,
        ["--move" as string]: `${cell}px`,
        ["--sz" as string]: `${cell}px`,
        ["--sp" as string]: `${seconds}s`,
        ["--c1" as string]: color,
        ["--b1" as string]: `color-mix(in oklab, ${color} 35%, black)`,
        ["--b2" as string]: `color-mix(in oklab, ${color} 22%, black)`,
        ["--b3" as string]: `color-mix(in oklab, ${color} 12%, black)`,
        ["--b4" as string]: `color-mix(in oklab, ${color} 20%, transparent)`,
        ["--ts" as string]: "50% / calc(var(--sz) * 17.5) calc(var(--sz) * 29.5)",
        background: variant === "stripes" ? stripe : variant === "honeycomb" ? honeycomb : `color-mix(in oklab, ${color} 35%, black)`,
        backgroundSize: variant === "stripes" ? `${cell}px ${cell}px` : undefined,
        animation: variant === "stripes" && animate ? `effect-ui-stripes ${seconds}s linear infinite` : variant === "honeycomb" && animate ? `effect-ui-pattern-hue ${seconds}s linear infinite` : "none",
      }}
    >
      <style>{`
        @keyframes effect-ui-stripes { to { background-position: var(--move) var(--move); } }
        @keyframes effect-ui-dots { to { transform: translate(20%, 20%); } }
        @keyframes effect-ui-pattern-hue { to { filter: hue-rotate(360deg); } }
      `}</style>
      {variant === "dots" ? (
        <span
          aria-hidden
          className="absolute top-[-50%] left-[-50%] h-[200%] w-[200%]"
          style={{
            background: `radial-gradient(circle, ${color} 10%, transparent 20%), radial-gradient(circle, transparent 10%, ${color} 20%)`,
            backgroundSize: `${cell}px ${cell}px`,
            animation: animate ? `effect-ui-dots ${seconds}s linear infinite` : "none",
          }}
        />
      ) : null}
      {children}
    </div>
  )
}
