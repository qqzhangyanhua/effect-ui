"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author vikramsinghnegi）— https://github.com/uiverse-io/galaxy/blob/main/loaders/vikramsinghnegi_witty-skunk-89.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MapPinLoaderProps extends HTMLAttributes<HTMLDivElement> {
  color?: string
  duration?: number
}

export function MapPinLoader({ color = "var(--foreground)", duration = 1, className, ...props }: MapPinLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const cycle = Math.max(0.2, duration)

  return (
    <div {...props} ref={ref} aria-label="加载中" className={cn("relative inline-block size-12", className)} data-reduced={reduced ? "true" : "false"} data-slot="map-pin-loader" role="status">
      <style>{"@keyframes map-pin-loader-bob { 0%, 100% { top: 0; } 50% { top: -5px; } }"}</style>
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 size-5 -translate-x-1/2 rotate-[-46deg] rounded-[100%_100%_100%_0] border-2"
        style={{
          borderColor: color,
          marginTop: 20,
          animation: active ? `map-pin-loader-bob ${cycle}s linear infinite` : "none",
        }}
      />
      <span aria-hidden className="absolute top-1/2 left-1/2 h-5 w-7 -translate-x-1/2 rounded-full opacity-30" style={{ backgroundColor: color, marginTop: 15 }} />
    </div>
  )
}
