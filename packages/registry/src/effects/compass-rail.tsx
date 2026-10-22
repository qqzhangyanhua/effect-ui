"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/compass-rail.tsx

import { useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CompassRailItem {
  id: string
  label: string
}

export interface CompassRailProps {
  items: CompassRailItem[]
  className?: string
  color?: string
}

export function CompassRail({ items, className, color = "var(--primary)" }: CompassRailProps) {
  const rootRef = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [active, setActive] = useState(items[0]?.id)
  const [heading, setHeading] = useState(0)
  const index = Math.max(0, items.findIndex((item) => item.id === active))

  const select = (id: string, nextIndex: number) => {
    const target = nextIndex * 45
    const delta = ((target - heading + 540) % 360) - 180
    setHeading((current) => current + delta)
    setActive(id)
  }

  return (
    <nav ref={rootRef} className={cn("relative w-44", className)} aria-label="Compass rail" data-motion={live && !reduced ? "on" : "off"}>
      <div className="absolute top-2 bottom-2 left-[15px] w-px bg-border" />
      <ul className="relative space-y-1">
        {items.map((item, itemIndex) => {
          const selected = item.id === active
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => select(item.id, itemIndex)}
                className={cn("flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm", selected ? "text-foreground" : "text-muted-foreground")}
                aria-current={selected ? "page" : undefined}
              >
                <span className={cn("relative z-10 flex size-4 items-center justify-center rounded-full border", selected ? "border-primary bg-primary" : "border-border bg-card")}>
                  {selected ? (
                    <span
                      className="border-x-[3px] border-b-[6px] border-x-transparent motion-reduce:transition-none"
                      style={{
                        borderBottomColor: "var(--primary-foreground)",
                        background: color,
                        transform: `rotate(${heading}deg)`,
                        transition: live && !reduced ? "transform 420ms cubic-bezier(.34,1.4,.64,1)" : undefined,
                      }}
                    />
                  ) : null}
                </span>
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
      <span className="sr-only">Marker at step {index + 1}</span>
    </nav>
  )
}
