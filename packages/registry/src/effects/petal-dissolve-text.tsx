"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PetalDissolveTextProps {
  text?: string
  className?: string
}

const COLORS = ["#fb7185", "#fda4af", "#f9a8d4", "#fecdd3", "#f472b6", "#ffe4e6"]

function petalsFor(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2
    const distance = 70 + (index % 5) * 22
    return {
      id: index,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance * 0.72,
      rot: (index * 47) % 80 - 40,
      color: COLORS[index % COLORS.length] ?? COLORS[0],
      delay: (index % 6) * 40,
    }
  })
}

function PetalDissolveText({ text = "花瓣散开", className }: PetalDissolveTextProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const petals = petalsFor(16)

  return (
    <div data-slot="petal-dissolve-text" className={cn("w-full space-y-3", className)}>
      <button
        type="button"
        aria-pressed={open}
        className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "聚回文字" : "散成花瓣"}
      </button>
      <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-xl border">
        <p
          className={cn("font-display text-4xl tracking-wide", open ? "opacity-0" : "opacity-100")}
          style={{ transition: reduced ? "none" : "opacity 280ms ease" }}
        >
          {text}
        </p>
        {open
          ? petals.map((petal) => (
              <span
                key={petal.id}
                aria-hidden
                className="absolute top-1/2 left-1/2 h-3 w-5 rounded-[100%_0_100%_0]"
                style={{
                  background: petal.color,
                  ["--dx" as string]: `${petal.dx}px`,
                  ["--dy" as string]: `${petal.dy}px`,
                  ["--rot" as string]: `${petal.rot}deg`,
                  animation: reduced ? "none" : `effect-ui-petal 700ms ${petal.delay}ms both`,
                  transform: reduced
                    ? `translate(calc(-50% + ${petal.dx}px), calc(-50% + ${petal.dy}px)) rotate(${petal.rot}deg)`
                    : undefined,
                }}
              />
            ))
          : null}
      </div>
      <style>{`@keyframes effect-ui-petal { from { transform: translate(-50%, -50%) scale(0.3) rotate(0deg); opacity: 0; } to { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1); opacity: 1; } }`}</style>
    </div>
  )
}

export { PetalDissolveText }
