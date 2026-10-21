"use client"

// Ported from Motion Primitives (MIT) — https://github.com/ibelick/motion-primitives/blob/main/components/core/morphing-popover.tsx

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  id: string
  reduced: boolean
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopover() {
  const value = useContext(PopoverContext)
  if (!value) throw new Error("MorphingPopover 的子组件必须放在 MorphingPopover 内")
  return value
}

export interface MorphingPopoverProps {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

function MorphingPopover({ children, open, defaultOpen = false, onOpenChange, className }: MorphingPopoverProps) {
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = useState(defaultOpen)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internal
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const setOpen = (next: boolean) => {
    if (!isControlled) setInternal(next)
    onOpenChange?.(next)
  }
  const setOpenRef = useRef(setOpen)
  useEffect(() => {
    setOpenRef.current = setOpen
  })
  useClickOutside(rootRef, () => {
    if (isOpen) setOpenRef.current(false)
  })

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, id, reduced }}>
      <div ref={rootRef} data-slot="morphing-popover" className={cn("relative inline-flex", className)}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

function MorphingPopoverTrigger({ children, className }: { children?: ReactNode; className?: string }) {
  const { open, setOpen, id, reduced } = usePopover()
  const shared = reduced ? undefined : `morph-trigger-${id}`
  return (
    <motion.button
      type="button"
      layoutId={shared}
      className={cn("rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground", className)}
      aria-expanded={open}
      aria-controls={`morph-panel-${id}`}
      onClick={() => setOpen(!open)}
    >
      {children}
    </motion.button>
  )
}

function MorphingPopoverContent({ children, className }: { children?: ReactNode; className?: string }) {
  const { open, setOpen, id, reduced } = usePopover()
  const panelRef = useRef<HTMLDivElement>(null)
  const setOpenRef = useRef(setOpen)
  useEffect(() => {
    setOpenRef.current = setOpen
  })

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    panel?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpenRef.current(false)
        return
      }
      if (event.key !== "Tab" || !panel) return
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => !item.hasAttribute("disabled"))
      if (items.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      previous?.focus()
    }
  }, [open])

  return (
    <div className="contents">
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={panelRef}
            id={`morph-panel-${id}`}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return
              event.preventDefault()
              setOpen(false)
            }}
            layoutId={reduced ? undefined : `morph-trigger-${id}`}
            className={cn(
              "absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border bg-popover p-3 text-popover-foreground shadow-lg outline-none",
              className,
            )}
            initial={reduced ? { opacity: 0 } : { opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0.15 } : { type: "spring", bounce: 0.12, duration: 0.4 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent }
