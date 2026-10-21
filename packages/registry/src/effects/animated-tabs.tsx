"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedTabsItem {
  value: string
  label: string
  content: React.ReactNode
}

export interface AnimatedTabsProps {
  items: AnimatedTabsItem[]
  className?: string
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  gap?: number
}

function AnimatedTabs({ items, className, defaultValue, value: valueProp, onValueChange, gap }: AnimatedTabsProps) {
  const reduce = usePrefersReducedMotion()
  const keepGap = gap === undefined || gap === 4
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? items[0]?.value ?? "")
  const value = valueProp ?? uncontrolled
  const setValue = (next: string) => {
    if (valueProp === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }
  const current = items.find((item) => item.value === value)

  return (
    <div data-slot="animated-tabs" className={cn("w-full", className)}>
      <div
        className={keepGap ? "relative flex gap-1 rounded-full bg-muted p-1" : "relative flex rounded-full bg-muted p-1"}
        style={keepGap ? undefined : { gap }}
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setValue(item.value)}
            className="relative z-10 flex-1 rounded-full px-3 py-1.5 text-sm"
          >
            {value === item.value ? (
              reduce ? (
                <span className="absolute inset-0 rounded-full bg-background shadow-sm" />
              ) : (
                <motion.span
                  layoutId="animated-tab-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )
            ) : null}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 text-sm">{current?.content}</div>
    </div>
  )
}

export { AnimatedTabs }
