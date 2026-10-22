"use client"

// Ported from Sera UI (MIT, (c) 2025 Sera UI) — https://github.com/seraui/seraui/blob/main/src/app/docs/verify-badge/verify-badge.tsx

import { useId, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

type VerifyTier = "basic" | "gold" | "premium"

export interface VerifyBadgeProps {
  type?: VerifyTier
  showLabel?: boolean
  label?: string
  className?: string
}

const labels: Record<VerifyTier, string> = {
  basic: "Verified",
  gold: "Gold verified",
  premium: "Premium verified",
}

function cssName(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "")
}

export function VerifyBadge({ type = "basic", showLabel = true, label, className }: VerifyBadgeProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const live = useAnimationActive(rootRef)
  const reduced = usePrefersReducedMotion()
  const id = cssName(useId())
  const text = label ?? labels[type]
  const spin = type === "premium" && live && !reduced
  const tone =
    type === "gold"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-200"
      : type === "premium"
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-200"

  return (
    <span
      ref={rootRef}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tone,
        className,
      )}
      tabIndex={0}
    >
      {type === "basic" ? <BasicMark /> : null}
      {type === "gold" ? <GoldMark id={id} /> : null}
      {type === "premium" ? <PremiumMark id={id} spin={spin} /> : null}
      {showLabel ? <span>{text}</span> : <span className="sr-only">{text}</span>}
    </span>
  )
}

function BasicMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M12 2 4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
      <path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GoldMark({ id }: { id: string }) {
  const gradient = `gold-${id}`
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={`url(#${gradient})`} fillOpacity="0.25" stroke={`url(#${gradient})`} strokeWidth="1.5" />
      <path d="m9.2 12.2 1.8 1.8 3.8-3.8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--foreground)" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function PremiumMark({ id, spin }: { id: string; spin: boolean }) {
  const animation = `spin-${id}`
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <style>{`@keyframes ${animation} { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        className="origin-center motion-reduce:[animation:none]"
        style={{
          transformOrigin: "12px 12px",
          animationName: spin ? animation : "none",
          animationDuration: "8s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: spin ? "running" : "paused",
        }}
      />
      <path d="m10.4 12.1 1.2 1.2 2.4-2.4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
