"use client"

// Copyright 2025 Tremor
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Modified by effect-ui: replaced cx with cn, chart color classes with CSS colors, and Tremor Tooltip with the local tooltip.
// Ported from Tremor Raw (Apache-2.0) — https://github.com/tremorlabs/tremor/blob/main/src/components/CategoryBar/CategoryBar.tsx

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { useMemo, type HTMLAttributes } from "react"

export interface CategoryBarMarker {
  value: number
  tooltip?: string
  showAnimation?: boolean
}

export interface CategoryBarProps extends HTMLAttributes<HTMLDivElement> {
  values: number[]
  colors?: string[]
  marker?: CategoryBarMarker
  showLabels?: boolean
}

const FALLBACK = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"]

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function formatNumber(num: number) {
  return Number.isInteger(num) ? num.toString() : num.toFixed(1)
}

function markerColor(marker: number | undefined, values: number[], colors: string[]) {
  if (marker === undefined) return colors[0] ?? FALLBACK[0]
  let prefix = 0
  for (let index = 0; index < values.length; index += 1) {
    prefix += values[index] ?? 0
    if (prefix >= marker) return colors[index] ?? FALLBACK[index % FALLBACK.length]
  }
  return colors[values.length - 1] ?? FALLBACK[0]
}

export function CategoryBar({
  values = [],
  colors = FALLBACK,
  marker,
  showLabels = true,
  className,
  ...props
}: CategoryBarProps) {
  const maxValue = useMemo(() => sum(values), [values])
  const safeMax = maxValue > 0 ? maxValue : 1
  const markerValue = marker === undefined ? undefined : Math.min(Math.max(marker.value, 0), maxValue)
  const left = markerValue === undefined ? 0 : (markerValue / safeMax) * 100
  const swatch = markerColor(markerValue, values, colors.length > 0 ? colors : FALLBACK)

  return (
    <div aria-label="分段比例" aria-valuenow={marker?.value} className={cn("w-full", className)} data-slot="category-bar" {...props}>
      {showLabels ? (
        <div className="relative mb-2 flex h-5 w-full text-sm font-medium text-muted-foreground">
          <span className="absolute bottom-0 left-0">0</span>
          <span className="absolute bottom-0 right-0 tabular-nums">{formatNumber(maxValue)}</span>
        </div>
      ) : null}
      <div className="relative flex h-2 w-full items-center">
        <div className="flex h-full flex-1 items-center gap-0.5 overflow-hidden rounded-full">
          {values.map((value, index) => {
            const percentage = (value / safeMax) * 100
            if (percentage === 0) return null
            return (
              <div
                className="h-full"
                key={`segment-${index}`}
                style={{ width: `${percentage}%`, background: colors[index] ?? FALLBACK[index % FALLBACK.length] }}
              />
            )
          })}
        </div>
        {marker !== undefined ? (
          <div
            className={cn("absolute w-2 -translate-x-1/2", marker.showAnimation && "transition-all duration-300")}
            style={{ left: `${left}%` }}
          >
            {marker.tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div aria-label={marker.tooltip} className="mx-auto h-4 w-1 rounded-full ring-2 ring-background" style={{ background: swatch }} />
                </TooltipTrigger>
                <TooltipContent>{marker.tooltip}</TooltipContent>
              </Tooltip>
            ) : (
              <div className="mx-auto h-4 w-1 rounded-full ring-2 ring-background" style={{ background: swatch }} />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
