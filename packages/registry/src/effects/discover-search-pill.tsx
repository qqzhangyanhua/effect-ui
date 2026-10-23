"use client"

// Ported from uselayouts (MIT, (c) 2025 Urvish Mali) — https://github.com/iurvish/uselayouts/blob/main/registry/default/example/discover-button.tsx

import { useState } from "react"
import { Flame, Heart, Search, X } from "lucide-react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "popular", label: "Popular", icon: Flame },
  { id: "favorites", label: "Favorites", icon: Heart },
] as const

type TabId = (typeof tabs)[number]["id"]

export interface DiscoverSearchPillProps {
  className?: string
  onSearch?: (query: string) => void
  onTabChange?: (tab: TabId) => void
}

export function DiscoverSearchPill({ className, onSearch, onTabChange }: DiscoverSearchPillProps) {
  const reduced = usePrefersReducedMotion()
  const [tab, setTab] = useState<TabId>("popular")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const spring = reduced ? { duration: 0 } : { type: "spring" as const, damping: 20, stiffness: 230, mass: 1.2 }

  return (
    <div data-open={open ? "true" : "false"} data-tab={tab} className={cn("flex w-full max-w-xl flex-col items-center gap-3 md:flex-row", className)}>
      <motion.div layout transition={spring} className="flex h-[60px] items-center overflow-hidden rounded-full bg-[var(--card)] px-4 shadow-lg">
        {open ? (
          <label className="flex items-center gap-3">
            <Search className="size-6 shrink-0" />
            <input
              aria-label="Search"
              placeholder="Search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                onSearch?.(event.target.value)
              }}
              className="w-40 bg-transparent text-lg outline-none"
            />
          </label>
        ) : (
          <button type="button" aria-expanded={false} aria-label="Search" className="flex items-center" onClick={() => setOpen(true)}>
            <Search className="size-6" />
          </button>
        )}
      </motion.div>
      <motion.div layout transition={spring} className="flex h-[60px] items-center overflow-hidden rounded-full bg-[var(--card)] shadow-lg">
        {open ? (
          <button type="button" aria-label="Close search" className="flex size-[60px] items-center justify-center" onClick={() => setOpen(false)}>
            <X className="size-6" />
          </button>
        ) : (
          <div className="flex items-center gap-1 px-1.5">
            {tabs.map((item) => {
              const Icon = item.icon
              const selected = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setTab(item.id)
                    onTabChange?.(item.id)
                  }}
                  className="relative flex items-center gap-2 rounded-full px-5 py-3 font-mono text-sm font-semibold uppercase"
                >
                  {selected ? <motion.span layoutId="discover-bubble" className="absolute inset-0 rounded-full bg-[var(--muted)]" transition={spring} /> : null}
                  <Icon className="relative z-10 size-5" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default DiscoverSearchPill
