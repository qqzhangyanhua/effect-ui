"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/gap-pattern.tsx. Modified for effect-ui.

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import type { HTMLAttributes } from "react"

export interface HatchDividerProps extends HTMLAttributes<HTMLDivElement> {
  stripe?: string
}

export function HatchDivider({ stripe = "var(--border)", className, ...props }: HatchDividerProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <div
      {...props}
      aria-hidden
      className={cn("h-6 w-full border-y bg-card", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="hatch-divider"
      style={{
        backgroundImage: `repeating-linear-gradient(135deg, ${stripe} 0px 1px, transparent 1px 10px)`,
      }}
    />
  )
}
