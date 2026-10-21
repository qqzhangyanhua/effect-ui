import type { ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const EDGE = "#7c3aed"

export interface GlowingEdgeProps {
  children: ReactNode
  className?: string
  /** 旋转一周的时长，毫秒。不传或 6000 仍是 6 秒。 */
  duration?: number
  /** 描边颜色。不传或 #7c3aed 仍用原来的紫色渐变。 */
  color?: string
  /** 色带张角倍率。不传或 1 仍是 70° 到 140°。 */
  intensity?: number
  /** 描边厚度，像素。不传或 1 仍是 1px。 */
  size?: number
}

function GlowingEdge({ children, className, duration, color, intensity, size }: GlowingEdgeProps) {
  const reduced = usePrefersReducedMotion()
  const timed = duration === undefined || duration === 6000
  const painted = color === undefined || color.toLowerCase() === EDGE
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const width = size === undefined || size === 1 ? 1 : size
  const canonical = timed && painted && gain === 1
  return (
    <div className={cn("relative overflow-hidden rounded-2xl", width === 1 && "p-px", className)} style={width === 1 ? undefined : { padding: width }}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-[-40%] motion-reduce:animate-none",
          canonical &&
            "animate-[glow-orbit_6s_linear_infinite] bg-[conic-gradient(from_var(--shine-angle),transparent_0deg,#7c3aed_70deg,transparent_140deg)]",
        )}
        style={
          canonical
            ? undefined
            : {
                animation: reduced ? "none" : timed ? "glow-orbit 6s linear infinite" : `glow-orbit ${duration}ms linear infinite`,
                background: `conic-gradient(from var(--shine-angle), transparent 0deg, ${painted ? EDGE : color} ${70 * gain}deg, transparent ${140 * gain}deg)`,
              }
        }
      />
      <div className="relative rounded-[calc(var(--radius)+2px)] bg-card p-5">{children}</div>
    </div>
  )
}

export { GlowingEdge }
