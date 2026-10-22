"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/blocks.tsx. Modified for effect-ui.

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useEffect, useRef, useState, type HTMLAttributes } from "react"

export interface HoverBlocksGridProps extends HTMLAttributes<HTMLDivElement> {
  active?: readonly (readonly [number, number])[]
  blockColor?: string
  borderColor?: string
}

export function HoverBlocksGrid({
  active = [],
  blockColor = "color-mix(in oklab, var(--foreground) 12%, transparent)",
  borderColor = "color-mix(in oklab, var(--foreground) 10%, transparent)",
  className,
  ...props
}: HoverBlocksGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [box, setBox] = useState({ width: 0, height: 0 })
  const [hover, setHover] = useState<string | null>(null)
  const lit = new Set(active.map(([column, row]) => `${column}:${row}`))

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const block = box.width > 0 ? Math.max(16, box.width * 0.06) : 24
  const columns = Math.max(1, Math.floor(box.width / block))
  const rows = Math.max(1, Math.floor((box.height || 160) / block))

  return (
    <div
      {...props}
      ref={ref}
      className={cn("relative grid h-56 w-full overflow-hidden", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="hover-blocks-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns * rows }, (_, index) => {
        const column = Math.floor(index / rows)
        const row = index % rows
        const key = `${column}:${row}`
        const on = lit.has(key) || hover === key
        return (
          <div
            key={key}
            className={cn("border", reduced ? "transition-none" : "transition-colors duration-150")}
            onMouseEnter={() => setHover(key)}
            onMouseLeave={() => setHover((current) => (current === key ? null : current))}
            style={{
              borderColor,
              background: on ? blockColor : "transparent",
              height: block,
            }}
          />
        )
      })}
    </div>
  )
}
