"use client"

import { useState, type CSSProperties, type PointerEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HoverLiftGlowProps {
  lift?: number
  glow?: number
  duration?: number
  className?: string
  children?: ReactNode
}

function ring(glow: number) {
  const edge = Math.round(Math.min(glow, 2) * 46)
  const bloom = Math.round(Math.min(glow, 2) * 32)
  const blur = Math.round(28 * glow)
  return `0 0 0 1px color-mix(in oklab, var(--primary) ${edge}%, transparent), 0 18px ${blur}px -14px color-mix(in oklab, var(--primary) ${bloom}%, transparent)`
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches
}

export function HoverLiftGlow({ lift = 8, glow = 1, duration = 280, className, children }: HoverLiftGlowProps) {
  const reduced = usePrefersReducedMotion()
  const [hot, setHot] = useState(false)
  const [pressed, setPressed] = useState(false)
  const rise = reduced ? 0 : lift
  const halo = ring(reduced ? 0 : glow)

  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType === "touch" || coarsePointer()) return
    setHot(true)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced) return
    if (event.pointerType === "touch" || coarsePointer()) setPressed(true)
  }

  const raised = !reduced && hot
  const squashed = !reduced && pressed && !hot

  return (
    <div
      data-slot="hover-lift-glow"
      data-motion={reduced ? "off" : "on"}
      data-raised={raised ? "true" : "false"}
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-[transform,box-shadow] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:translate-y-0",
        !reduced &&
          "pointer-fine:hover:-translate-y-[var(--lift)] pointer-fine:hover:[box-shadow:var(--glow-ring)] focus-within:-translate-y-[var(--lift)] focus-within:[box-shadow:var(--glow-ring)] pointer-coarse:active:scale-[0.985] pointer-coarse:focus-visible:outline pointer-coarse:focus-visible:outline-2 pointer-coarse:focus-visible:outline-offset-2 pointer-coarse:focus-visible:outline-ring",
        className,
      )}
      style={
        {
          "--lift": `${rise}px`,
          "--glow-ring": halo,
          transitionDuration: `${reduced ? 0 : duration}ms`,
          transform: raised ? `translateY(-${lift}px)` : squashed ? "scale(0.985)" : undefined,
          boxShadow: raised ? halo : undefined,
        } as CSSProperties
      }
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => {
        setHot(false)
        setPressed(false)
      }}
      onPointerDown={onPointerDown}
      onPointerUp={() => setPressed(false)}
      onFocus={() => {
        if (!reduced && !coarsePointer()) setHot(true)
      }}
      onBlur={() => setHot(false)}
    >
      {children}
    </div>
  )
}
