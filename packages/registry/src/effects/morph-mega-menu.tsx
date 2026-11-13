"use client"

import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react"

import { useClickOutside } from "@/hooks/use-click-outside"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Original implementation.
 * One panel moves from the previous item to the next. Click opens it; hover does not.
 */

export interface MorphMegaMenuItem {
  id: string
  label: string
  title: string
  body: string
}

export interface MorphMegaMenuProps {
  items?: readonly MorphMegaMenuItem[]
  duration?: number
  intensity?: number
  size?: number
  className?: string
}

const DURATION_MIN = 160
const DURATION_MAX = 800
const DURATION_DEFAULT = 400
const INTENSITY_DEFAULT = 0.55
const SIZE_MIN = 160
const SIZE_MAX = 440
const SIZE_DEFAULT = 280

const DEFAULT_ITEMS: readonly MorphMegaMenuItem[] = [
  {
    id: "product",
    label: "Product",
    title: "North aisle",
    body: "A quiet shelf for the pieces you ship.",
  },
  {
    id: "docs",
    label: "Docs",
    title: "Field notes",
    body: "Short pages for the paths people actually take.",
  },
  {
    id: "studio",
    label: "Studio",
    title: "West room",
    body: "Drafts sit here until they are ready to leave.",
  },
]

type MenuBox = {
  x: number
  width: number
}

function finite(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

export function menuDuration(value: number | undefined): number {
  const next = finite(value)
  if (next === undefined) return DURATION_DEFAULT
  return Math.min(DURATION_MAX, Math.max(DURATION_MIN, Math.round(next)))
}

export function menuIntensity(value: number | undefined): number {
  const next = finite(value)
  if (next === undefined) return INTENSITY_DEFAULT
  return Math.min(1, Math.max(0, next))
}

export function menuPanelSize(value: number | undefined): number {
  const next = finite(value)
  if (next === undefined) return SIZE_DEFAULT
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, Math.round(next)))
}

export function panelAnchor(triggerX: number, panelWidth: number, hostWidth: number): number {
  const max = Math.max(0, hostWidth - panelWidth)
  return Math.min(max, Math.max(0, triggerX))
}

export function panelFrame(from: MenuBox, to: MenuBox, progress: number, intensity: number): MenuBox {
  const t = Math.min(1, Math.max(0, progress))
  if (t === 0) return { x: from.x, width: from.width }
  if (t === 1) return { x: to.x, width: to.width }
  const span = Math.abs(to.x - from.x)
  const bow = Math.sin(t * Math.PI) * Math.min(1, Math.max(0, intensity))
  return {
    x: from.x + (to.x - from.x) * t - (span * bow) / 2,
    width: from.width + (to.width - from.width) * t + span * bow,
  }
}

export function MorphMegaMenu({
  items = DEFAULT_ITEMS,
  duration,
  intensity,
  size,
  className,
}: MorphMegaMenuProps) {
  const reduced = usePrefersReducedMotion()
  const rootRef = useRef<HTMLElement>(null)
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const frameRef = useRef<MenuBox>({ x: 0, width: SIZE_DEFAULT })
  const rafRef = useRef(0)
  const panelId = useId()
  const ms = menuDuration(duration)
  const power = menuIntensity(intensity)
  const panelWidth = menuPanelSize(size)
  const [active, setActive] = useState(0)
  const [fromIndex, setFromIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [frame, setFrame] = useState<MenuBox>({ x: 0, width: panelWidth })
  const [target, setTarget] = useState<MenuBox>({ x: 0, width: panelWidth })
  const current = items[active]
  const origin = items[fromIndex] ?? current

  useClickOutside(rootRef, () => {
    setOpen(false)
  })

  useLayoutEffect(() => {
    if (!open) return
    const host = rootRef.current
    const trigger = triggerRefs.current[active]
    if (!host || !trigger) return
    const hostBox = host.getBoundingClientRect()
    const triggerBox = trigger.getBoundingClientRect()
    const to = {
      x: panelAnchor(triggerBox.left - hostBox.left, panelWidth, hostBox.width),
      width: panelWidth,
    }
    setTarget(to)
    const from = frameRef.current
    if (reduced || fromIndex === active) {
      frameRef.current = to
      setFrame(to)
      return
    }
    let originTime = Number.NaN
    let stopped = false
    const tick = (time: number) => {
      if (stopped) return
      if (Number.isNaN(originTime)) originTime = time
      const elapsed = time - originTime
      const progress = ms <= 0 ? 1 : Math.min(1, Math.max(0, elapsed / ms))
      const next = panelFrame(from, to, progress, power)
      frameRef.current = next
      setFrame(next)
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else rafRef.current = 0
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      stopped = true
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [active, fromIndex, ms, open, panelWidth, power, reduced])

  function onTrigger(index: number) {
    if (items.length === 0) return
    if (open && active === index) {
      setOpen(false)
      return
    }
    setFromIndex(open ? active : index)
    setActive(index)
    setOpen(true)
  }

  function shift(delta: number) {
    if (items.length === 0) return
    const next = (active + delta + items.length) % items.length
    if (open) setFromIndex(active)
    setActive(next)
    triggerRefs.current[next]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      if (!open) return
      event.preventDefault()
      setOpen(false)
      triggerRefs.current[active]?.focus()
      return
    }
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0
    if (delta === 0) return
    event.preventDefault()
    shift(delta)
  }

  return (
    <nav
      ref={rootRef}
      aria-label="Sections"
      data-slot="morph-mega-menu"
      data-open={open ? "true" : "false"}
      data-duration={String(ms)}
      data-intensity={String(power)}
      data-size={String(panelWidth)}
      className={cn("relative w-full", className)}
      onKeyDown={onKeyDown}
    >
      <div className="flex flex-wrap gap-1">
        {items.map((item, index) => {
          const expanded = open && active === index
          return (
            <button
              key={item.id}
              ref={(node) => {
                triggerRefs.current[index] = node
              }}
              type="button"
              data-item={item.id}
              aria-expanded={expanded}
              aria-controls={panelId}
              tabIndex={index === active ? 0 : -1}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                expanded ? "bg-muted" : "bg-transparent",
              )}
              onClick={() => onTrigger(index)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {open && current && origin ? (
        <div
          id={panelId}
          role="region"
          aria-label={current.title}
          data-slot="morph-mega-panel"
          data-from={origin.id}
          data-to={current.id}
          data-motion={reduced || fromIndex === active ? "snap" : "move"}
          data-x={String(target.x)}
          className="absolute top-full z-20 mt-2 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-lg"
          style={{ left: frame.x, width: frame.width }}
        >
          <p className="text-sm font-medium">{current.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{current.body}</p>
        </div>
      ) : null}
    </nav>
  )
}
