"use client"

// Ported from daisyUI（MIT，(c) 2020 Pouya Saadeghi）— https://github.com/saadeghi/daisyui/blob/main/packages/daisyui/src/components/indicator.css. Modified for effect-ui.

import type { HTMLAttributes, ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CornerIndicatorItem {
  label?: ReactNode
  children?: ReactNode
  vertical?: "top" | "middle" | "bottom"
  horizontal?: "start" | "center" | "end"
}

export interface CornerIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  items?: CornerIndicatorItem[]
  children?: ReactNode
}

const places = `
[data-slot="corner-indicator"] [data-part="item"] { position: absolute; z-index: 1; white-space: nowrap; }
[data-slot="corner-indicator"] [data-vertical="top"] { top: 0; bottom: auto; --indicator-y: -50%; }
[data-slot="corner-indicator"] [data-vertical="middle"] { top: 50%; bottom: auto; --indicator-y: -50%; }
[data-slot="corner-indicator"] [data-vertical="bottom"] { top: auto; bottom: 0; --indicator-y: 50%; }
[data-slot="corner-indicator"] [data-horizontal="start"] { left: 0; right: auto; --indicator-x: -50%; }
[data-slot="corner-indicator"] [data-horizontal="center"] { left: 50%; right: auto; --indicator-x: -50%; }
[data-slot="corner-indicator"] [data-horizontal="end"] { left: auto; right: 0; --indicator-x: 50%; }
[dir="rtl"] [data-slot="corner-indicator"] [data-horizontal="start"] { left: auto; right: 0; --indicator-x: 50%; }
[dir="rtl"] [data-slot="corner-indicator"] [data-horizontal="end"] { left: 0; right: auto; --indicator-x: -50%; }
[dir="rtl"] [data-slot="corner-indicator"] [data-horizontal="center"] { left: auto; right: 50%; --indicator-x: 50%; }
[data-slot="corner-indicator"] [data-part="item"] { translate: var(--indicator-x) var(--indicator-y); }
`

export function CornerIndicator({ items = [], children, className, ...props }: CornerIndicatorProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div {...props} className={cn("relative inline-flex w-max", className)} data-reduced={reduced ? "true" : "false"} data-slot="corner-indicator">
      <style>{places}</style>
      {children}
      {items.map((item, index) => {
        const vertical = item.vertical ?? "top"
        const horizontal = item.horizontal ?? "end"
        return (
          <span key={`${vertical}-${horizontal}-${index}`} className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground" data-horizontal={horizontal} data-part="item" data-vertical={vertical}>
            {item.children ?? item.label}
          </span>
        )
      })}
    </div>
  )
}
