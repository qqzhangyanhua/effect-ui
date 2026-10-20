"use client"

import { motion } from "motion/react"

import { NumberFlow } from "@/components/ui/number-flow"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ReactionItem {
  emoji: string
  count: number
  active?: boolean
}

export interface ReactionBarProps {
  items: readonly ReactionItem[]
  onToggle: (emoji: string) => void
  className?: string
}

function ReactionBar({ items, onToggle, className }: ReactionBarProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <div data-slot="reaction-bar" className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <motion.button
          key={item.emoji}
          type="button"
          aria-pressed={Boolean(item.active)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary",
            item.active && "border-primary bg-primary/10",
          )}
          animate={reduced || !item.active ? { scale: 1 } : { scale: [1, 1.18, 1] }}
          transition={reduced ? { duration: 0 } : { duration: 0.28 }}
          onClick={() => onToggle(item.emoji)}
        >
          <span aria-hidden>{item.emoji}</span>
          <NumberFlow value={item.count} />
          <span className="sr-only">{item.active ? "已反应" : "反应"}</span>
        </motion.button>
      ))}
    </div>
  )
}

export { ReactionBar }
