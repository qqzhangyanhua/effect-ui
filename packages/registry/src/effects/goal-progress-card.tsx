"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/goal-progress-card.tsx

import { useRef, useState } from "react"
import { motion } from "motion/react"
import { Check, Plus } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GoalProgressCardProps {
  title?: string
  saved?: number
  goal?: number
  step?: number
  currency?: string
  milestones?: number[]
  emoji?: string
  onChange?: (saved: number) => void
  color?: string
  className?: string
}

function money(currency: string, value: number) {
  return `${currency}${Math.round(value).toLocaleString("en-US")}`
}

export function GoalProgressCard({
  title = "Trip to Kyoto",
  saved: initial = 2150,
  goal = 4000,
  step = 250,
  currency = "$",
  milestones = [0.25, 0.5, 0.75],
  emoji = "🗻",
  onChange,
  color = "var(--primary)",
  className,
}: GoalProgressCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const [saved, setSaved] = useState(initial)
  const ratio = Math.min(1, saved / Math.max(1, goal))
  const done = saved >= goal

  return (
    <div ref={rootRef} data-motion={moving ? "on" : "off"} className={cn("w-full max-w-[400px] rounded-[24px] bg-card p-5 text-foreground shadow-sm ring-1 ring-border motion-reduce:animate-none sm:p-6", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-[14px] bg-muted text-xl" aria-hidden>{emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{title}</p>
          <p className="text-[13px] text-muted-foreground tabular-nums">{Math.round(ratio * 100)}% of {money(currency, goal)}</p>
        </div>
      </div>
      <p className="mt-5 text-[34px] leading-none font-semibold tabular-nums">{money(currency, saved)}</p>
      <div className="relative mt-4 h-3.5 rounded-full bg-muted" role="progressbar" aria-label={`${title} progress`} aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(saved, goal)} aria-valuetext={`${money(currency, saved)} of ${money(currency, goal)}`}>
        <div className="absolute inset-y-0 left-0 overflow-hidden rounded-full" style={{ width: `${ratio * 100}%`, background: color }}>
          {moving && !done ? <motion.span className="absolute inset-y-0 w-16 bg-background/40 motion-reduce:hidden" animate={{ x: ["-4rem", "20rem"] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.2 }} /> : null}
        </div>
        {milestones.map((mark) => (
          <span key={mark} className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${mark * 100}%`, background: ratio >= mark ? "var(--background)" : "var(--muted-foreground)" }} aria-hidden />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground tabular-nums">{done ? "Goal reached" : `${money(currency, goal - saved)} to go`}</p>
        <button
          type="button"
          disabled={done}
          onClick={() => {
            const next = Math.min(goal, saved + step)
            setSaved(next)
            onChange?.(next)
          }}
          className={cn("inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", done ? "bg-primary text-primary-foreground" : "bg-foreground text-background")}
        >
          {done ? <Check className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {done ? "Done" : `Add ${money(currency, step)}`}
        </button>
      </div>
    </div>
  )
}
