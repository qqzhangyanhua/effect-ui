"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/blur-glide-menu.tsx

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react"
import { Archive, ArrowLeft, ChevronDown, ChevronRight, Copy, FolderInput, Globe, Inbox, Layers, Palette, Tag, UserPlus, type LucideIcon } from "lucide-react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BlurGlideMenuProps {
  className?: string
}

interface MenuRow {
  id: string
  label: string
  icon?: LucideIcon
  initials?: string
  tint?: string
  dot?: string
  hint?: string
  panel?: MenuPanelData
}

interface MenuPanelData {
  search?: string
  rows: MenuRow[]
}

const rootPanel: MenuPanelData = {
  rows: [
    {
      id: "invite",
      label: "Invite people",
      icon: UserPlus,
      hint: "@",
      panel: {
        search: "Find people",
        rows: [
          { id: "priya", label: "Priya Raman", initials: "PR", tint: "var(--chart-1)" },
          { id: "noah", label: "Noah Whitfield", initials: "NW", tint: "var(--chart-2)" },
          { id: "ines", label: "Ines Duarte", initials: "ID", tint: "var(--chart-3)" },
        ],
      },
    },
    {
      id: "move",
      label: "Move to",
      icon: FolderInput,
      hint: "M",
      panel: {
        search: "Find a space",
        rows: [
          {
            id: "roadmap",
            label: "Roadmap",
            icon: Layers,
            panel: {
              search: "Find a board",
              rows: [
                { id: "quarter", label: "Quarter planning", initials: "QP", tint: "var(--chart-1)" },
                { id: "bets", label: "Platform bets", initials: "PB", tint: "var(--chart-4)" },
                { id: "hiring", label: "Hiring plan", initials: "HP", tint: "var(--chart-2)" },
                { id: "launch", label: "Launch checklist", initials: "LC", tint: "var(--chart-3)" },
              ],
            },
          },
          {
            id: "system",
            label: "Design system",
            icon: Palette,
            panel: {
              search: "Find a board",
              rows: [
                { id: "tokens", label: "Colour tokens", initials: "CT", tint: "var(--chart-5)" },
                { id: "specs", label: "Component specs", initials: "CS", tint: "var(--chart-1)" },
                { id: "icons", label: "Icon set", initials: "IS", tint: "var(--chart-3)" },
              ],
            },
          },
          { id: "site", label: "Marketing site", icon: Globe },
          { id: "support", label: "Support inbox", icon: Inbox },
        ],
      },
    },
    {
      id: "label",
      label: "Set label",
      icon: Tag,
      hint: "L",
      panel: {
        rows: [
          { id: "priority", label: "Priority", dot: "var(--chart-5)" },
          { id: "blocked", label: "Blocked", dot: "var(--chart-2)" },
          { id: "research", label: "Research", dot: "var(--chart-1)" },
          { id: "shipped", label: "Shipped", dot: "var(--chart-3)" },
        ],
      },
    },
    { id: "duplicate", label: "Duplicate", icon: Copy, hint: "⌘D" },
    { id: "archive", label: "Archive", icon: Archive },
  ],
}

function stepAt(trail: string[]) {
  let panel = rootPanel
  let title = ""
  for (const id of trail) {
    const row = panel.rows.find((candidate) => candidate.id === id)
    if (!row?.panel) break
    panel = row.panel
    title = row.label
  }
  return { panel, title }
}

function matches(panel: MenuPanelData, query: string) {
  const term = query.trim().toLowerCase()
  return term ? panel.rows.filter((row) => row.label.toLowerCase().includes(term)) : panel.rows
}

