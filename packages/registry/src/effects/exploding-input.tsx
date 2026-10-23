"use client"

// Ported from Spell UI (MIT, (c) 2025 Spell UI) — https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/exploding-input.tsx

import { useId, useRef, useState, type ChangeEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type BurstDirection = "left" | "right" | "up" | "down"

export interface ExplodingInputProps {
  color?: string
  duration?: number
  count?: number
  direction?: BurstDirection
  placeholder?: string
  label?: string
  className?: string
}

interface Chip {
  id: number
  char: string
  x: number
  dx: number
  dy: number
}

function cssName(id: string) {
  return `burst-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`
}

function burstOffset(direction: BurstDirection, index: number, total: number) {
  const spread = (index - (total - 1) / 2) * 28
  if (direction === "left") return { dx: -72, dy: spread }
  if (direction === "right") return { dx: 72, dy: spread }
  if (direction === "down") return { dx: spread, dy: 64 }
  return { dx: spread, dy: -72 }
}

export function ExplodingInput({
  color = "var(--primary)",
  duration = 1800,
  count = 3,
  direction = "up",
  placeholder = "Type to burst",
  label = "Exploding input",
  className,
}: ExplodingInputProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const seq = useRef(0)
  const [chips, setChips] = useState<Chip[]>([])
  const animation = cssName(useId())
  const amount = Math.max(1, Math.min(8, Math.round(count)))
  const moving = live && !reduced

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    const typed = value.slice(-1) || "•"
    const x = Math.min(value.length, 18) * 9 + 12
    const next: Chip[] = []
    for (let index = 0; index < amount; index += 1) {
      seq.current += 1
      const offset = burstOffset(direction, index, amount)
      next.push({ id: seq.current, char: typed, x, dx: offset.dx, dy: offset.dy })
    }
    setChips((current) => [...current, ...next].slice(-24))
  }

  return (
    <div ref={rootRef} className={cn("relative w-full max-w-sm", className)}>
      <style>
        {`@keyframes ${animation} {
          70% { transform: translate(var(--dx), var(--dy)); opacity: 1; }
          100% { transform: translate(var(--dx), calc(var(--dy) + 28px)); opacity: 0; }
        }`}
      </style>
      <input
        aria-label={label}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
        {chips.map((chip) => (
          <span
            key={chip.id}
            data-chip=""
            className="absolute top-2 text-sm font-medium motion-reduce:animate-none"
            style={{
              left: `${chip.x}px`,
              color,
              ["--dx" as string]: `${chip.dx}px`,
              ["--dy" as string]: `${chip.dy}px`,
              animationName: moving ? animation : "none",
              animationDuration: `${Math.max(200, duration)}ms`,
              animationTimingFunction: "ease-out",
              animationFillMode: "forwards",
              animationPlayState: moving ? "running" : "paused",
            }}
          >
            {chip.char}
          </span>
        ))}
      </div>
    </div>
  )
}
