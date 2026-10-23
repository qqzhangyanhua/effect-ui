"use client"

// Ported from MosaicUI (MIT, (c) 2026 Darshan Sunil Rajadhyaksha) — https://github.com/darshan-rajadhyaksha/mosaicui/blob/2baca92/src/registry/components/arc-cards/arc-cards.tsx

import { useRef, useState, type FocusEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ArcCardItem {
  id: string
  title: string
  detail: string
}

export interface ArcCardsProps {
  items?: ArcCardItem[]
  color?: string
  intensity?: number
  angle?: number
  speed?: number
  size?: number
  className?: string
}

export function ArcCards({
  items = [],
  color = "var(--primary)",
  intensity = 48,
  angle = 18,
  speed = 1,
  size = 220,
  className,
}: ArcCardsProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [open, setOpen] = useState(false)
  const center = Math.floor(items.length / 2)
  const motionOn = live && !reduced
  const transition = motionOn
    ? { type: "spring" as const, stiffness: 200 * speed, damping: 15, mass: 0.5 }
    : { duration: 0 }

  const openFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      setOpen(true)
      return
    }
    setOpen((value) => !value)
  }

  const closeIfLeft = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      role="group"
      tabIndex={0}
      aria-label="Arc cards"
      data-slot="arc-cards"
      data-open={open ? "true" : "false"}
      data-motion={motionOn ? "on" : "off"}
      className={cn("relative outline-none motion-reduce:transition-none", className)}
      style={{ width: size, height: Math.round(size * 1.2) }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false)
      }}
      onPointerDown={openFromPointer}
      onFocus={() => setOpen(true)}
      onBlur={closeIfLeft}
    >
      {items.map((item, index) => {
        const position = index - center
        const distance = Math.abs(position)
        return (
          <motion.div
            key={item.id}
            className="absolute inset-0 overflow-hidden rounded-2xl border border-border motion-reduce:transition-none"
            style={{ zIndex: items.length - distance, transformOrigin: "50% bottom" }}
            initial={false}
            animate={{
              x: open ? intensity * position : 0,
              rotate: open ? angle * position : 0,
              scale: open ? 1.05 - distance * 0.125 : 1,
              filter: `blur(${open ? 0 : 0.5 * distance}px)`,
            }}
            transition={transition}
          >
            <div
              className="flex h-full flex-col justify-end p-4 text-card-foreground"
              style={{ background: `color-mix(in srgb, ${color} ${18 + index * 14}%, var(--card))` }}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
