"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/floating-panel.tsx

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FloatingPanelProps {
  button: ReactNode
  title: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'

function FloatingPanel({ button, title, children, footer, className }: FloatingPanelProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const openRef = useRef(open)
  const id = useId()
  const panelId = `floating-panel-${id}`
  const titleId = `floating-panel-title-${id}`
  const shellId = reduced ? undefined : `floating-panel-shell-${id}`

  useEffect(() => {
    openRef.current = open
  }, [open])

  useClickOutside(rootRef, () => {
    if (openRef.current) setOpen(false)
  })

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const previous = triggerRef.current
    panel?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
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
    <div ref={rootRef} data-slot="floating-panel" data-reduced={reduced ? "true" : undefined} className={cn("relative inline-flex", className)}>
      <motion.button
        ref={triggerRef}
        type="button"
        layoutId={shellId}
        className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {button}
      </motion.button>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            layoutId={shellId}
            className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg outline-none"
            initial={{ opacity: reduced ? 0 : 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { type: "spring", bounce: 0.12, duration: 0.4 }}
          >
            <h2 id={titleId} className="text-sm font-medium">
              {title}
            </h2>
            <div className="mt-2 text-sm">{children}</div>
            {footer ? <div className="mt-3 flex justify-end gap-2">{footer}</div> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export { FloatingPanel }
