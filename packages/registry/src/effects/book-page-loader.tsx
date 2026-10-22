"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author vinodjangid07）— https://github.com/uiverse-io/galaxy/blob/main/loaders/vinodjangid07_good-cow-5.html. Modified for effect-ui.

import { useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface BookPageLoaderProps extends HTMLAttributes<HTMLDivElement> {
  pageColor?: string
  coverColor?: string
  duration?: number
}

export function BookPageLoader({ pageColor = "var(--primary)", coverColor = "var(--foreground)", duration = 0.75, className, ...props }: BookPageLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const cycle = Math.max(0.2, duration)

  return (
    <div {...props} ref={ref} aria-label="加载中" className={cn("inline-flex items-center justify-center", className)} data-reduced={reduced ? "true" : "false"} data-slot="book-page-loader" role="status">
      <style>{"@keyframes book-page-loader-paging { 10% { transform: rotateZ(0deg); } 100% { transform: rotateZ(-180deg); } }"}</style>
      <span aria-hidden className="relative flex h-3 w-36 items-start justify-end border-b-2" style={{ backgroundColor: pageColor, borderColor: coverColor }}>
        <span className="h-0.5 w-1/2 origin-left" style={{ backgroundColor: pageColor, animation: active ? `book-page-loader-paging ${cycle}s ease-out infinite` : "none" }} />
        <span className="absolute h-0.5 w-1/2 origin-left" style={{ backgroundColor: pageColor, animation: active ? `book-page-loader-paging ${cycle + 0.1}s ease-out infinite` : "none" }} />
      </span>
    </div>
  )
}
