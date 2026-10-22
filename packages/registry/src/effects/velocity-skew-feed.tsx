"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/scroll/velocity-skew-feed.tsx

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface VelocitySkewFeedProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: ReactNode[]
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  size?: number
  label?: string
}

function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v
}

export function VelocitySkewFeed({
  items,
  color = "var(--primary)",
  duration = 1000,
  intensity = 6.5,
  speed = 1,
  size = 420,
  label = "Activity feed. Scroll quickly to see the cards react to speed.",
  className,
  ...props
}: VelocitySkewFeedProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced

  useEffect(() => {
    if (reduced) {
      for (const card of cardRefs.current) {
        if (card) card.style.removeProperty("transform")
      }
      return
    }
    const scroller = scrollerRef.current
    if (!scroller || !moving) return
    let raf = 0
    let last = 0
    let lastPos = scroller.scrollTop
    let velocity = 0
    let skew = 0
    let skewV = 0
    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016
      last = now
      const pos = scroller.scrollTop
      const instant = (pos - lastPos) / dt
      lastPos = pos
      velocity += (instant - velocity) * (1 - Math.exp(-12 * dt))
      const maxSkew = clamp(intensity, 0, 24)
      const target = clamp(velocity * 0.0035 * speed, -maxSkew, maxSkew)
      const stiffness = 90000 / Math.max(200, duration)
      skewV += (stiffness * (target - skew) - 14 * skewV) * dt
      skew += skewV * dt
      const transform = `skewY(${skew.toFixed(3)}deg) scaleY(${(1 + Math.abs(skew) * 0.008).toFixed(4)})`
      for (const card of cardRefs.current) {
        if (card) card.style.transform = transform
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [duration, intensity, moving, reduced, speed])

  return (
    <div ref={rootRef} data-motion={moving ? "on" : "off"} className={cn("w-full motion-reduce:animate-none", className)} {...props}>
      <div className="relative overflow-hidden rounded-xl border border-border" style={{ height: size, borderColor: color }}>
        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-label={label}
          className="h-full overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-col gap-2.5 p-4">
            {items.map((item, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node
                }}
                className="origin-center rounded-lg border border-border bg-card p-4 text-foreground"
                style={{ boxShadow: `inset 3px 0 0 ${color}` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
