"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PollVoteProps {
  className?: string
}

const OPTIONS = [
  { id: "wave", label: "海浪" },
  { id: "galaxy", label: "星系" },
  { id: "cloth", label: "布料" },
] as const

function PollVote({ className }: PollVoteProps) {
  const reduced = usePrefersReducedMotion()
  const [counts, setCounts] = React.useState<Record<string, number>>({ wave: 18, galaxy: 11, cloth: 7 })
  const [mine, setMine] = React.useState<string | null>(null)
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0)

  const choose = (id: string) => {
    const next = { ...counts }
    if (mine) next[mine] = Math.max(0, (next[mine] ?? 0) - 1)
    next[id] = (next[id] ?? 0) + 1
    setCounts(next)
    setMine(id)
  }

  return (
    <section data-slot="poll-vote" className={cn("w-full space-y-3 rounded-xl border p-4", className)}>
      <h2 className="text-sm font-medium">下一张想先看哪一种？</h2>
      <div role="radiogroup" aria-label="投票" className="space-y-2">
        {OPTIONS.map((option) => {
          const count = counts[option.id] ?? 0
          const percent = total === 0 ? 0 : Math.round((count / total) * 100)
          const selected = mine === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected && "border-primary",
              )}
              onClick={() => choose(option.id)}
            >
              {mine ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-primary/15"
                  style={{ width: `${percent}%`, transition: reduced ? "none" : "width 240ms ease" }}
                />
              ) : null}
              <span className="relative flex items-center justify-between">
                <span>{option.label}</span>
                <span className="text-xs text-muted-foreground">{mine ? `${percent}%` : "投票"}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">{mine ? `共 ${total} 票，可以改投。` : "还没有投票。"}</p>
    </section>
  )
}

export { PollVote }
