"use client"

// Ported from Animata (MIT) — https://github.com/codse/animata/blob/main/animata/fabs/flower-menu.tsx

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FlowerMenuProps {
  items: { href: string; label: string }[]
  count?: number
  duration?: number
  className?: string
}

function FlowerMenu({ items, count = 6, duration = 0.45, className }: FlowerMenuProps) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef(open)
  const menuId = useId()
  const total = Math.max(0, Math.round(count))
  const petals = Array.from({ length: items.length === 0 ? 0 : total }, (_, index) => {
    const item = items[index % items.length]
    return item ? { ...item, key: `${item.href}-${item.label}-${index}` } : null
  }).filter((item): item is { href: string; label: string; key: string } => item !== null)
  const motionDuration = reduced ? 0 : duration

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
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return
    const links = [...(rootRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])]
    if (links.length === 0) return
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const current = links.findIndex((node) => node === document.activeElement)
    const delta = event.key === "ArrowRight" ? 1 : -1
    const next = (current + delta + links.length) % links.length
    links[next]?.focus()
  }

  return (
    <div
      ref={rootRef}
      data-slot="flower-menu"
      data-reduced={reduced ? "true" : undefined}
      className={cn("relative inline-flex size-56 items-center justify-center", className)}
      onKeyDown={onKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        className="relative z-10 inline-flex size-14 items-center justify-center rounded-full text-sm font-medium shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "关闭" : "菜单"}
      </button>
      <div id={menuId}>
        {petals.map((item, index) => {
          const angle = (360 / petals.length) * index
          const transform = open
            ? `rotate(${angle}deg) translateX(84px) rotate(${-angle}deg)`
            : "rotate(0deg) translateX(0px) rotate(0deg)"
          return (
            <a
              key={item.key}
              href={item.href}
              aria-label={item.label}
              tabIndex={open ? 0 : -1}
              className="absolute left-1/2 top-1/2 inline-flex size-11 items-center justify-center rounded-full text-xs font-medium shadow-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                transform: `translate(-50%, -50%) ${transform}`,
                opacity: open ? 1 : 0,
                transitionProperty: "transform, opacity",
                transitionDuration: `${motionDuration}s`,
                transitionDelay: reduced ? "0s" : `${index * 0.04}s`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              {item.label.slice(0, 1)}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export { FlowerMenu }
