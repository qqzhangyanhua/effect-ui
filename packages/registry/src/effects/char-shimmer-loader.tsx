"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/shimmer-loader.tsx and https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/registry/components/shimmer-loader.tsx. Modified for effect-ui.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useEffect, useRef, useState, type HTMLAttributes } from "react"

interface ShimmerColor {
  r: number
  g: number
  b: number
}

function computeShimmerColors(totalWidth: number, shimmerPos: number, pulse: number): ShimmerColor[] {
  const shimmerRadius = Math.floor(totalWidth / 2.5)
  const colors: ShimmerColor[] = []
  for (let index = 0; index < totalWidth; index += 1) {
    const dist = Math.abs(index - shimmerPos)
    const shimmer = Math.max(0, 1 - dist / Math.max(1, shimmerRadius))
    const baseR = 36 + (index / totalWidth) * 10
    const baseG = 20 + (index / totalWidth) * 8
    const baseB = 100 + (index / totalWidth) * 20
    const pulseScale = 1 + pulse * 0.06
    colors.push({
      r: Math.min(255, Math.round((baseR + (200 - baseR) * shimmer * 0.6) * pulseScale)),
      g: Math.min(255, Math.round((baseG + (165 - baseG) * shimmer * 0.6) * pulseScale)),
      b: Math.min(255, Math.round((baseB + (255 - baseB) * shimmer * 0.7) * pulseScale)),
    })
  }
  return colors
}

export interface CharShimmerLoaderProps extends HTMLAttributes<HTMLDivElement> {
  labels: string[]
  icons?: string[]
  duration?: number
  tokenTarget?: number
  showPercent?: boolean
  fontSize?: number
  paddingY?: number
  cellPadding?: number
  textClassName?: string
  onComplete?: () => void
}

export function CharShimmerLoader({
  labels,
  icons = ["✦"],
  duration = 3000,
  tokenTarget,
  showPercent = true,
  fontSize = 14,
  paddingY = 4,
  cellPadding = 2,
  textClassName = "text-background",
  onComplete,
  className,
  ...props
}: CharShimmerLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const onCompleteRef = useRef(onComplete)
  const [frame, setFrame] = useState(0)
  const safeLabels = labels.length > 0 ? labels : ["…"]
  const safeIcons = icons.length > 0 ? icons : ["✦"]

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!reduced) return
    const timer = window.setTimeout(() => onCompleteRef.current?.(), 0)
    return () => window.clearTimeout(timer)
  }, [reduced])

  useEffect(() => {
    if (!active) return
    const fps = 40
    const frameMs = 1000 / fps
    const total = Math.max(1, Math.round(duration / frameMs))
    let current = 0
    let last = 0
    let raf = 0
    let finished = false
    const draw = (ts: number) => {
      if (ts - last < frameMs - 1) {
        raf = requestAnimationFrame(draw)
        return
      }
      last = ts
      setFrame(current)
      if (current >= total) {
        if (!finished) {
          finished = true
          onCompleteRef.current?.()
        }
        return
      }
      current += 1
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [active, duration, labels, icons])

  const fps = 40
  const total = Math.max(1, Math.round(duration / (1000 / fps)))
  const shownFrame = reduced ? total : frame
  const progress = Math.min(shownFrame / total, 1)
  const percent = Math.round(progress * 100)
  const slice = Math.max(1, Math.floor(total / safeLabels.length))
  const labelIndex = Math.min(Math.floor(shownFrame / slice), safeLabels.length - 1)
  const label = safeLabels[labelIndex] ?? safeLabels[0] ?? "…"
  const done = shownFrame >= total
  const icon = done ? "⌘" : safeIcons[Math.floor(shownFrame / 5) % safeIcons.length] ?? "✦"
  const percentBudget = showPercent ? " 100%".length : 0
  const longest = Math.max(...safeLabels.map((item) => ` ${item} `.length + percentBudget))
  const barWidth = longest + cellPadding * 2
  const shimmerRadius = Math.floor(barWidth / 2.5)
  const shimmerCycle = barWidth + shimmerRadius * 2
  const shimmerPos = reduced ? 0 : ((shownFrame * 1.2) % shimmerCycle) - shimmerRadius
  const pulse = reduced ? 0 : Math.sin(shownFrame * 0.18)
  const percentText = showPercent ? ` ${percent}%` : ""
  const inner = ` ${label}${percentText} `.padEnd(longest)
  const content = `${" ".repeat(cellPadding)}${inner}${" ".repeat(cellPadding)}`.split("")
  const cellColors = computeShimmerColors(barWidth, shimmerPos, pulse)
  const iconChannel = done ? 200 : Math.round(160 + pulse * 25)

  return (
    <div
      {...props}
      ref={ref}
      aria-label={label}
      className={cn("inline-flex items-center gap-2 font-mono", className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="char-shimmer-loader"
      role="status"
      style={{ fontSize }}
    >
      <span className="leading-none" style={{ color: `rgb(${iconChannel}, 110, 255)`, fontSize: fontSize * 1.15 }}>
        {icon}
      </span>
      <span className="inline-flex leading-none whitespace-pre">
        {Array.from({ length: barWidth }, (_, index) => {
          const color = cellColors[index]
          return (
            <span
              key={index}
              className={cn("inline-block whitespace-pre", textClassName)}
              style={{
                padding: `${paddingY}px 0`,
                backgroundColor: color ? `rgb(${color.r},${color.g},${color.b})` : undefined,
              }}
            >
              {content[index] ?? " "}
            </span>
          )
        })}
      </span>
      {tokenTarget !== undefined ? (
        <span className="text-muted-foreground tabular-nums" style={{ fontSize: fontSize * 0.85 }}>
          {(progress * tokenTarget).toFixed(1)}k
        </span>
      ) : null}
    </div>
  )
}
