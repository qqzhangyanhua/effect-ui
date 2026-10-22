"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/tabs/IconTabs.tsx
// framer-motion 已改为 motion/react。

import { useControllableState } from "@/hooks/use-controllable-state"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { motion } from "motion/react"
import { useId, type HTMLAttributes, type ReactNode } from "react"

export interface ExpandingIconTab {
  value: string
  label: string
  icon: ReactNode
}

export interface ExpandingIconTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: ExpandingIconTab[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function ExpandingIconTabs({
  tabs,
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: ExpandingIconTabsProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const uid = useId()
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? tabs[0]?.value ?? "",
    onChange: onValueChange,
  })

  function move(delta: number) {
    if (tabs.length === 0) return
    const index = tabs.findIndex((tab) => tab.value === current)
    const start = index < 0 ? 0 : index
    const next = tabs[(start + delta + tabs.length) % tabs.length]
    if (next) setCurrent(next.value)
  }

  return (
    <div
      {...props}
      className={cn("flex flex-wrap items-center gap-2 border-b pb-2", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="expanding-icon-tabs"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault()
          move(1)
        } else if (event.key === "ArrowLeft") {
          event.preventDefault()
          move(-1)
        }
      }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const selected = tab.value === current
        return (
          <button
            key={tab.value}
            aria-label={tab.label}
            aria-selected={selected}
            className={cn(
              "relative flex items-center rounded-full px-2 py-2 text-sm font-medium text-muted-foreground",
              selected && "bg-primary/15 text-primary",
            )}
            id={`${uid}-${tab.value}`}
            onClick={() => setCurrent(tab.value)}
            role="tab"
            type="button"
          >
            <span className="inline-flex size-4 items-center justify-center">{tab.icon}</span>
            {selected ? (
              prefersReducedMotion ? (
                <span className="ml-2 overflow-hidden">{tab.label}</span>
              ) : (
                <motion.span
                  animate={{ width: "auto", opacity: 1 }}
                  className="ml-2 overflow-hidden"
                  initial={{ width: 0, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.35 }}
                >
                  {tab.label}
                </motion.span>
              )
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
