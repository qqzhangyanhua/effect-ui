"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ElectricBorderProps {
  className?: string
  color?: string
  speed?: number
  scale?: number
  intensity?: number
  children?: React.ReactNode
}

function ElectricBorder({
  className,
  color = "#67e8f9",
  speed,
  scale,
  intensity,
  children,
}: ElectricBorderProps) {
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const active = useAnimationActive(hostRef)
  const rawId = React.useId()
  const filterId = `electric-${rawId.replace(/:/g, "")}`
  const turbulenceRef = React.useRef<SVGFETurbulenceElement>(null)
  const rate = speed === undefined || speed === 1 ? 1 : speed
  const shift = scale === undefined || scale === 1 ? 14 : 14 * scale
  const glow = intensity === undefined || intensity === 1 ? 8 : 8 * intensity

  React.useEffect(() => {
    if (reduced || !active) return
    const node = turbulenceRef.current
    if (!node) return
    let frame = 0
    const started = performance.now()
    const tick = (now: number) => {
      const t = (now - started) / 1000
      const x = 0.008 + Math.sin(t * 3.1 * rate) * 0.006
      const y = 0.035 + Math.cos(t * 4.4 * rate) * 0.02
      node.setAttribute("baseFrequency", `${x} ${y}`)
      node.setAttribute("seed", String(Math.floor(t * 8 * rate) % 8))
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [reduced, active, rate])

  return (
    <div
      ref={hostRef}
      data-slot="electric-border"
      className={cn("relative overflow-visible rounded-2xl bg-zinc-950 text-white", className)}
      style={{ color }}
    >
      <svg className="pointer-events-none absolute -inset-3 size-[calc(100%+1.5rem)]" aria-hidden>
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              ref={turbulenceRef}
              type="turbulence"
              baseFrequency="0.01 0.04"
              numOctaves={2}
              seed={2}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={shift} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <rect
          x="8%"
          y="10%"
          width="84%"
          height="80%"
          rx="18"
          fill="none"
          stroke={color}
          strokeWidth="3"
          filter={`url(#${filterId})`}
          style={{ filter: `drop-shadow(0 0 ${glow}px ${color})` }}
        />
      </svg>
      <div className="relative z-10 px-8 py-10">
        {children ?? (
          <div className="text-center">
            <p className="text-xs tracking-[0.28em] text-cyan-100/70">BORDER</p>
            <p className="mt-2 font-display text-3xl">Crackling edge</p>
          </div>
        )}
      </div>
    </div>
  )
}

export { ElectricBorder }
