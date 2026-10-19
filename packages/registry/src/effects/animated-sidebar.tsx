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
}

function AnimatedSidebar({
  className,
  open,
  onOpenChange,
  children,
}: AnimatedSidebarProps) {
  const reduce = usePrefersReducedMotion()
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

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
          <aside className="mt-3 w-56 rounded-xl border bg-card p-4 shadow-sm">{children}</aside>
        ) : null
      ) : (
        <AnimatePresence>
          {isOpen ? (
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              className="mt-3 w-56 rounded-xl border bg-card p-4 shadow-sm"
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
