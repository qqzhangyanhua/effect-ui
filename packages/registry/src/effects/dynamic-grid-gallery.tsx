"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/dynamic-grid-gallery.tsx

import { useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GalleryItem {
  id: string | number
  src: string
  alt?: string
  title?: string
}

function swatch(title: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="hsl(${hue} 46% 42%)"/><text x="36" y="72" fill="white" font-size="36" font-family="sans-serif">${title}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, title: "Dune Crests", alt: "Desert dunes", src: swatch("Dunes", 32) },
  { id: 2, title: "Canyon Glow", alt: "Sandstone canyon", src: swatch("Canyon", 18) },
  { id: 3, title: "Golden Monolith", alt: "Rock formations", src: swatch("Monolith", 42) },
  { id: 4, title: "Terracotta Ridges", alt: "Red rock", src: swatch("Ridges", 12) },
  { id: 5, title: "Sahara Solitude", alt: "Sand waves", src: swatch("Sahara", 36) },
  { id: 6, title: "Sedona Sunset", alt: "Desert cliffs", src: swatch("Sedona", 24) },
]

export interface DynamicGridGalleryProps {
  items?: GalleryItem[]
  color?: string
  duration?: number
  intensity?: number
  size?: number
  gap?: number
  className?: string
}

export function DynamicGridGallery({
  items = DEFAULT_GALLERY_ITEMS,
  color = "var(--foreground)",
  duration = 500,
  intensity = 1.95,
  size = 280,
  gap = 10,
  className,
}: DynamicGridGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [active, setActive] = useState<number | null>(null)
  const cells = items.slice(0, 6)
  const cols = 3
  const rows = 2
  const row = active === null ? -1 : Math.floor(active / cols)
  const col = active === null ? -1 : active % cols
  const columns =
    active === null
      ? "1fr 1fr 1fr"
      : Array.from({ length: cols }, (_, index) => (index === col ? `${intensity}fr` : "0.9fr")).join(" ")
  const rowTemplate =
    active === null
      ? "1fr 1fr"
      : Array.from({ length: rows }, (_, index) => (index === row ? `${intensity}fr` : "0.9fr")).join(" ")
  const motionMs = reduced || !live ? 0 : duration

  return (
    <div
      ref={rootRef}
      data-active={active ?? "none"}
      data-motion={live ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("w-full", className)}
      style={{ minHeight: size, color }}
      onMouseLeave={() => setActive(null)}
    >
      <div
        className="grid h-full motion-reduce:transition-none"
        style={{
          minHeight: size,
          gridTemplateColumns: columns,
          gridTemplateRows: rowTemplate,
          gap,
          transitionProperty: "grid-template-columns, grid-template-rows",
          transitionDuration: `${motionMs}ms`,
          transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {cells.map((item, index) => {
          const open = active === index
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={open}
              aria-label={item.title ?? item.alt ?? `Image ${index + 1}`}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") setActive(index)
              }}
              onFocus={() => setActive(index)}
              onBlur={() => setActive((current) => (current === index ? null : current))}
              onClick={() => setActive(index)}
              className="relative min-h-16 overflow-hidden bg-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
              style={{ boxShadow: open ? `inset 0 0 0 2px ${color}` : undefined }}
            >
              <img
                src={item.src}
                alt={item.alt ?? item.title ?? ""}
                className="absolute inset-0 h-full w-full object-cover motion-reduce:transition-none"
                style={{
                  transform: open && !reduced ? "scale(1.05)" : "scale(1)",
                  transition: `transform ${motionMs}ms ease-out`,
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--foreground)]/25 to-transparent"
                style={{ opacity: open ? 0 : 0.4 }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DynamicGridGallery
