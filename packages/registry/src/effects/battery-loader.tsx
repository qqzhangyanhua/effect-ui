"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author JaydipPrajapati1910）— https://github.com/uiverse-io/galaxy/blob/main/loaders/JaydipPrajapati1910_strong-zebra-9.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BatteryLoaderProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  duration?: number
  value?: number
}

const keyframes = `
@keyframes battery-loader-fill {
  100% { background-size: 120% 100%; }
}
`

export function BatteryLoader({ color = "var(--primary)", duration = 2, value, className, ...props }: BatteryLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const hasValue = typeof value === "number" && Number.isFinite(value)
  const active = !reduced && motionOn && !hasValue
  const cycle = Math.max(0.2, duration)
  const fill = hasValue ? Math.min(100, Math.max(0, value)) : undefined
  const nub = `linear-gradient(#0000 calc(50% - 14px), ${color} 0 calc(50% - 10px), #0000 0 calc(50% + 10px), ${color} 0 calc(50% + 14px), #0000 0) left / 100% 100% no-repeat, linear-gradient(${color} calc(50% - 10px), #0000 0 calc(50% + 10px), ${color} 0) left / 4px 100% no-repeat, linear-gradient(#0000 calc(50% - 10px), ${color} 0 calc(50% + 10px), #0000 0) right / 4px 100% no-repeat`

  return (
    <div
      {...props}
      ref={ref}
      aria-label="加载中"
      className={cn("relative box-border", className)}
      data-fill={fill ?? (active ? "animated" : "50")}
      data-motion={active ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="battery-loader"
      role="status"
      style={{
        width: 160,
        height: 80,
        border: `4px solid ${color}`,
        borderRightColor: "transparent",
        padding: 6,
        backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 20px, transparent 0 30px)`,
        backgroundRepeat: "no-repeat",
        backgroundOrigin: "content-box",
        backgroundClip: "content-box",
        backgroundPosition: "left center",
        backgroundSize: fill === undefined ? (active ? "0% 100%" : "50% 100%") : `${fill}% 100%`,
        animation: active ? `battery-loader-fill ${cycle}s infinite steps(6)` : "none",
      }}
    >
      <style>{keyframes}</style>
      <span aria-hidden className="absolute" style={{ top: -4, bottom: -4, left: "100%", width: 20, background: nub }} />
    </div>
  )
}