function GlidePanel({
  panel,
  title,
  phase,
  query,
  names,
  reduced,
  panelRef,
  searchRef,
  onQuery,
  onSelect,
  onBack,
}: {
  panel: MenuPanelData
  title: string
  phase: "idle" | "in" | "in-back" | "out" | "out-back"
  query: string
  names: { enter: string; back: string; leave: string; leaveBack: string }
  reduced: boolean
  panelRef?: RefObject<HTMLDivElement | null>
  searchRef?: RefObject<HTMLInputElement | null>
  onQuery?: (value: string) => void
  onSelect?: (row: MenuRow) => void
  onBack?: () => void
}) {
  const [cursor, setCursor] = useState({ index: 0, visible: false })
  const rows = matches(panel, query)
  const leaving = phase === "out" || phase === "out-back"
  const animationName =
    phase === "in" ? names.enter : phase === "in-back" ? names.back : phase === "out" ? names.leave : phase === "out-back" ? names.leaveBack : "none"

  return (
    <div
      ref={panelRef}
      inert={leaving || undefined}
      className={cn("w-full", leaving && "absolute inset-x-0 top-0")}
      style={{
        animationName: reduced ? "none" : animationName,
        animationDuration: "400ms",
        animationTimingFunction: "cubic-bezier(.45,.05,.15,1)",
        animationFillMode: "both",
      }}
    >
      {title ? (
        <>
          <div className="flex h-7 items-center gap-1 pr-1">
            <button
              type="button"
              className="grid size-5 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-ring"
              aria-label={`Back from ${title}`}
              onClick={onBack}
            >
              <ArrowLeft size={13} strokeWidth={1.8} aria-hidden="true" />
            </button>
            {panel.search ? (
              <input
                ref={searchRef}
                data-search=""
                type="text"
                value={query}
                placeholder={panel.search}
                aria-label={panel.search}
                className="min-w-0 flex-1 truncate border-0 bg-transparent p-0 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                onChange={(event) => onQuery?.(event.target.value)}
              />
            ) : (
              <span className="min-w-0 flex-1 truncate text-[11px] text-foreground">{title}</span>
            )}
          </div>
          <div className="my-1 h-px bg-border" />
        </>
      ) : null}
      <div role="menu" className="relative" onMouseLeave={() => setCursor((state) => ({ ...state, visible: false }))}>
        <span
          aria-hidden="true"
          className={cn("pointer-events-none absolute inset-x-0 top-0 h-7 rounded-md bg-muted motion-reduce:transition-none", cursor.visible ? "opacity-100" : "opacity-0")}
          style={{ transform: `translateY(${cursor.index * 28}px)` }}
        />
        {rows.map((row, index) => (
          <button
            key={row.id}
            type="button"
            role="menuitem"
            data-row=""
            aria-haspopup={row.panel ? "menu" : undefined}
            className="group relative z-[1] flex h-7 w-full items-center gap-2 rounded-md bg-transparent px-2 text-left text-[11px] text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline focus-visible:outline-ring"
            onMouseEnter={() => setCursor({ index, visible: true })}
            onFocus={() => setCursor({ index, visible: true })}
            onClick={() => onSelect?.(row)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" && row.panel) {
                event.preventDefault()
                onSelect?.(row)
              }
            }}
          >
            {row.icon ? (
              <span className="grid size-3.5 place-items-center text-muted-foreground">
                <row.icon size={14} strokeWidth={1.7} aria-hidden="true" />
              </span>
            ) : null}
            {row.initials ? (
              <span className="grid size-5 place-items-center rounded-md text-[9px] font-semibold text-foreground" style={{ background: row.tint }} aria-hidden="true">
                {row.initials}
              </span>
            ) : null}
            {row.dot ? <span className="mx-1 size-2 rounded-full" style={{ background: row.dot }} aria-hidden="true" /> : null}
            <span className="min-w-0 flex-1 truncate">{row.label}</span>
            {row.hint ? <span className="font-mono text-[10px] text-muted-foreground">{row.hint}</span> : null}
            {row.panel ? <ChevronRight className="text-muted-foreground group-hover:translate-x-0.5 motion-reduce:transition-none" size={13} aria-hidden="true" /> : null}
          </button>
        ))}
        {rows.length === 0 ? <p className="m-0 flex h-7 items-center px-2 text-[11px] text-muted-foreground">No matches</p> : null}
      </div>
    </div>
  )
}

