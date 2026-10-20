"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FolderCard {
  title: string
  tint: string
}

export interface FolderRevealProps {
  label?: string
  cards?: FolderCard[]
  className?: string
}

const defaultCards: FolderCard[] = [
  { title: "Hero", tint: "#7c3aed" },
  { title: "Pricing", tint: "#22d3ee" },
  { title: "Footer", tint: "#f472b6" },
]

function FolderReveal({ label = "Sections", cards = defaultCards, className }: FolderRevealProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)

  return (
    <div
      tabIndex={0}
      data-open={open ? "true" : "false"}
      className={cn("relative mx-auto h-80 w-80 outline-none", className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <div className="absolute bottom-0 h-36 w-full rounded-xl bg-amber-200 shadow-md" />
      <div
        className={cn(
          "absolute bottom-32 left-0 h-8 w-24 origin-bottom rounded-t-lg bg-amber-300",
          reduced ? "" : "transition-transform duration-300",
        )}
        style={{ transform: open ? "rotateX(-50deg)" : "none" }}
      />
      <p className="absolute bottom-4 left-4 text-sm font-medium text-amber-950">{label}</p>
      {cards.map((card, index) => {
        const spread = index - (cards.length - 1) / 2
        return (
          <div
            key={card.title}
            className={cn(
              "absolute bottom-10 left-1/2 h-24 w-28 rounded-lg border border-white/30 p-3 text-sm text-white shadow-lg",
              reduced ? "" : "transition-transform duration-300",
            )}
            style={{
              background: card.tint,
              zIndex: open ? index + 1 : cards.length - index,
              transform: open
                ? `translate(calc(-50% + ${spread * 5.25}rem), ${-6.5 - Math.abs(spread) * 0.15}rem) rotate(${spread * 14}deg)`
                : `translate(calc(-50% + ${spread * 0.35}rem), ${-index * 0.4}rem) rotate(${spread * 4}deg)`,
            }}
          >
            <span className="block">{card.title}</span>
          </div>
        )
      })}
    </div>
  )
}

export { FolderReveal }
