"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FooterGiantWordmarkProps {
  word?: string
  note?: string
  className?: string
}

function FooterGiantWordmark({
  word = "effect-ui",
  note = "灵感来自巨型字标光标描边，原创实现。指针靠近时点亮描边。",
  className,
}: FooterGiantWordmarkProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const glowRef = React.useRef<SVGCircleElement>(null)
  const reactId = React.useId().replace(/:/g, "")
  const glowId = `${reactId}-glow`
  const maskId = `${reactId}-mask`

  const onMove = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced) return
    const box = ref.current?.getBoundingClientRect()
    const glow = glowRef.current
    if (!box || !glow) return
    glow.setAttribute("cx", String(event.clientX - box.left))
    glow.setAttribute("cy", String(event.clientY - box.top))
  }

  return (
    <footer
      ref={ref}
      onPointerMove={onMove}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-zinc-950 px-6 py-12 text-white",
        className,
      )}
    >
      <p className="text-xs tracking-[0.28em] text-white/40 uppercase">Giant wordmark</p>
      <svg
        viewBox="0 0 800 180"
        className="mt-4 h-32 w-full"
        role="img"
        aria-label={word}
      >
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <mask id={maskId}>
            <rect width="800" height="180" fill="black" />
            <text
              x="50%"
              y="62%"
              textAnchor="middle"
              fill="none"
              stroke="white"
              strokeWidth="3"
              fontSize="92"
              fontWeight="700"
              fontFamily="var(--font-display), serif"
            >
              {word}
            </text>
          </mask>
        </defs>
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="2.5"
          fontSize="92"
          fontWeight="700"
          fontFamily="var(--font-display), serif"
        >
          {word}
        </text>
        <circle
          ref={glowRef}
          cx="400"
          cy="90"
          r={reduced ? "0" : "120"}
          fill={`url(#${glowId})`}
          mask={`url(#${maskId})`}
        />
      </svg>
      <p className="mt-2 text-sm text-white/50">{note}</p>
    </footer>
  )
}

export { FooterGiantWordmark }
