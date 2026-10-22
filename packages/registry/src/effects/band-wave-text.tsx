"use client"

// Ported from Spell UI (MIT, (c) 2025 Spell UI) — https://github.com/xxtomm/spell-ui/blob/main/registry/spell-ui/gradient-wave-text.tsx

import { useEffect, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BandWaveTextProps {
  children?: ReactNode
  color?: string
  speed?: number
  count?: number
  fontSize?: number
  align?: "left" | "center" | "right"
  loop?: boolean
  className?: string
}

function bandStops(count: number, color: string) {
  const palette = ["var(--primary)", "var(--accent)", "var(--destructive)", "var(--ring)", "var(--muted-foreground)"]
  const bands = Math.max(2, Math.min(8, Math.round(count)))
  const stops = [`${color} calc((var(--gi) + 0) * 1%)`]
  for (let index = 0; index < bands; index += 1) {
    const ink = palette[index % palette.length] ?? color
    stops.push(`${ink} calc((var(--gi) + ${(index + 1) * 8}) * 1%)`)
  }
  stops.push(`${color} calc((var(--gi) + ${(bands + 2) * 8}) * 1%)`)
  return stops.join(", ")
}

export function BandWaveText({
  children = "Band wave",
  color = "var(--foreground)",
  speed = 1,
  count = 6,
  fontSize = 56,
  align = "center",
  loop = true,
  className,
}: BandWaveTextProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const stops = bandStops(count, color)

  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    if (reduced) {
      node.style.setProperty("--gi", "40")
      return
    }
    if (!live) return
    let value = Number(node.style.getPropertyValue("--gi"))
    if (!Number.isFinite(value)) value = 40
    let last = 0
    let frame = 0
    const tick = (now: number) => {
      if (last === 0) last = now
      const delta = Math.min(64, now - last)
      last = now
      value += (delta * speed) / 16.67
      if (loop) value = ((value % 160) + 160) % 160
      else value = Math.min(160, value)
      node.style.setProperty("--gi", value.toFixed(2))
      if (loop || value < 160) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [live, reduced, speed, loop])

  const justify = align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"

  return (
    <div
      ref={rootRef}
      className={cn("flex w-full motion-reduce:transform-none", justify, className)}
      style={{ ["--gi" as string]: "40" }}
    >
      <span
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.05,
          fontWeight: 650,
          textAlign: align,
          backgroundImage: `radial-gradient(circle at 50% 120%, ${stops})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          paddingBottom: "0.2em",
        }}
      >
        {children}
      </span>
    </div>
  )
}
