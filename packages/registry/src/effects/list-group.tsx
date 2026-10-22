"use client"

// Ported from Flowbite (MIT, (c) 2023 Bergside Inc.) — https://github.com/themesberg/flowbite/blob/main/content/components/list-group.md. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ListGroupItem {
  label: string
  href?: string
  description?: string
  value?: string
  meta?: string
  icon?: ReactNode
  image?: string
  imageAlt?: string
  current?: boolean
  disabled?: boolean
  struck?: boolean
  action?: string
}

export interface ListGroupProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "links" | "buttons" | "icons" | "features" | "stats" | "avatars"
  items: readonly ListGroupItem[]
  heading?: ReactNode
}

function rowClass(index: number, total: number, current?: boolean) {
  return cn(
    "block w-full border-b border-border px-4 py-2 text-left text-sm",
    index === 0 && "rounded-t-md",
    index === total - 1 && "rounded-b-md border-b-0",
    current ? "bg-accent text-primary" : "text-foreground hover:bg-accent hover:text-primary",
  )
}

export function ListGroup({ variant = "links", items, heading, className, ...props }: ListGroupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const shell = cn(
    "w-full max-w-sm border border-border bg-background text-foreground",
    reduced ? "transition-none" : "transition-colors",
    variant === "features" || variant === "stats" || variant === "avatars" ? "rounded-lg p-6 shadow-sm" : "rounded-md",
    className,
  )

  return (
    <div {...props} ref={ref} className={shell} data-reduced={reduced ? "true" : "false"} data-slot="list-group" data-variant={variant}>
      {variant === "avatars" && heading ? <h3 className="mb-6 text-xl font-semibold">{heading}</h3> : null}
      {variant === "links" || variant === "icons" ? (
        <div>
          {items.map((item, index) => (
            <a key={item.label} aria-current={item.current ? "page" : undefined} className={cn(rowClass(index, items.length, item.current), "flex items-center")} href={item.href ?? "#"}>
              {variant === "icons" && item.icon ? <span aria-hidden="true" className="me-1.5 inline-flex">{item.icon}</span> : null}
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
      {variant === "buttons" ? (
        <div>
          {items.map((item, index) => (
            <button
              key={item.label}
              aria-current={item.current ? "true" : undefined}
              className={cn(rowClass(index, items.length, item.current), "bg-transparent font-medium", item.disabled && "cursor-not-allowed text-muted-foreground hover:bg-transparent hover:text-muted-foreground")}
              disabled={item.disabled}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      {variant === "features" ? (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.label} className={cn("flex items-center text-foreground", item.struck && "text-muted-foreground line-through")}>
              <span aria-hidden="true" className="me-1.5 inline-flex text-primary">
                {item.icon ?? (
                  <svg className="size-5" fill="none" viewBox="0 0 24 24">
                    <path d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                )}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {variant === "stats" ? (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="inline-flex items-center text-muted-foreground">
                {item.icon ? <span aria-hidden="true" className="me-1.5 inline-flex">{item.icon}</span> : null}
                {item.label}
              </span>
              <span className="font-medium">{item.value}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {variant === "avatars" ? (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 py-4 first:pt-0 last:pb-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
                <img alt={item.imageAlt ?? ""} className="size-8 rounded-full" height={32} src={item.image} width={32} />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.label}</p>
                {item.meta ? <p className="truncate text-sm text-muted-foreground">{item.meta}</p> : null}
              </div>
              {item.action ? (
                <button className="shrink-0 rounded-md border border-border bg-muted px-3 py-1.5 text-xs hover:bg-accent" type="button">
                  {item.action}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