export function BlurGlideMenu({ className }: BlurGlideMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [open, setOpen] = useState(false)
  const [nav, setNav] = useState<{ trail: string[]; direction: -1 | 0 | 1 }>({ trail: [], direction: 0 })
  const [query, setQuery] = useState("")
  const [leaving, setLeaving] = useState<{ trail: string[]; query: string; direction: -1 | 1 } | null>(null)
  const [height, setHeight] = useState<number>()
  const rawId = useId().replace(/:/g, "")
  const names = {
    enter: `glide-in-${rawId}`,
    back: `glide-back-${rawId}`,
    leave: `glide-out-${rawId}`,
    leaveBack: `glide-out-back-${rawId}`,
  }
  const step = stepAt(nav.trail)

  useEffect(() => {
    const node = activeRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight))
    observer.observe(node)
    return () => observer.disconnect()
  }, [nav, query, open])

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => setLeaving(null), reduced ? 0 : 420)
    return () => window.clearTimeout(timer)
  }, [leaving, reduced])

  useEffect(() => {
    if (open) return
    const timer = window.setTimeout(() => {
      setNav({ trail: [], direction: 0 })
      setQuery("")
      setLeaving(null)
    }, reduced ? 0 : 240)
    return () => window.clearTimeout(timer)
  }, [open, reduced])

  useEffect(() => {
    if (!open) return
    const region = rootRef.current?.parentElement
    if (!region) return
    const handlePointerDown = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    region.addEventListener("pointerdown", handlePointerDown)
    return () => region.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  useEffect(() => {
    if (nav.direction === 0) return
    const target = searchRef.current ?? activeRef.current?.querySelector<HTMLButtonElement>("[data-row]")
    target?.focus({ preventScroll: true })
  }, [nav])

  const enter = (id: string) => {
    setLeaving({ trail: nav.trail, query, direction: 1 })
    setNav({ trail: [...nav.trail, id], direction: 1 })
    setQuery("")
  }

  const back = () => {
    if (!nav.trail.length) return
    setLeaving({ trail: nav.trail, query, direction: -1 })
    setNav({ trail: nav.trail.slice(0, -1), direction: -1 })
    setQuery("")
  }

  const dismiss = () => {
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  const moveFocus = (delta: number) => {
    const rows = Array.from(activeRef.current?.querySelectorAll<HTMLButtonElement>("[data-row]") ?? [])
    if (!rows.length) return
    const index = rows.indexOf(document.activeElement as HTMLButtonElement)
    const next = index < 0 ? (delta > 0 ? 0 : rows.length - 1) : (index + delta + rows.length) % rows.length
    rows[next]?.focus({ preventScroll: true })
  }

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const inSearch = event.target instanceof HTMLElement && event.target.dataset.search !== undefined
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      moveFocus(event.key === "ArrowDown" ? 1 : -1)
      return
    }
    if (!open) return
    if (event.key === "Escape") {
      event.preventDefault()
      if (nav.trail.length) back()
      else dismiss()
      return
    }
    if (event.key === "ArrowLeft" && !inSearch && nav.trail.length) {
      event.preventDefault()
      back()
    }
  }

  return (
    <div
      ref={rootRef}
      data-slot="blur-glide-menu"
      data-motion={live && !reduced ? "on" : "off"}
      className={cn("relative h-48 w-56 text-center text-[11px] text-foreground motion-reduce:transition-none", className)}
      onKeyDown={handleKeyDown}
    >
      <style>
        {`@keyframes ${names.enter}{from{opacity:0;transform:translateX(100%);filter:blur(8px)}to{opacity:1;transform:translateX(0);filter:blur(0)}}@keyframes ${names.back}{from{opacity:0;transform:translateX(-100%);filter:blur(8px)}to{opacity:1;transform:translateX(0);filter:blur(0)}}@keyframes ${names.leave}{from{opacity:1;transform:translateX(0);filter:blur(0)}to{opacity:0;transform:translateX(-100%);filter:blur(9px)}}@keyframes ${names.leaveBack}{from{opacity:1;transform:translateX(0);filter:blur(0)}to{opacity:0;transform:translateX(100%);filter:blur(9px)}}`}
      </style>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-7 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-[11px] text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? dismiss() : setOpen(true))}
      >
        Board actions
        <ChevronDown className={cn("text-muted-foreground motion-reduce:transition-none", open && "rotate-180")} size={13} aria-hidden="true" />
      </button>
      <div
        hidden={!open}
        className="absolute top-9 left-0 z-[1] w-full origin-top rounded-lg border border-border bg-card p-1.5 text-left shadow-md motion-reduce:transition-none"
      >
        <div className="relative overflow-hidden motion-reduce:transition-none" style={{ height }}>
          {leaving ? (
            <GlidePanel
              key={leaving.trail.join("/") || "leaving"}
              {...stepAt(leaving.trail)}
              phase={leaving.direction === 1 ? "out" : "out-back"}
              query={leaving.query}
              names={names}
              reduced={reduced || !live}
            />
          ) : null}
          <GlidePanel
            key={nav.trail.join("/") || "root"}
            {...step}
            phase={nav.direction === 0 ? "idle" : nav.direction === 1 ? "in" : "in-back"}
            query={query}
            names={names}
            reduced={reduced || !live}
            panelRef={activeRef}
            searchRef={step.panel.search ? searchRef : undefined}
            onQuery={setQuery}
            onBack={back}
            onSelect={(row) => (row.panel ? enter(row.id) : dismiss())}
          />
        </div>
      </div>
    </div>
  )
}
