"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface PollVoteProps {
  className?: string
  question?: string
  options?: PollOption[]
  mode?: "single" | "multiple"
  value?: string[]
  defaultValue?: string[]
  onVote?: (value: string[]) => void
  deadline?: number
  now?: number
}

const FROZEN_NOW = Date.parse("2026-10-20T18:00:00Z")

const STARTER: PollOption[] = [
  { id: "a", label: "本周发布", votes: 18 },
  { id: "b", label: "下周再看", votes: 11 },
  { id: "c", label: "先做内部试用", votes: 7 },
]

function relativeDeadline(deadline: number, now: number) {
  const minutes = Math.round((deadline - now) / 60000)
  const format = new Intl.RelativeTimeFormat("zh", { numeric: "auto" })
  if (Math.abs(minutes) < 90) return format.format(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 36) return format.format(hours, "hour")
  return format.format(Math.round(hours / 24), "day")
}

function PollVote({
  className,
  question = "这个功能什么时候发出去？",
  options = STARTER,
  mode = "single",
  value,
  defaultValue = [],
  onVote,
  deadline = FROZEN_NOW + 2 * 24 * 60 * 60 * 1000,
  now = FROZEN_NOW,
}: PollVoteProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = React.useState(defaultValue)
  const selected = value ?? internal
  const voted = selected.length > 0
  const counts = options.map((option) => option.votes + (selected.includes(option.id) ? 1 : 0))
  const total = counts.reduce((sum, count) => sum + count, 0)
  const highest = Math.max(...counts)
  const when = relativeDeadline(deadline, now)

  const choose = (id: string) => {
    const next =
      mode === "single" ? [id] : selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
    if (value === undefined) setInternal(next)
    onVote?.(next)
  }

  return (
    <div data-slot="poll-vote" className={cn("w-full max-w-md space-y-3 rounded-xl border p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">{question}</h3>
        <p className="text-xs text-muted-foreground">截止 {when}</p>
      </div>
      <div role={mode === "single" ? "radiogroup" : "group"} aria-label={question} className="space-y-2">
        {options.map((option, index) => {
          const count = counts[index] ?? 0
          const percent = total > 0 ? Math.round((count / total) * 100) : 0
          const active = selected.includes(option.id)
          const leading = voted && count === highest && count > 0
          return (
            <button
              key={option.id}
              type="button"
              role={mode === "single" ? "radio" : "checkbox"}
              aria-checked={active}
              onClick={() => choose(option.id)}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border px-3 py-2 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
                leading && "border-primary",
              )}
            >
              {voted ? (
                <motion.span
                  className="absolute inset-y-0 left-0 bg-primary/15"
                  initial={false}
                  animate={{ width: `${percent}%` }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 180, damping: 24 }}
                />
              ) : null}
              <span className="relative flex items-center justify-between gap-3">
                <span>{option.label}</span>
                {voted ? <span>{percent}%</span> : null}
              </span>
            </button>
          )
        })}
      </div>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {voted ? `共 ${total} 票` : mode === "multiple" ? "可以选择多项" : "选择一项"}
      </p>
    </div>
  )
}

export { PollVote }
