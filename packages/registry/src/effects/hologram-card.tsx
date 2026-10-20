"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HologramCardProps {
  title?: string
  detail?: string
  className?: string
}

function HologramCard({
  title = "全息卡片",
  detail = "扫描线、边缘辉光和轻微闪烁。减弱动效时保持静止。",
  className,
}: HologramCardProps) {
  const reduced = usePrefersReducedMotion()

  return (
    <article
      data-slot="hologram-card"
      className={cn(
        "relative isolate w-full max-w-sm overflow-hidden rounded-2xl border border-cyan-200/40 bg-zinc-950 p-6 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.35),0_0_32px_rgba(34,211,238,0.35)]",
        className,
      )}
    >
      <style>
        {`@keyframes effect-ui-holo-scan { to { background-position: 0 28px; } }
          @keyframes effect-ui-holo-flicker { 0%, 19%, 21%, 100% { opacity: 1; } 20% { opacity: 0.72; } }`}
      </style>
      <div
        aria-hidden
        className={cn("pointer-events-none absolute inset-0", !reduced && "motion-safe:animate-[effect-ui-holo-flicker_2.8s_steps(2)_infinite]")}
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(103,232,249,0.16) 2px 3px)",
          backgroundSize: reduced ? undefined : "100% 28px",
          animation: reduced ? undefined : "effect-ui-holo-scan 1.1s linear infinite",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-4 top-0 h-px bg-cyan-200/80" />
      <p className="text-xs tracking-[0.2em] text-cyan-200/80">HOLO</p>
      <h2 className="mt-3 font-display text-3xl tracking-tight">{title}</h2>
      <p className="mt-3 text-sm text-cyan-100/80">{detail}</p>
    </article>
  )
}

export { HologramCard }
