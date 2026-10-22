"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author SmookyDev）— https://github.com/uiverse-io/galaxy/blob/main/loaders/SmookyDev_shaggy-donkey-90.html

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type HTMLAttributes } from "react"

export interface HueWaveLoaderProps extends HTMLAttributes<HTMLDivElement> {
  bars?: number
  color?: string
  duration?: number
}

export function HueWaveLoader({
  bars = 10,
  color = "var(--destructive)",
  duration = 1.5,
  className,
  ...props
}: HueWaveLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn
  const count = Math.max(1, Math.round(bars))
  const cycle = Math.max(0.2, duration)

  return (
    <div
      {...props}
      ref={ref}
      aria-label="加载中"
      className={cn("inline-flex items-center justify-center", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="hue-wave-loader"
      role="status"
    >
      <style>{`
        @keyframes effect-ui-hue-wave {
          0% { transform: scaleY(0.2); filter: hue-rotate(90deg) blur(8px); }
          25% { transform: scaleY(0.45); filter: hue-rotate(120deg) blur(4px); }
          50% { transform: scaleY(1); filter: hue-rotate(180deg) blur(0); }
          75% { transform: scaleY(0.35); filter: hue-rotate(360deg) blur(1px); }
          100% { transform: scaleY(0.2); filter: hue-rotate(0deg) blur(0); }
        }
      `}</style>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          aria-hidden
          className="mx-1 block h-24 w-3 rounded-md"
          style={{
            backgroundColor: color,
            transformOrigin: "center",
            animation: animate ? `effect-ui-hue-wave ${cycle}s linear ${index * 0.1}s infinite` : "none",
          }}
        />
      ))}
    </div>
  )
}
