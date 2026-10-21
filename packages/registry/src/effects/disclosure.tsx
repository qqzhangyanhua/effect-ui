"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/disclosure.tsx

import { createContext, useContext, useState, type ReactNode } from "react"
import { AnimatePresence, motion, type TargetAndTransition } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

interface DisclosureContextValue {
  open: boolean
  toggle: () => void
  reduced: boolean
  variants?: { expanded?: TargetAndTransition; collapsed?: TargetAndTransition }
}

const DisclosureContext = createContext<DisclosureContextValue | null>(null)

function useDisclosureContext() {
  const value = useContext(DisclosureContext)
  if (!value) throw new Error("DisclosureTrigger 必须放在 Disclosure 内")
  return value
}

export interface DisclosureProps {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variants?: { expanded?: TargetAndTransition; collapsed?: TargetAndTransition }
  className?: string
}

function Disclosure({ children, open, defaultOpen = false, onOpenChange, variants, className }: DisclosureProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = useState(defaultOpen)
  const isOpen = open !== undefined ? open : internal
  const toggle = () => {
    const next = !isOpen
    if (open === undefined) setInternal(next)
    onOpenChange?.(next)
  }

  return (
    <DisclosureContext.Provider value={{ open: isOpen, toggle, reduced, variants }}>
      <div data-slot="disclosure" data-reduced={reduced ? "true" : "false"} className={cn("w-full", className)}>
        {children}
      </div>
    </DisclosureContext.Provider>
  )
}

function DisclosureTrigger({ children, className }: { children?: ReactNode; className?: string }) {
  const { open, toggle } = useDisclosureContext()
  return (
    <button type="button" className={cn("flex w-full items-center justify-between py-2 text-left text-sm font-medium", className)} aria-expanded={open} onClick={toggle}>
      {children}
    </button>
  )
}

function DisclosureContent({ children, className }: { children?: ReactNode; className?: string }) {
  const { open, reduced, variants } = useDisclosureContext()
  return (
    <div className={cn("overflow-hidden", className)}>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0, ...variants?.collapsed }}
            animate={{ height: "auto", opacity: 1, ...variants?.expanded }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0, ...variants?.collapsed }}
            transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.05, duration: 0.35 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export { Disclosure, DisclosureTrigger, DisclosureContent }
