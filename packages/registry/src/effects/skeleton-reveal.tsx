"use client"

// Copyright Spectrum UI (Made by Arihant)
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: 脉冲同时受 use-prefers-reduced-motion 和离开视口控制，CSS 仍保留 prefers-reduced-motion 媒体查询。嵌入的骨架过渡来自 transitions.dev（Jakub Antalík）。
// Ported from Spectrum UI（Apache-2.0，Made by Arihant）— https://github.com/arihantcodes/spectrum-ui/blob/main/components/spectrumui/skeleton-reveal.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react"

export interface SkeletonRevealProps {
  loading: boolean
  skeleton: ReactNode
  children: ReactNode
  pulseCount?: number
  pulseDuration?: number
  revealDuration?: number
  className?: string
}

const CSS = `
[data-slot="skeleton-reveal"]{position:relative}
[data-slot="skeleton-reveal"] .skel-layer{position:absolute;inset:0;z-index:1;opacity:1;filter:blur(0);transition:opacity var(--reveal-dur) var(--reveal-ease),filter var(--reveal-dur) var(--reveal-ease)}
[data-slot="skeleton-reveal"] .skel-content{position:relative;z-index:2;opacity:0;filter:blur(var(--reveal-blur));transition:opacity var(--reveal-dur) var(--reveal-ease),filter var(--reveal-dur) var(--reveal-ease)}
[data-slot="skeleton-reveal"].is-revealed .skel-layer{opacity:0;filter:blur(var(--reveal-blur))}
[data-slot="skeleton-reveal"].is-revealed .skel-content{opacity:1;filter:blur(0)}
[data-slot="skeleton-reveal"].is-resetting .skel-layer,[data-slot="skeleton-reveal"].is-resetting .skel-content{transition:none !important}
[data-slot="skeleton-reveal"][data-motion="on"] .skel-layer.is-pulsing > *{animation:skel-pulse var(--pulse-dur) ease-in-out var(--pulse-count)}
@keyframes skel-pulse{0%,100%{opacity:1}50%{opacity:var(--pulse-min)}}
@media (prefers-reduced-motion: reduce){[data-slot="skeleton-reveal"] .skel-layer,[data-slot="skeleton-reveal"] .skel-content{transition:none !important}}
`

export function SkeletonReveal({
  loading,
  skeleton,
  children,
  pulseCount = 1,
  pulseDuration = 1000,
  revealDuration = 400,
  className,
}: SkeletonRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const wasLoading = useRef(loading)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (loading && !wasLoading.current) {
      el.classList.add("is-resetting")
      void el.offsetWidth
      el.classList.remove("is-resetting")
    }
    wasLoading.current = loading
  }, [loading])

  return (
    <>
      <style>{CSS}</style>
      <div
        ref={ref}
        data-slot="skeleton-reveal"
        data-reduced={prefersReducedMotion ? "true" : "false"}
        data-motion={animate ? "on" : "off"}
        className={cn(!loading && "is-revealed", className)}
        aria-busy={loading || undefined}
        style={
          {
            "--pulse-dur": `${pulseDuration}ms`,
            "--pulse-count": pulseCount,
            "--pulse-min": 0.5,
            "--reveal-dur": prefersReducedMotion ? "0ms" : `${revealDuration}ms`,
            "--reveal-blur": "2px",
            "--reveal-ease": "ease-in-out",
          } as CSSProperties
        }
      >
        <div className={cn("skel-layer", loading && animate && "is-pulsing")} aria-hidden>
          {skeleton}
        </div>
        <div className="skel-content">{children}</div>
      </div>
    </>
  )
}
