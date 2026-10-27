"use client"

import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ReactionItem {
  emoji: string
  count: number
  active?: boolean
}

export interface ReactionBarProps {
  items: readonly ReactionItem[]
  onToggle: (emoji: string) => void
  className?: string
  duration?: number
  scale?: number
  gap?: number
  color?: string
}

function ReactionBar({ items, onToggle, className, duration, scale, gap, color }: ReactionBarProps) {
  const reduced = usePrefersReducedMotion()
  const keepGap = gap === undefined || gap === 8

  return (
    <div
      data-slot="reaction-bar"
      className={cn("flex flex-wrap", keepGap && "gap-2", className)}
      style={gap === undefined || gap === 8 ? undefined : { gap }}
    >
      {items.map((item) => (
        <motion.button
          key={item.emoji}
          type="button"
          aria-pressed={Boolean(item.active)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary",
            item.active && !color && "border-primary bg-primary/10",
          )}
          style={
            item.active && color
              ? {
                  borderColor: color,
                  backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)`,
                }
              : undefined
          }
          animate={
            reduced || !item.active
              ? { scale: 1 }
              : { scale: scale === undefined || scale === 1 ? [1, 1.18, 1] : [1, 1 + 0.18 * scale, 1] }
          }
          transition={
            reduced
              ? { duration: 0 }
              : duration === undefined || duration === 280
                ? { duration: 0.28 }
                : { duration: duration / 1000 }
          }
          onClick={() => onToggle(item.emoji)}
        >
          <span aria-hidden>{item.emoji}</span>
          <span>{item.count}</span>
          <span className="sr-only">{item.active ? "已反应" : "反应"}</span>
        </motion.button>
      ))}
    </div>
  )
}

export { ReactionBar }
