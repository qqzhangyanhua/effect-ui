"use client"

// Ported from Spell UI (MIT, (c) 2025 Spell UI) — https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/logos-carousel.tsx

import { Children, useEffect, useId, useRef, useState, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LogosCarouselProps {
  children?: ReactNode
  color?: string
  duration?: number
  interval?: number
  count?: number
  className?: string
}

function cssName(id: string, kind: "enter" | "exit") {
  return `logos-${kind}-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

export function LogosCarousel({
  children,
  color = "var(--foreground)",
  duration = 600,
  interval = 2500,
  count = 3,
  className,
}: LogosCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const reactId = useId()
  const enter = cssName(reactId, "enter")
  const exit = cssName(reactId, "exit")
  const nodes = Children.toArray(children)
  const perGroup = Math.max(1, Math.round(count))
  const groups = Array.from({ length: Math.ceil(nodes.length / perGroup) }, (_, groupIndex) =>
    nodes.slice(groupIndex * perGroup, groupIndex * perGroup + perGroup),
  )
  const [index, setIndex] = useState(0)
  const safeIndex = groups.length === 0 ? 0 : (reduced ? 0 : index % groups.length)
  const moving = live && !reduced && groups.length > 1

  useEffect(() => {
    if (!moving) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % groups.length)
    }, Math.max(400, interval))
    return () => window.clearInterval(timer)
  }, [moving, interval, groups.length])

  if (groups.length === 0) {
    return <div className={cn("text-sm text-muted-foreground", className)}>No logos</div>
  }

  const next = (safeIndex + 1) % groups.length

  return (
    <div ref={rootRef} className={cn("grid w-full max-w-xl place-items-center", className)} aria-label="Logo carousel">
      <style>
        {`@keyframes ${enter} { from { transform: translateY(28px); filter: blur(4px); opacity: 0; } to { transform: none; filter: none; opacity: 1; } }
          @keyframes ${exit} { from { transform: none; filter: none; opacity: 1; } to { transform: translateY(-28px); filter: blur(4px); opacity: 0; } }`}
      </style>
      {groups.map((group, groupIndex) => {
        const current = groupIndex === safeIndex
        const incoming = moving && groupIndex === next
        if (!current && !incoming) return null
        return (
          <div key={groupIndex} className="flex w-full items-center justify-center gap-8" style={{ gridArea: "1 / 1" }}>
            {group.map((logo, logoIndex) => (
              <div
                key={logoIndex}
                className="text-lg font-semibold tracking-wide motion-reduce:animate-none"
                style={{
                  color,
                  animationName: moving ? (current ? exit : enter) : "none",
                  animationDuration: `${duration}ms`,
                  animationDelay: `${logoIndex * 0.12}s`,
                  animationFillMode: "both",
                  animationTimingFunction: "ease",
                  animationPlayState: moving ? "running" : "paused",
                }}
              >
                {logo}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
