"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/budget-card-base.tsx

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronDown, X } from "lucide-react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface BudgetBreakdownItem {
  label: string
  amount: number
  color: string
}

export interface BudgetCardProps {
  month: string
  totalBudget: number
  spentAmount: number
  breakdown: BudgetBreakdownItem[]
  onViewDetails?: () => void
  onMonthChange?: (month: string) => void
  className?: string
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

const transactions = [
  { id: 1, date: "Jul 12", name: "Whole Foods", category: "Groceries", amount: 84.5 },
  { id: 2, date: "Jul 10", name: "Rent Payment", category: "Rent", amount: 1600 },
  { id: 3, date: "Jul 08", name: "Chevron Gas", category: "Other", amount: 52.3 },
]

function money(value: number) {
  return value.toLocaleString("en-US")
}

export function BudgetCard({ month, totalBudget, spentAmount, breakdown, onViewDetails, onMonthChange, className }: BudgetCardProps) {
  const reduced = usePrefersReducedMotion()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [selectedMonth, setSelectedMonth] = useState(month)
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const spent = totalBudget > 0 ? Math.round((spentAmount / totalBudget) * 100) : 0
  const remaining = totalBudget - spentAmount
  const transition = reduced ? { duration: 0 } : { duration: 0.8, ease: [0.19, 1, 0.22, 1] as const }

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const pickMonth = (next: string) => {
    setSelectedMonth(next)
    setMenuOpen(false)
    onMonthChange?.(next)
  }

  return (
    <div data-slot="budget-card" className={`relative mx-auto w-full max-w-lg motion-reduce:transition-none ${className ?? ""}`}>
      <div className="relative border border-border bg-card text-foreground shadow-sm">
        <span className="pointer-events-none absolute top-0 left-0 size-5 border-t-2 border-l-2 border-foreground/25" />
        <span className="pointer-events-none absolute top-0 right-0 size-5 border-t-2 border-r-2 border-foreground/25" />
        <span className="pointer-events-none absolute bottom-0 left-0 size-5 border-b-2 border-l-2 border-foreground/25" />
        <span className="pointer-events-none absolute right-0 bottom-0 size-5 border-r-2 border-b-2 border-foreground/25" />
        <div className="p-6">
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="text-muted-foreground">Monthly Budget</p>
            <div className="relative" ref={dropdownRef}>
              <button type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="flex min-w-32 items-center justify-between gap-2 border border-border px-3 py-1 text-muted-foreground active:bg-accent">
                {selectedMonth}
                <ChevronDown size={16} className={menuOpen ? "rotate-180" : ""} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {menuOpen ? (
                  <motion.div initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full right-0 z-30 mt-1 max-h-60 w-44 overflow-y-auto border border-border bg-popover py-1 shadow-lg">
                    {months.map((item) => (
                      <button key={item} type="button" onClick={() => pickMonth(item)} className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${selectedMonth === item ? "bg-accent text-accent-foreground" : "text-muted-foreground active:bg-accent"}`}>
                        {item}
                        {selectedMonth === item ? <Check size={14} aria-hidden="true" /> : null}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
          <h2 className="mb-6 text-5xl font-medium tracking-tight">${money(totalBudget)}</h2>
          <p className="mb-2 text-sm text-muted-foreground">Monthly spending limit</p>
          <div className="h-2 w-full overflow-hidden bg-secondary">
            <motion.div initial={reduced ? false : { width: 0 }} animate={{ width: `${spent}%` }} transition={transition} className="h-full bg-primary" />
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <span className="block text-xs text-muted-foreground">Spent</span>
              <span className="text-lg">${money(spentAmount)}</span>
              <span className="ml-2 border border-border bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">{spent}%</span>
            </div>
            <div className="text-right">
              <span className="block text-sm text-muted-foreground">Remaining</span>
              <span className="text-lg">${money(remaining)}</span>
            </div>
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-4 p-6">
          <p className="text-muted-foreground">Spending breakdown</p>
          <div className="flex h-2 gap-2">
            {breakdown.map((item) => (
              <div key={item.label} className="h-full" style={{ flex: item.amount, background: item.color }} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {breakdown.map((item) => (
              <div key={item.label}>
                <p className="truncate text-xs text-muted-foreground">{item.label}</p>
                <p>${money(item.amount)}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setDetailsOpen(true)
              onViewDetails?.()
            }}
            className="w-full border border-border py-3 text-sm active:bg-accent"
          >
            View Details
          </button>
        </div>
      </div>
      <AnimatePresence>
        {detailsOpen ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4">
            <button type="button" aria-label="Close details" className="absolute inset-0 bg-background/60" onClick={() => setDetailsOpen(false)} />
            <motion.div role="dialog" aria-modal="true" aria-label="Budget Details" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative flex max-h-full w-full flex-col overflow-hidden border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                  <h3 className="font-semibold">Budget Details</h3>
                  <p className="text-xs text-muted-foreground">Deep dive into your {selectedMonth} spending</p>
                </div>
                <button type="button" aria-label="Close insights" onClick={() => setDetailsOpen(false)} className="rounded-full p-2 active:bg-accent">
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="space-y-6 overflow-y-auto p-4">
                {breakdown.map((item) => {
                  const share = spentAmount > 0 ? Math.round((item.amount / spentAmount) * 100) : 0
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="text-muted-foreground">{share}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full" style={{ width: `${share}%`, background: item.color }} />
                      </div>
                    </div>
                  )
                })}
                <div className="divide-y divide-border border-t border-border">
                  {transactions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium uppercase">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.category} • {item.date}</p>
                      </div>
                      <span className="text-sm">-${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-4">
                <button type="button" onClick={() => setDetailsOpen(false)} className="w-full bg-primary py-3 font-medium text-primary-foreground active:scale-[0.98]">
                  Close Insights
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
