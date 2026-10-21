"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/feature-voting.tsx

import { useRef, useState } from "react"
import { motion } from "motion/react"

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FeatureVotingProps {
  items: { id: string; title: string; description: string; votes: number }[]
  votes?: Record<string, number>
  defaultVotes?: Record<string, number>
  onVotesChange?: (votes: Record<string, number>) => void
  className?: string
}

function RollingCount({ value, reduced }: { value: number; reduced: boolean }) {
  return (
    <span className="inline-flex h-5 overflow-hidden font-medium tabular-nums">
      <motion.span
        key={value}
        initial={reduced ? { y: 0, opacity: 1 } : { y: "80%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.28 }}
      >
        {value}
      </motion.span>
    </span>
  )
}

function FeatureVoting({ items, votes: votesProp, defaultVotes, onVotesChange, className }: FeatureVotingProps) {
  const reduced = usePrefersReducedMotion()
  const [votes, setVotes] = useControllableState<Record<string, number>>({
    value: votesProp,
    defaultValue: defaultVotes ?? Object.fromEntries(items.map((item) => [item.id, item.votes])),
    onChange: onVotesChange,
  })
  const [pressed, setPressed] = useState<Record<string, boolean>>({})
  const pressedRef = useRef(pressed)

  const ranked = [...items].sort((left, right) => (votes[right.id] ?? right.votes) - (votes[left.id] ?? left.votes))

  const toggle = (id: string, base: number) => {
    const wasPressed = !!pressedRef.current[id]
    const nextPressed = { ...pressedRef.current, [id]: !wasPressed }
    pressedRef.current = nextPressed
    setPressed(nextPressed)
    setVotes((current) => {
      const count = current[id] ?? base
      return { ...current, [id]: Math.max(0, count + (wasPressed ? -1 : 1)) }
    })
  }

  return (
    <ul data-slot="feature-voting" data-reduced={reduced ? "true" : undefined} className={cn("flex w-full max-w-md flex-col gap-2", className)}>
      {ranked.map((item) => {
        const count = votes[item.id] ?? item.votes
        return (
          <motion.li
            key={item.id}
            layout={reduced ? false : "position"}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-3"
          >
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <button
              type="button"
              aria-pressed={pressed[item.id] ? true : false}
              aria-label={`为${item.title}投票`}
              className="inline-flex min-w-14 flex-col items-center rounded-lg border px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring aria-pressed:border-primary aria-pressed:text-primary"
              onClick={() => toggle(item.id, item.votes)}
            >
              <span aria-hidden="true">▲</span>
              <RollingCount value={count} reduced={reduced} />
            </button>
          </motion.li>
        )
      })}
    </ul>
  )
}

export { FeatureVoting }
