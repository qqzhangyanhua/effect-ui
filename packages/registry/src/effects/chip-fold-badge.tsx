"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ChipFoldBadgeProps {
  pace?: number
  intensity?: number
  collapsed?: boolean
  maxVisible?: number
  className?: string
  onValueChange?: (state: { selected: string[]; collapsed: boolean }) => void
}

export interface ChipTopic {
  id: string
  label: string
}

export const CHIP_TOPICS: readonly ChipTopic[] = [
  { id: "atlas", label: "Atlas" },
  { id: "cedar", label: "Cedar" },
  { id: "dune", label: "Dune" },
  { id: "ember", label: "Ember" },
  { id: "flint", label: "Flint" },
  { id: "grove", label: "Grove" },
  { id: "harbor", label: "Harbor" },
  { id: "ivory", label: "Ivory" },
]

type FoldPhase = "expanded" | "folding" | "collapsed" | "expanding"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function chipCap(maxVisible: number) {
  const rounded = Math.round(Number.isFinite(maxVisible) ? maxVisible : 6)
  return clamp(rounded, 2, 12)
}

export function chipOrder(ids: readonly string[]) {
  const picked = new Set(ids)
  return CHIP_TOPICS.map((topic) => topic.id).filter((id) => picked.has(id))
}

export function ChipFoldBadge({
  pace = 1,
  intensity = 0.7,
  collapsed = false,
  maxVisible = 6,
  className,
  onValueChange,
}: ChipFoldBadgeProps) {
  const reduced = usePrefersReducedMotion()
  const onValueRef = useRef(onValueChange)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(280 / paceRate)
  const cap = chipCap(maxVisible)
  const [selected, setSelected] = useState<string[]>([])
  const [folded, setFolded] = useState(collapsed)
  const [phase, setPhase] = useState<FoldPhase>(collapsed ? "collapsed" : "expanded")
  const [seenCollapsed, setSeenCollapsed] = useState(collapsed)

  if (seenCollapsed !== collapsed) {
    setSeenCollapsed(collapsed)
    setFolded(collapsed)
    setPhase(collapsed ? "collapsed" : "expanded")
  }

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (phase !== "folding" && phase !== "expanding") return
    const id = window.setTimeout(() => {
      setPhase(phase === "folding" ? "collapsed" : "expanded")
    }, ms)
    return () => window.clearTimeout(id)
  }, [phase, ms])

  function emit(nextSelected: string[], nextFolded: boolean) {
    onValueRef.current?.({ selected: nextSelected, collapsed: nextFolded })
  }

  function toggle(id: string) {
    const next = chipOrder(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])
    setSelected(next)
    emit(next, folded)
  }

  function toggleFold() {
    const next = !folded
    setFolded(next)
    setPhase(reduced ? (next ? "collapsed" : "expanded") : next ? "folding" : "expanding")
    emit(selected, next)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "f" && event.key !== "F") return
    event.preventDefault()
    toggleFold()
  }

  const hint = !folded && selected.length > cap

  return (
    <div
      data-slot="chip-fold-badge"
      data-ritual="chip-fold"
      data-pace={paceRate}
      data-intensity={gain}
      data-collapsed={folded ? "on" : "off"}
      data-phase={phase}
      data-count={selected.length}
      data-selected={selected.join(",")}
      data-max={cap}
      data-hint={hint ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "relative w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Topics</p>
        {folded ? (
          <button
            type="button"
            data-part="badge"
            aria-expanded={false}
            onClick={toggleFold}
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            style={{
              boxShadow: `0 0 ${6 + gain * 16}px color-mix(in srgb, var(--primary) ${Math.round(28 + gain * 48)}%, transparent)`,
            }}
          >
            {selected.length} selected
          </button>
        ) : (
          <button
            type="button"
            data-part="fold"
            aria-expanded
            onClick={toggleFold}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Fold
          </button>
        )}
      </div>
      <motion.div
        data-part="cloud"
        animate={reduced ? undefined : { opacity: folded ? 0 : 1, y: folded ? -8 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: ms / 1000 }}
        className={cn("flex flex-wrap gap-2 motion-reduce:transition-none", folded && "pointer-events-none absolute h-px overflow-hidden opacity-0")}
        aria-hidden={folded}
      >
        {CHIP_TOPICS.map((topic) => {
          const on = selected.includes(topic.id)
          return (
            <button
              key={topic.id}
              type="button"
              aria-pressed={on}
              tabIndex={folded ? -1 : 0}
              onClick={() => toggle(topic.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
                on ? "border-foreground bg-foreground text-background" : "border-border bg-muted text-foreground",
              )}
              style={on ? { boxShadow: `0 0 ${4 + gain * 10}px color-mix(in srgb, var(--foreground) ${Math.round(18 + gain * 30)}%, transparent)` } : undefined}
            >
              {topic.label}
            </button>
          )
        })}
      </motion.div>
      {hint ? (
        <p data-part="hint" className="mt-3 text-xs text-muted-foreground">
          {cap}+ picked
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Pick any topics, then fold them into a count.</p>
      )}
    </div>
  )
}
