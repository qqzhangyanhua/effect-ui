"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/fabs/speed-dial.tsx

import { Plus } from "lucide-react"
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { motion } from "motion/react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SpeedDialProps {
  actions: { label: string; icon?: ReactNode; onSelect?: () => void }[]
  placement?: "up" | "left" | "arc"
  triggerLabel?: string
  className?: string
}

function actionOffset(placement: "up" | "left" | "arc", index: number, total: number) {
  const step = index + 1
  if (placement === "left") return { x: -step * 68, y: 0 }
  if (placement === "up") return { x: 0, y: -step * 64 }
  const start = -Math.PI / 2
  const end = -Math.PI
  const t = total === 1 ? 0.5 : index / (total - 1)
  const angle = start + (end - start) * t
  const radius = 96
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

function SpeedDial({ actions, placement = "up", triggerLabel = "打开操作", className }: SpeedDialProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef(open)
  const menuId = useId()

  useEffect(() => {
    openRef.current = open
  }, [open])

  useClickOutside(rootRef, () => {
    if (openRef.current) setOpen(false)
  })

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener("keydown", onKey)
    rootRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return
    const buttons = [...(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
    if (buttons.length === 0) return
    const current = buttons.findIndex((node) => node === document.activeElement)
    const delta = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0
    if (delta === 0) return
    event.preventDefault()
    const next = (current + delta + buttons.length) % buttons.length
    buttons[next]?.focus()
  }

  return (
    <div
      ref={rootRef}
      data-slot="speed-dial"
      data-placement={placement}
      data-reduced={reduced ? "true" : undefined}
      className={cn("relative inline-flex", className)}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="relative z-10 inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={open ? "关闭操作" : triggerLabel}
        onClick={() => setOpen((value) => !value)}
      >
        <Plus className={cn("size-5 transition-transform", open && "rotate-45", reduced && "transition-none")} />
      </button>
      <div id={menuId} role="menu" aria-hidden={open ? undefined : true} inert={open ? undefined : true}>
        {actions.map((action, index) => {
          const offset = actionOffset(placement, index, actions.length)
          return (
            <motion.div
              key={action.label}
              className="absolute left-1/2 top-1/2"
              initial={false}
              animate={
                open
                  ? { x: offset.x - 22, y: offset.y - 22, opacity: 1, scale: 1 }
                  : { x: -22, y: -22, opacity: 0, scale: 0.6 }
              }
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 28, delay: open ? index * 0.04 : 0 }}
            >
              <div className={cn("flex items-center gap-2", placement === "left" && "flex-row-reverse")}>
                <button
                  type="button"
                  role="menuitem"
                  aria-label={action.label}
                  className="inline-flex size-11 items-center justify-center rounded-full border bg-background text-foreground shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    action.onSelect?.()
                    setOpen(false)
                    triggerRef.current?.focus()
                  }}
                >
                  {action.icon ?? <span className="size-2 rounded-full bg-primary" />}
                </button>
                <span className="whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow">{action.label}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export { SpeedDial }
