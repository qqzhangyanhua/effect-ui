"use client"

import { useId, useRef, type CSSProperties, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type MeshGlowPalette = "aurora" | "dusk" | "tide"

export interface MeshGlowBgProps {
  pace?: number
  intensity?: number
  palette?: MeshGlowPalette
  paused?: boolean
  className?: string
  children?: ReactNode
}

const palettes: Record<MeshGlowPalette, readonly [string, string, string]> = {
  aurora: ["var(--primary)", "var(--chart-2)", "var(--chart-4)"],
  dusk: ["var(--chart-1)", "var(--chart-5)", "var(--accent)"],
  tide: ["var(--chart-3)", "var(--primary)", "var(--muted-foreground)"],
}

const KEYFRAMES = `
@keyframes mesh-glow-a {
  from { transform: translate3d(calc(var(--mesh-travel) * -0.45), calc(var(--mesh-travel) * 0.2), 0) scale(1); }
  to { transform: translate3d(calc(var(--mesh-travel) * 0.5), calc(var(--mesh-travel) * -0.35), 0) scale(1.08); }
}
@keyframes mesh-glow-b {
  from { transform: translate3d(calc(var(--mesh-travel) * 0.35), calc(var(--mesh-travel) * -0.15), 0) scale(1.04); }
  to { transform: translate3d(calc(var(--mesh-travel) * -0.4), calc(var(--mesh-travel) * 0.4), 0) scale(0.94); }
}
@keyframes mesh-glow-c {
  from { transform: translate3d(calc(var(--mesh-travel) * -0.1), calc(var(--mesh-travel) * 0.4), 0) scale(0.96); }
  to { transform: translate3d(calc(var(--mesh-travel) * 0.28), calc(var(--mesh-travel) * -0.2), 0) scale(1.06); }
}
`

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function MeshGlowBg({
  pace = 1,
  intensity = 0.65,
  palette = "aurora",
  paused = false,
  className,
  children,
}: MeshGlowBgProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const filterId = `mesh-blur-${useId().replace(/:/g, "")}`
  const amp = clamp01(intensity)
  const travel = Math.round(12 + amp * 40)
  const blur = Math.round(8 + amp * 16)
  const moving = live && !reduced && !paused
  const colors = palettes[palette] ?? palettes.aurora
  const blobs = [
    { name: "mesh-glow-a", cx: 210, cy: 170, rx: 190, ry: 140, fill: colors[0], delay: "0s" },
    { name: "mesh-glow-b", cx: 560, cy: 150, rx: 210, ry: 160, fill: colors[1], delay: "-7s" },
    { name: "mesh-glow-c", cx: 390, cy: 340, rx: 240, ry: 130, fill: colors[2], delay: "-13s" },
  ] as const

  return (
    <div
      ref={ref}
      data-slot="mesh-glow-bg"
      data-palette={palette}
      data-paused={paused ? "true" : "false"}
      data-motion={reduced ? "off" : moving ? "on" : "paused"}
      className={cn("relative isolate min-h-72 overflow-hidden bg-background motion-reduce:animate-none", className)}
      style={
        {
          "--mesh-travel": `${travel}px`,
          "--mesh-duration": `${Math.round(22000 / rateOf(pace))}ms`,
        } as CSSProperties
      }
    >
      <style>{KEYFRAMES}</style>
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {blobs.map((blob) => (
            <g
              key={blob.name}
              data-blob={blob.name}
              className="motion-reduce:animate-none motion-reduce:transform-none"
              style={
                reduced
                  ? { animationName: "none" }
                  : {
                      animationName: blob.name,
                      animationDuration: "var(--mesh-duration)",
                      animationTimingFunction: "ease-in-out",
                      animationIterationCount: "infinite",
                      animationDirection: "alternate",
                      animationDelay: blob.delay,
                      animationPlayState: moving ? "running" : "paused",
                    }
              }
            >
              <ellipse cx={blob.cx} cy={blob.cy} rx={blob.rx} ry={blob.ry} fill={blob.fill} opacity={0.32 + amp * 0.38} />
            </g>
          ))}
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/15 via-transparent to-background/75" />
      {children ? <div className="relative z-[1]">{children}</div> : null}
    </div>
  )
}
