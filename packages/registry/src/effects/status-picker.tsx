"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/status-picker-base.tsx

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CircleDashed, X } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface StatusPickerItem {
  id: number
  emoji: string
  name: string
}

export interface StatusPickerProps {
  items: StatusPickerItem[]
  value?: number
  defaultValue?: number
  onChange?: (id: number) => void
  className?: string
}

export function StatusPicker({ items, value, defaultValue = 0, onChange, className }: StatusPickerProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [hint, setHint] = useState<number | null>(null)
  const [internal, setInternal] = useState(defaultValue)
  const status = value ?? internal
  const active = items.find((item) => item.id === status)
  const label = status === 0 || !active ? "Status" : active.name
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 22 }

  const choose = (id: number) => {
    if (value === undefined) setInternal(id)
    onChange?.(id)
    setOpen(false)
    setHint(null)
  }

  return (
    <div data-slot="status-picker" data-open={open ? "true" : "false"} className={`relative inline-flex items-center motion-reduce:transition-none ${className ?? ""}`}>
      <div className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
        <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex items-center gap-2 text-sm font-medium text-foreground">
          {status === 0 || !active ? <CircleDashed className="size-4 text-muted-foreground" aria-hidden="true" /> : <span className="text-base">{active.emoji}</span>}
          <span>{label}</span>
        </button>
        {status !== 0 ? (
          <button type="button" aria-label="Clear status" onClick={() => choose(0)} className="rounded-md p-1 text-muted-foreground active:bg-background">
            <X className="size-3" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring}
            className="absolute bottom-full left-0 z-20 mb-2 flex gap-1 rounded-lg border border-border bg-background p-1"
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-label={item.name}
                onPointerEnter={() => setHint(item.id)}
                onPointerDown={() => setHint(item.id)}
                onFocus={() => setHint(item.id)}
                onBlur={() => setHint(null)}
                onClick={() => choose(item.id)}
                className="relative flex size-10 items-center justify-center rounded-lg bg-muted text-lg active:scale-95"
              >
                {hint === item.id ? (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground">
                    {item.name}
                  </span>
                ) : null}
                {item.emoji}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
