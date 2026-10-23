"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/progress-ring-check.tsx

import { useId, useRef, type CSSProperties, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type ProgressRingCheckStatus = "pending" | "running" | "done" | "failed" | "cancelled"

export interface ProgressRingCheckProps {
  status?: ProgressRingCheckStatus
  progress?: number
  label?: ReactNode
  color?: string
  doneColor?: string
  errorColor?: string
  size?: number
  duration?: number
  speed?: number
  className?: string
}

const CHECK = "M7.5 12.25 10.5 15.25 16.75 8.75"
const CROSS = "M8.5 8.5 15.5 15.5M15.5 8.5 8.5 15.5"
const TEXT: Record<ProgressRingCheckStatus, string> = {
  pending: "Pending",
  running: "In progress",
  done: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function ProgressRingCheck({
  status = "pending",
  progress,
  label,
  color = "var(--foreground)",
  doneColor = "var(--chart-2)",
  errorColor = "var(--destructive)",
  size = 22,
  duration = 1100,
  speed = 1,
  className,
}: ProgressRingCheckProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const spinName = `prc-spin-${useId().replace(/:/g, "")}`
  const strokeWidth = 2
  const radius = 10 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const dashUnit = circumference / 8
  const determinate = status === "running" && typeof progress === "number" && Number.isFinite(progress)
  const indeterminate = status === "running" && !determinate
  const solid = status === "running" || status === "done" || status === "failed"
  const amount = determinate ? clamp01(progress ?? 0) : 1
  const target = indeterminate ? 0.68 : amount
  const mode = solid ? 1 : 0
  const idle = 0.3
  const dash = idle * dashUnit + (target * circumference - idle * dashUnit) * mode
  const gap = (1 - idle) * dashUnit + ((1 - target) * circumference - (1 - idle) * dashUnit) * mode
  const spoken = TEXT[status] + (determinate ? `, ${Math.round(clamp01(progress ?? 0) * 100)}%` : "")
  const hasLabel = label !== undefined && label !== null
  const spinning = indeterminate && !reduced
  const tone = status === "done" ? doneColor : status === "failed" || status === "cancelled" ? errorColor : color

  return (
    <span
      ref={rootRef}
      data-slot="progress-ring-check"
      data-status={status}
      data-motion={live && spinning ? "on" : "off"}
      className={cn("group relative inline-flex items-center gap-2 align-middle leading-none motion-reduce:transition-none", className)}
      style={
        {
          color: tone,
          "--prc-draw": "240ms",
        } as CSSProperties
      }
    >
      <style>{`@keyframes ${spinName}{to{transform:rotate(360deg)}}`}</style>
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        role={hasLabel ? undefined : "img"}
        aria-label={hasLabel ? undefined : spoken}
        aria-hidden={hasLabel || undefined}
        className="shrink-0 overflow-visible motion-reduce:animate-none"
        style={{
          animationName: spinning ? spinName : "none",
          animationDuration: `${duration / Math.max(0.1, speed)}ms`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: live ? "running" : "paused",
        }}
      >
        <circle cx="12" cy="12" r={radius} fill="currentColor" stroke="currentColor" strokeWidth={strokeWidth} fillOpacity={status === "done" || status === "failed" ? 0.08 : 0} strokeOpacity={status === "running" ? 0.2 : 0} transform="rotate(-90 12 12)" />
        <circle cx="12" cy="12" r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${Math.max(0, dash)} ${Math.max(0, gap)}`} opacity={status === "pending" || status === "cancelled" ? 0.55 : 1} transform="rotate(-90 12 12)" />
        <path d={CHECK} pathLength={1} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 2" strokeDashoffset={status === "done" ? 0 : 1.05} opacity={status === "done" ? 1 : 0} className="motion-reduce:transition-none" />
        <path d={CROSS} pathLength={1} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 2" strokeDashoffset={status === "failed" || status === "cancelled" ? 0 : 1.05} opacity={status === "failed" || status === "cancelled" ? 1 : 0} className="motion-reduce:transition-none" />
      </svg>
      {hasLabel ? <span className="sr-only">{spoken}: </span> : null}
      {hasLabel ? (
        <span className="relative text-sm leading-tight" style={{ fontSize: Math.max(12, size - 6) }}>
          {label}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px origin-left -translate-y-1/2 bg-current motion-reduce:transition-none"
            style={{ transform: status === "done" ? "scaleX(1) translateY(-50%)" : "scaleX(0) translateY(-50%)" }}
          />
        </span>
      ) : null}
    </span>
  )
}
