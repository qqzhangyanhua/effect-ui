"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/spotlight-indicator.tsx

import { useEffect, useRef, useState } from "react"
import { Clock, Heart, Layers, type LucideIcon } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SpotlightIndicatorProps {
  className?: string
}

const items: { label: string; icon: LucideIcon }[] = [
  { label: "All components", icon: Layers },
  { label: "Recently viewed", icon: Clock },
  { label: "Favorites", icon: Heart },
]

export function SpotlightIndicator({ className }: SpotlightIndicatorProps) {
  const navRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(navRef)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const nav = navRef.current
    const bar = barRef.current
    const button = buttonRefs.current[active]
    if (!nav || !bar || !button) return
    const navRect = nav.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    bar.style.top = `${buttonRect.top - navRect.top + 4}px`
    bar.style.height = `${Math.max(8, buttonRect.height - 8)}px`
  }, [active])

  return (
    <div
      ref={navRef}
      data-slot="spotlight-indicator"
      data-motion={live && !reduced ? "on" : "off"}
      className={cn("relative flex w-56 flex-col gap-0.5 rounded-lg border border-border bg-card p-1.5", className)}
    >
      <span
        ref={barRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1 w-0.5 rounded-sm bg-primary motion-reduce:transition-none"
        style={{
          background: "var(--primary)",
          boxShadow: "2px 0 8px color-mix(in srgb, var(--primary) 55%, transparent)",
          transition: reduced || !live ? "none" : "top 300ms cubic-bezier(.4,0,.2,1), height 300ms cubic-bezier(.4,0,.2,1)",
        }}
      />
      {items.map(({ label, icon: Icon }, index) => (
        <button
          key={label}
          ref={(element) => {
            buttonRefs.current[index] = element
          }}
          type="button"
          aria-pressed={active === index}
          className={cn(
            "flex items-center gap-2.5 rounded-md bg-transparent px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground motion-reduce:transition-none",
            active === index && "text-foreground",
          )}
          onClick={() => setActive(index)}
        >
          <Icon className={active === index ? "text-primary" : "opacity-40"} size={15} aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
