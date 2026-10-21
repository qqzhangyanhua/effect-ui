"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedSidebarProps {
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  size?: number
  intensity?: number
}

function AnimatedSidebar({
  className,
  open,
  onOpenChange,
  children,
  size,
  intensity,
}: AnimatedSidebarProps) {
  const reduce = usePrefersReducedMotion()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const wide = size === undefined || size === 224
  const slide = intensity === undefined || intensity === 1 ? 24 : 24 * intensity
  const asideClass = wide
    ? "mt-3 w-56 rounded-xl border bg-card p-4 shadow-sm"
    : "mt-3 rounded-xl border bg-card p-4 shadow-sm"

  return (
    <div data-slot="animated-sidebar" className={cn("relative", className)}>
      <button
        type="button"
        className="rounded-md border px-3 py-1.5 text-sm"
        onClick={() => setOpen(!isOpen)}
      >
        {isOpen ? "收起侧栏" : "展开侧栏"}
      </button>
      {reduce ? (
        isOpen ? (
          <aside className={asideClass} style={wide ? undefined : { width: size }}>
            {children}
          </aside>
        ) : null
      ) : (
        <AnimatePresence>
          {isOpen ? (
            <motion.aside
              initial={{ x: slide === 24 ? -24 : -slide, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: slide === 24 ? -24 : -slide, opacity: 0 }}
              className={asideClass}
              style={wide ? undefined : { width: size }}
            >
              {children}
            </motion.aside>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  )
}

export { AnimatedSidebar }
