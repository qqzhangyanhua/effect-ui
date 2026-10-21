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
  /** 扇出过渡，毫秒。不传或 300 仍是 duration-300。 */
  duration?: number
  /** 扇开时每张的转角。不传或 14 仍是 14°。 */
  angle?: number
  /** 扇开抬升倍率。不传或 1 时中心仍抬起 6.5rem。 */
  intensity?: number
}

const defaultCards: FolderCard[] = [
  { title: "Hero", tint: "#7c3aed" },
  { title: "Pricing", tint: "#22d3ee" },
  { title: "Footer", tint: "#f472b6" },
]

function FolderReveal({ label = "Sections", cards = defaultCards, className, duration, angle, intensity }: FolderRevealProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = React.useState(false)
  const ms = duration === undefined || duration === 300 ? 300 : duration
  const fan = angle === undefined || angle === 14 ? 14 : angle
  const lift = intensity === undefined || intensity === 1 ? 6.5 : 6.5 * intensity
  const timed = !reduced && ms === 300

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
          timed && "transition-transform duration-300",
          !reduced && !timed && "transition-transform",
        )}
        style={{
          transform: open ? "rotateX(-50deg)" : "none",
          transitionDuration: reduced || timed ? undefined : `${ms}ms`,
        }}
      />
      <p className="absolute bottom-4 left-4 text-sm font-medium text-amber-950">{label}</p>
      {cards.map((card, index) => {
        const spread = index - (cards.length - 1) / 2
        return (
          <div
            key={card.title}
            className={cn(
              "absolute bottom-10 left-1/2 h-24 w-28 rounded-lg border border-white/30 p-3 text-sm text-white shadow-lg",
              timed && "transition-transform duration-300",
              !reduced && !timed && "transition-transform",
            )}
            style={{
              background: card.tint,
              zIndex: open ? index + 1 : cards.length - index,
              transitionDuration: reduced || timed ? undefined : `${ms}ms`,
              transform: open
                ? `translate(calc(-50% + ${spread * 5.25}rem), ${-lift - Math.abs(spread) * 0.15}rem) rotate(${spread * fan}deg)`
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
