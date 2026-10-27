"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CtaRibbonSwooshProps {
  title?: string
  className?: string
}

function CtaRibbonSwoosh({ title = "一条色带扫进行动面板", className }: CtaRibbonSwooshProps) {
  const reduced = usePrefersReducedMotion()
  const grainId = React.useId().replace(/:/g, "")
  const gradId = `${grainId}-grad`

  return (
    <section className={cn("relative overflow-hidden rounded-2xl border bg-background px-4 py-16", className)}>
      <style>
        {`@keyframes eu-ribbon { from { stroke-dashoffset: 760; } to { stroke-dashoffset: 0; } }`}
      </style>
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 800 280" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" x2="1" y1="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <filter id={grainId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
          </filter>
        </defs>
        <path
          d="M-20 210 C 140 210, 80 40, 240 90 S 460 230, 620 70"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="34"
          strokeLinecap="round"
          strokeDasharray="760"
          style={{
            strokeDashoffset: reduced ? 0 : 760,
            animation: reduced ? undefined : "eu-ribbon 1.6s ease forwards",
          }}
        />
        <rect width="800" height="280" filter={`url(#${grainId})`} opacity="0.18" />
      </svg>
      <div className="relative ml-auto max-w-sm rounded-2xl border bg-card/90 p-6 shadow-lg backdrop-blur">
        <h2 className="font-display text-3xl tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">色带沿路径画出来，面板上留着颗粒。</p>
        <button
          type="button"
          className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
        >
          继续
        </button>
      </div>
    </section>
  )
}

export { CtaRibbonSwoosh }
