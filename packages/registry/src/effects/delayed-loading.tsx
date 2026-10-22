"use client"

// Ported from HextaUI (MIT, (c) 2026 Preet Suthar) — https://github.com/preetsuthar17/HextaUI/blob/main/hooks/use-delayed-loading.ts

import { useEffect, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface DelayedLoadingProps {
  delay?: number
  minDuration?: number
  label?: string
  loadingLabel?: string
  idleLabel?: string
  className?: string
}

function clock() {
  return Date.now()
}

export function DelayedLoading({
  delay = 150,
  minDuration = 400,
  label = "Load report",
  loadingLabel = "Loading",
  idleLabel = "Idle",
  className,
}: DelayedLoadingProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (loading === visible) return
    if (loading) {
      const timer = window.setTimeout(() => {
        shownAt.current = clock()
        setVisible(true)
      }, Math.max(0, delay))
      return () => window.clearTimeout(timer)
    }
    const remaining = Math.max(0, minDuration - (clock() - shownAt.current))
    const timer = window.setTimeout(() => setVisible(false), remaining)
    return () => window.clearTimeout(timer)
  }, [loading, visible, delay, minDuration])

  return (
    <div ref={rootRef} className={cn("flex flex-col items-center gap-3", className)}>
      <button
        type="button"
        aria-pressed={loading}
        onClick={() => setLoading((current) => !current)}
        className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
      >
        {label}
      </button>
      <p role="status" className="flex min-h-6 items-center gap-2 text-sm text-foreground">
        {visible ? (
          <span
            aria-hidden="true"
            className={cn("size-2.5 rounded-full bg-primary", live && !reduced && "animate-pulse motion-reduce:animate-none")}
          />
        ) : null}
        {visible ? loadingLabel : idleLabel}
      </p>
    </div>
  )
}
