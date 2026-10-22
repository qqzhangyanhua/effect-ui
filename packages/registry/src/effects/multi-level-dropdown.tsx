"use client"

// Ported from Meraki UI (MIT, (c) 2021 Khatab Wedaa) — https://github.com/merakiuilabs/merakiui/blob/main/components/dropdowns/MultiLevelWithIcons.html. Modified for effect-ui.

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { AnimatePresence, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DropdownEntry {
  id: string
  label: string
  href?: string
  items?: DropdownEntry[]
}

export interface MultiLevelDropdownProps {
  label?: string
  items: DropdownEntry[]
  className?: string
}

function MenuLevel({
  entries,
  depth,
  onClose,
}: {
  entries: DropdownEntry[]
  depth: number
  onClose: () => void
}) {
  const [opened, setOpened] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (!opened) return
    const node = listRef.current?.querySelector<HTMLElement>(`[data-submenu="${opened}"] [role="menuitem"]`)
    node?.focus()
  }, [opened])

  function onKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const buttons: HTMLElement[] = []
    for (const child of event.currentTarget.children) {
      const item = child.firstElementChild
      if (item instanceof HTMLElement && item.getAttribute("role") === "menuitem") buttons.push(item)
    }
    const index = buttons.findIndex((button) => button === document.activeElement)
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      event.stopPropagation()
      const next = event.key === "ArrowDown" ? index + 1 : index - 1
      const count = buttons.length
      if (count === 0) return
      const wrapped = (next + count) % count
      buttons[wrapped]?.focus()
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key === "ArrowLeft" && depth > 0) {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    }
  }

  return (
    <ul className="min-w-52 rounded-xl border border-border bg-card p-1 text-foreground shadow-lg" onKeyDown={onKeyDown} ref={listRef} role="menu">
      {entries.map((entry) => {
        const nested = entry.items && entry.items.length > 0
        const open = opened === entry.id
        return (
          <li className="relative" key={entry.id}>
            {entry.href && !nested ? (
              <a className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" href={entry.href} role="menuitem">
                {entry.label}
              </a>
            ) : (
              <button
                aria-expanded={nested ? open : undefined}
                aria-haspopup={nested ? "menu" : undefined}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => {
                  if (!nested) {
                    onClose()
                    return
                  }
                  setOpened(open ? null : entry.id)
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" && nested) {
                    event.preventDefault()
                    event.stopPropagation()
                    setOpened(entry.id)
                  }
                }}
                role="menuitem"
                type="button"
              >
                <span>{entry.label}</span>
                {nested ? <span aria-hidden="true">›</span> : null}
              </button>
            )}
            {nested && open ? (
              <div className="pt-1 sm:absolute sm:top-0 sm:left-full sm:pt-0 sm:pl-1" data-submenu={entry.id}>
                <MenuLevel depth={depth + 1} entries={entry.items ?? []} onClose={() => setOpened(null)} />
              </div>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function MultiLevelDropdown({ label = "菜单", items, className }: MultiLevelDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const moving = motionOn && !reduced

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const first = ref.current?.querySelector<HTMLElement>("[role='menuitem']")
    first?.focus()
  }, [open])

  return (
    <div
      className={cn("relative inline-block", className)}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="multi-level-dropdown"
      ref={ref}
    >
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground"
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        {label}
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="absolute left-0 z-20 mt-2 origin-top-left"
            exit={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            id={menuId}
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96 }}
            transition={{ duration: reduced ? 0 : 0.12 }}
          >
            <MenuLevel
              depth={0}
              entries={items}
              onClose={() => {
                setOpen(false)
                triggerRef.current?.focus()
              }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
