"use client"

// Ported from HyperUI (MIT, (c) Mark Mead) — https://github.com/markmead/hyperui/blob/main/public/examples/application/details-list/1.html. Modified for effect-ui.

import type { HTMLAttributes } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DetailsRow {
  term: string
  detail: string
}

export interface DetailsListProps extends HTMLAttributes<HTMLDListElement> {
  items: DetailsRow[]
  /** plain 仅分隔；striped 隔行底色；bordered 描边；bordered-striped 两者都有。 */
  variant?: "plain" | "striped" | "bordered" | "bordered-striped"
}

export function DetailsList({ items, variant = "plain", className, ...props }: DetailsListProps) {
  const reduced = usePrefersReducedMotion()
  const striped = variant === "striped" || variant === "bordered-striped"
  const bordered = variant === "bordered" || variant === "bordered-striped"

  return (
    <dl
      {...props}
      className={cn(
        "divide-y divide-border text-sm",
        bordered && "rounded-md border border-border",
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="details-list"
      data-variant={variant}
    >
      {items.map((row) => (
        <div
          key={row.term}
          className={cn(
            "grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4",
            variant === "plain" ? "py-3" : "p-3",
            striped && "even:bg-muted",
          )}
        >
          <dt className="font-medium text-foreground">{row.term}</dt>
          <dd className="text-muted-foreground sm:col-span-2">{row.detail}</dd>
        </div>
      ))}
    </dl>
  )
}
