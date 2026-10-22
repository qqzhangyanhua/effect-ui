"use client"

// Ported from MosaicUI (MIT, (c) 2026 Darshan Sunil Rajadhyaksha) — https://github.com/darshan-rajadhyaksha/mosaicui/blob/2baca92/src/registry/components/section-navigator/section-navigator.tsx

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SectionEntry {
  id: string
  name: string
}

export interface SectionNavigatorProps {
  sections?: SectionEntry[]
  position?: "left" | "right" | "top" | "bottom"
  activeSectionId?: string
  onSectionClick?: (section: SectionEntry) => void
  className?: string
}

const listPosition = {
  right: "left-full top-1/2 -translate-y-1/2 origin-left",
  left: "right-full top-1/2 -translate-y-1/2 origin-right",
  top: "bottom-full left-1/2 -translate-x-1/2 origin-bottom",
  bottom: "top-full left-1/2 -translate-x-1/2 origin-top",
} as const

export function SectionNavigator({
  sections = [],
  position = "right",
  activeSectionId,
  onSectionClick,
  className,
}: SectionNavigatorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [open, setOpen] = useState(false)
  const vertical = position === "left" || position === "right"

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      data-slot="section-navigator"
      data-open={open ? "true" : "false"}
      data-position={position}
      data-motion={live && !reduced ? "on" : "off"}
      className={cn("relative inline-flex motion-reduce:transition-none", className)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        setOpen(false)
      }}
    >
      <button
        type="button"
        aria-label="Sections"
        aria-expanded={open}
        className={cn("flex gap-1.5 rounded-md p-2", vertical ? "flex-col" : "flex-row")}
        onPointerDown={() => setOpen(true)}
        onFocus={() => setOpen(true)}
      >
        {sections.map((section) => (
          <span
            key={section.id}
            className={cn("rounded-sm bg-foreground/25", vertical ? "h-0.5 w-4" : "h-4 w-0.5", section.id === activeSectionId && "bg-foreground")}
          />
        ))}
      </button>
      {open ? (
        <motion.ul
          className={cn("absolute z-10 grid max-h-80 w-56 gap-1 overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-md motion-reduce:transition-none", listPosition[position])}
          initial={false}
          animate={{ scale: 1, opacity: 1 }}
          transition={live && !reduced ? { type: "spring", stiffness: 200, damping: 15, mass: 0.8 } : { duration: 0 }}
        >
          {sections.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                className={cn(
                  "w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted",
                  section.id === activeSectionId && "bg-muted",
                )}
                onClick={() => {
                  setOpen(false)
                  onSectionClick?.(section)
                }}
              >
                {section.name}
              </button>
            </li>
          ))}
        </motion.ul>
      ) : null}
    </div>
  )
}
