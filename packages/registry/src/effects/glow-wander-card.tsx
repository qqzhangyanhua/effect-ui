"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author codebykay101）— https://github.com/uiverse-io/galaxy/blob/main/Cards/codebykay101_red-fox-31.html. Modified for effect-ui.

import { useRef, type CSSProperties, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const CSS = `
[data-slot="glow-wander-card"] [data-cell] {
  position: relative;
  width: 150px;
  height: 150px;
  overflow: hidden;
  background: color-mix(in oklab, var(--foreground) 88%, black);
  transform: rotate(calc(90deg * var(--i)));
}
[data-slot="glow-wander-card"] [data-cell]::before {
  content: "";
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(var(--clr), transparent);
  animation: glow-wander-card-move var(--glow-duration) linear infinite;
}
[data-slot="glow-wander-card"][data-motion="off"] [data-cell]::before {
  animation: none;
  transform: translate(-40px, -40px);
}
[data-slot="glow-wander-card"] [data-cell]::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: color-mix(in oklab, var(--foreground) 82%, black);
}
@keyframes glow-wander-card-move {
  0% { transform: translate(-150px, -150px); }
  25% { transform: translate(0, -150px); }
  50% { transform: translate(0, 0); }
  75% { transform: translate(-150px, 0); }
  100% { transform: translate(-150px, -150px); }
}
`

export interface GlowWanderCardProps extends HTMLAttributes<HTMLDivElement> {
  /** 每块的发光色。不传时使用图表色。 */
  colors?: string[]
  /** 光点绕一圈的秒数。 */
  duration?: number
}

export function GlowWanderCard({ colors, duration = 1.5, className, style, ...props }: GlowWanderCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const palette = [colors?.[0] ?? "var(--chart-1)", colors?.[1] ?? "var(--chart-2)", colors?.[2] ?? "var(--chart-3)"]
  const painted = { "--glow-duration": `${duration}s`, ...style } as CSSProperties

  return (
    <div
      {...props}
      ref={ref}
      className={cn("flex items-center justify-center gap-5", className)}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="glow-wander-card"
      style={painted}
    >
      <style>{CSS}</style>
      {palette.map((color, index) => (
        <div
          key={color + index}
          data-cell=""
          style={{ "--clr": color, "--i": String(index + 1) } as CSSProperties}
        />
      ))}
    </div>
  )
}
