"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/data/data-refresh-state.tsx

import { useId, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type RefreshState =
  | "idle"
  | "checking"
  | "refreshing"
  | "partially_updated"
  | "success"
  | "stale"
  | "offline"
  | "error"
  | "paused"
  | "cancelled"

export interface DataRefreshStateProps {
  state: RefreshState
  label?: string
  progress?: number | null
  errorSummary?: string
  staleness?: string
  updatedCount?: number
  totalCount?: number
  onRefresh?: () => void
  onCancel?: () => void
  onRetry?: () => void
  className?: string
}

const COPY: Record<RefreshState, string> = {
  idle: "Up to date",
  checking: "Checking for updates",
  refreshing: "Refreshing",
  partially_updated: "Partially updated",
  success: "Updated",
  stale: "Data is stale",
  offline: "Offline",
  error: "Refresh failed",
  paused: "Auto-refresh paused",
  cancelled: "Refresh cancelled",
}

export function DataRefreshState({
  state,
  label = "Dataset",
  progress,
  errorSummary,
  staleness,
  updatedCount,
  totalCount,
  onRefresh,
  onCancel,
  onRetry,
  className,
}: DataRefreshStateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const sweep = `dr-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const busy = state === "checking" || state === "refreshing"
  const moving = busy && live && !reduced
  const known = typeof progress === "number"
  const width = known ? `${Math.min(100, Math.max(0, progress * 100))}%` : "40%"

  return (
    <div ref={rootRef} className={cn("w-full rounded-2xl border border-border bg-card p-4 text-foreground motion-reduce:animate-none", className)} data-motion={moving ? "on" : "off"}>
      <style>{`@keyframes ${sweep}{from{transform:translateX(-120%)}to{transform:translateX(280%)}}@media (prefers-reduced-motion:reduce){.${sweep}{animation:none!important}}`}</style>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className={cn("text-xs", state === "error" || state === "offline" ? "text-destructive" : "text-muted-foreground")}>{COPY[state]}</span>
        {staleness ? <span className="text-xs text-muted-foreground">{staleness}</span> : null}
        {typeof updatedCount === "number" && typeof totalCount === "number" ? (
          <span className="font-mono text-xs text-muted-foreground">
            {updatedCount}/{totalCount}
          </span>
        ) : null}
      </div>
      {busy ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={known ? Math.round(progress * 100) : undefined} aria-label={COPY[state]}>
          <div
            className={cn("h-full rounded-full bg-primary", !known && sweep, "motion-reduce:animate-none")}
            style={{
              width,
              animation: !known && moving ? `${sweep} 1.2s ease-in-out infinite` : undefined,
              animationPlayState: moving ? "running" : "paused",
            }}
          />
        </div>
      ) : null}
      {state === "error" && errorSummary ? <p className="mt-2 text-sm text-destructive">{errorSummary}</p> : null}
      <div className="mt-3 flex gap-2">
        {busy && onCancel ? (
          <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        {(state === "error" || state === "offline") && onRetry ? (
          <button type="button" className="min-h-11 rounded-md bg-primary px-3 text-sm text-primary-foreground" onClick={onRetry}>
            Retry
          </button>
        ) : null}
        {!busy && onRefresh ? (
          <button type="button" className="min-h-11 rounded-md border border-border px-3 text-sm" onClick={onRefresh}>
            Refresh
          </button>
        ) : null}
      </div>
    </div>
  )
}
