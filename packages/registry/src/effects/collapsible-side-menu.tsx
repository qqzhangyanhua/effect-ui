"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/application/vertical-menu/7.html. Modified for effect-ui.

import { useState, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SideMenuItem {
  id: string
  label: string
  href?: string
  current?: boolean
  badge?: number
  defaultOpen?: boolean
  icon?: ReactNode
  items?: SideMenuItem[]
}

export interface CollapsibleSideMenuProps extends HTMLAttributes<HTMLElement> {
  items: SideMenuItem[]
}

function BadgeCount({ count }: { count: number }) {
  return (
    <span aria-label={`${count} 项`} className="ml-auto rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
      {count}
    </span>
  )
}

function Chevron({ open, reduced }: { open: boolean; reduced: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("size-5 shrink-0", reduced ? "" : "transition-transform duration-300", open && "-rotate-180")}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path clipRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fillRule="evenodd" />
    </svg>
  )
}

function MenuNodes({ items, reduced, nested }: { items: SideMenuItem[]; reduced: boolean; nested?: boolean }) {
  return (
    <ul className={cn("space-y-1", nested && "mt-2 px-4")}>
      {items.map((item) => (
        <MenuNode item={item} key={item.id} reduced={reduced} />
      ))}
    </ul>
  )
}

function MenuNode({ item, reduced }: { item: SideMenuItem; reduced: boolean }) {
  const [open, setOpen] = useState(Boolean(item.defaultOpen))
  const row = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
  const nested = item.items && item.items.length > 0

  if (nested) {
    return (
      <li>
        <details className="group [&_summary::-webkit-details-marker]:hidden" open={open}>
          <summary
            className={cn(row, "cursor-pointer list-none justify-between")}
            onClick={(event) => {
              event.preventDefault()
              setOpen((value) => !value)
            }}
          >
            <span className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </span>
            <span className="flex items-center gap-2">
              {typeof item.badge === "number" ? <BadgeCount count={item.badge} /> : null}
              <Chevron open={open} reduced={reduced} />
            </span>
          </summary>
          <MenuNodes items={item.items ?? []} nested reduced={reduced} />
        </details>
      </li>
    )
  }

  return (
    <li>
      <a aria-current={item.current ? "page" : undefined} className={cn(row, item.current && "bg-muted text-foreground")} href={item.href ?? "#"}>
        {item.icon}
        <span>{item.label}</span>
        {typeof item.badge === "number" ? <BadgeCount count={item.badge} /> : null}
      </a>
    </li>
  )
}

export function CollapsibleSideMenu({ items, className, ...props }: CollapsibleSideMenuProps) {
  const reduced = usePrefersReducedMotion()
  return (
    <nav {...props} aria-label={props["aria-label"] ?? "侧栏"} className={cn("w-full max-w-xs", className)} data-reduced={reduced ? "true" : "false"} data-slot="collapsible-side-menu">
      <MenuNodes items={items} reduced={reduced} />
    </nav>
  )
}
