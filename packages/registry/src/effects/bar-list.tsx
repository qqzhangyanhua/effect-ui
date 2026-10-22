"use client"

// Copyright 2025 Tremor
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: replaced cx with cn and the gray/blue palette with theme tokens.
// Ported from Tremor Raw (Apache-2.0) — https://github.com/tremorlabs/tremor/blob/main/src/components/BarList/BarList.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useMemo, type HTMLAttributes } from "react"

export interface BarListItem {
  key?: string
  href?: string
  value: number
  name: string
}

export interface BarListProps extends HTMLAttributes<HTMLDivElement> {
  data: BarListItem[]
  valueFormatter?: (value: number) => string
  showAnimation?: boolean
  onValueChange?: (payload: BarListItem) => void
  sortOrder?: "ascending" | "descending" | "none"
}

export function BarList({
  data = [],
  valueFormatter = (value) => value.toString(),
  showAnimation = false,
  onValueChange,
  sortOrder = "descending",
  className,
  ...props
}: BarListProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const animate = showAnimation && !prefersReducedMotion
  const sorted = useMemo(() => {
    if (sortOrder === "none") return data
    return [...data].sort((a, b) => (sortOrder === "ascending" ? a.value - b.value : b.value - a.value))
  }, [data, sortOrder])
  const widths = useMemo(() => {
    const maxValue = Math.max(...sorted.map((item) => item.value), 0)
    return sorted.map((item) => (item.value === 0 || maxValue === 0 ? 0 : Math.max((item.value / maxValue) * 100, 2)))
  }, [sorted])

  return (
    <div aria-sort={sortOrder} className={cn("flex justify-between gap-6", className)} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="bar-list" {...props}>
      <div className="relative w-full space-y-1.5">
        {sorted.map((item, index) => {
          const row = (
            <div
              className={cn(
                "flex h-8 items-center rounded-sm bg-primary/25 transition-all",
                onValueChange && "group-hover:bg-primary/40",
                animate && "duration-700",
              )}
              style={{ width: `${widths[index] ?? 0}%` }}
            >
              <div className="absolute left-2 max-w-full pr-2">
                {item.href ? (
                  <a className="truncate text-sm whitespace-nowrap hover:underline" href={item.href} onClick={(event) => event.stopPropagation()} rel="noreferrer" target="_blank">
                    {item.name}
                  </a>
                ) : (
                  <p className="truncate text-sm whitespace-nowrap">{item.name}</p>
                )}
              </div>
            </div>
          )
          if (!onValueChange) {
            return <div key={item.key ?? item.name}>{row}</div>
          }
          return (
            <button
              className="group w-full rounded-sm text-left hover:bg-muted/60"
              key={item.key ?? item.name}
              onClick={() => onValueChange(item)}
              type="button"
            >
              {row}
            </button>
          )
        })}
      </div>
      <div>
        {sorted.map((item, index) => (
          <div className={cn("flex h-8 items-center justify-end", index === sorted.length - 1 ? "" : "mb-1.5")} key={item.key ?? item.name}>
            <p className="text-sm leading-none tabular-nums">{valueFormatter(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
