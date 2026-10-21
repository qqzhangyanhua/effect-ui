"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/distorted-glass.tsx

import { useId, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DistortedGlassProps {
  className?: string
  children?: ReactNode
}

function filterId(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "")
  return `distorted-glass-${cleaned || "filter"}`
}

function DistortedGlass({ className, children }: DistortedGlassProps) {
  const id = filterId(useId())
  const reduced = usePrefersReducedMotion()

  return (
    <div
      data-slot="distorted-glass"
      data-reduced={reduced ? "true" : undefined}
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={reduced ? 8 : 18} />
        </filter>
      </svg>
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          filter: `url(#${id})`,
          background: "color-mix(in oklab, var(--background) 28%, transparent)",
        }}
      />
      {children}
    </div>
  )
}

export { DistortedGlass }
