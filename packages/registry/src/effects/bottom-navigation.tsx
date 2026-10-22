"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/components/bottom-navigation.md. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BottomNavigationItem {
  label: string
  href?: string
  icon?: ReactNode
  current?: boolean
  featured?: boolean
  onSelect?: () => void
}

export interface BottomNavigationProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "bordered" | "app-bar" | "pagination" | "button-group"
  items: readonly BottomNavigationItem[]
  groups?: readonly { label: string; current?: boolean }[]
  page?: { label: string }
  onPage?: (direction: "previous" | "next") => void
  onGroupSelect?: (label: string) => void
}

function ItemButton({
  item,
  bordered,
  iconOnly,
  className,
}: {
  item: BottomNavigationItem
  bordered?: boolean
  iconOnly?: boolean
  className?: string
}) {
  const shared = cn(
    "group inline-flex flex-col items-center justify-center px-4 text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
    bordered && "border-x border-border",
    item.featured && "size-10 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
    className,
  )
  const body = (
    <>
      {item.icon ? <span aria-hidden="true" className={cn("mb-1", item.featured && "mb-0")}>{item.icon}</span> : null}
      <span className={iconOnly || item.featured ? "sr-only" : undefined}>{item.label}</span>
      {iconOnly && !item.featured ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.label}
        </span>
      ) : null}
    </>
  )
  if (item.href) {
    return (
      <a aria-current={item.current ? "page" : undefined} className={cn(shared, "relative")} href={item.href} onClick={() => item.onSelect?.()}>
        {body}
      </a>
    )
  }
  return (
    <button
      aria-current={item.current ? "page" : undefined}
      className={cn(shared, "relative border-0 bg-transparent")}
      onClick={() => item.onSelect?.()}
      type="button"
    >
      {body}
    </button>
  )
}

export function BottomNavigation({
  variant = "default",
  items,
  groups,
  page,
  onPage,
  onGroupSelect,
  className,
  ...props
}: BottomNavigationProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const iconOnly = variant === "app-bar" || variant === "pagination" || variant === "button-group"
  const floating = variant === "app-bar"
  const columns =
    variant === "pagination" && page ? items.length + 2 : variant === "app-bar" ? Math.max(items.length, 1) : Math.max(items.length, 1)

  const menu = items.map((item, index) => {
    const node = (
      <ItemButton
        key={item.label}
        bordered={variant === "bordered"}
        className={item.featured ? "self-center" : "h-full"}
        iconOnly={iconOnly}
        item={item}
      />
    )
    if (variant === "pagination" && page && index === 2) {
      return [
        <div key="pager" className="col-span-2 flex items-center justify-center">
          <div className="mx-2 flex w-full max-w-[8rem] items-center justify-between rounded-md border border-border bg-muted text-sm">
            <button className="inline-flex h-8 w-6 items-center justify-center rounded-s-md hover:bg-accent" onClick={() => onPage?.("previous")} type="button">
              <span className="sr-only">上一页</span>
              <span aria-hidden="true">‹</span>
            </button>
            <span className="px-1 text-xs font-medium">{page.label}</span>
            <button className="inline-flex h-8 w-6 items-center justify-center rounded-e-md hover:bg-accent" onClick={() => onPage?.("next")} type="button">
              <span className="sr-only">下一页</span>
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>,
        node,
      ]
    }
    return node
  })

  return (
    <nav
      {...props}
      ref={ref}
      aria-label="底部导航"
      className={cn(
        "z-40 w-full border-t border-border bg-background",
        floating ? "bottom-4 left-1/2 max-w-lg -translate-x-1/2 rounded-full border" : "inset-x-0 bottom-0",
        variant === "button-group" ? "h-auto" : "h-16",
        "fixed",
        reduced ? "transition-none" : "transition-colors",
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="bottom-navigation"
      data-variant={variant}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <style>{`[data-slot="bottom-navigation"]{padding-bottom:env(safe-area-inset-bottom)}`}</style>
      {variant === "button-group" && groups && groups.length > 0 ? (
        <div className="mx-auto my-2 grid w-full max-w-xs gap-1 rounded-md bg-muted p-1" role="group" style={{ gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))` }}>
          {groups.map((group) => (
            <button
              key={group.label}
              aria-pressed={group.current ? "true" : "false"}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-medium",
                group.current ? "bg-foreground text-background" : "bg-transparent text-foreground hover:bg-foreground hover:text-background",
              )}
              onClick={() => onGroupSelect?.(group.label)}
              type="button"
            >
              {group.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mx-auto grid h-16 max-w-lg" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {menu}
      </div>
    </nav>
  )
}
