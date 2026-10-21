"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const HOLO = "#67e8f9"
const HOLO_CSS = `@keyframes effect-ui-holo-scan { to { background-position: 0 28px; } }
          @keyframes effect-ui-holo-flicker { 0%, 19%, 21%, 100% { opacity: 1; } 20% { opacity: 0.72; } }`

export interface HologramCardProps {
  title?: string
  detail?: string
  className?: string
  /** 扫描一周，毫秒。不传或 1100 仍是 1.1 秒。 */
  duration?: number
  /** 扫描线和闪烁强度。不传或 1 时闪烁仍落到 0.72，扫描线仍是 0.16。 */
  intensity?: number
  /** 辉光颜色。不传或 #67e8f9 仍用现在的青色。 */
  color?: string
}

function HologramCard({
  title = "全息卡片",
  detail = "扫描线、边缘辉光和轻微闪烁。减弱动效时保持静止。",
  className,
  duration,
  intensity,
  color,
}: HologramCardProps) {
  const reduced = usePrefersReducedMotion()
  const ms = duration === undefined || duration === 1100 ? 1100 : duration
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const painted = color === undefined || color.toLowerCase() === HOLO
  const canonical = ms === 1100 && gain === 1 && painted
  const dip = gain === 1 ? 0.72 : 1 - 0.28 * gain
  const line = gain === 1 ? 0.16 : 0.16 * gain
  const flicker = ms === 1100 ? 2.8 : (2.8 * ms) / 1100

  return (
    <article
      data-slot="hologram-card"
      className={cn(
        "relative isolate w-full max-w-sm overflow-hidden rounded-2xl border bg-zinc-950 p-6",
        painted && "border-cyan-200/40 text-cyan-50 shadow-[0_0_0_1px_rgba(103,232,249,0.35),0_0_32px_rgba(34,211,238,0.35)]",
        className,
      )}
      style={
        painted
          ? undefined
          : {
              borderColor: color,
              color,
              boxShadow: `0 0 0 1px ${color}, 0 0 32px ${color}`,
            }
      }
    >
      <style>
        {canonical
          ? HOLO_CSS
          : `@keyframes effect-ui-holo-scan { to { background-position: 0 28px; } }
          @keyframes effect-ui-holo-flicker { 0%, 19%, 21%, 100% { opacity: 1; } 20% { opacity: ${dip}; } }`}
      </style>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          !reduced && canonical && "motion-safe:animate-[effect-ui-holo-flicker_2.8s_steps(2)_infinite]",
        )}
        style={{
          backgroundImage:
            gain === 1 && painted
              ? "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(103,232,249,0.16) 2px 3px)"
              : `repeating-linear-gradient(to bottom, transparent 0 2px, ${painted ? `rgba(103,232,249,${line})` : `color-mix(in srgb, ${color} ${Math.round(line * 100)}%, transparent)`} 2px 3px)`,
          backgroundSize: reduced ? undefined : "100% 28px",
          animation: reduced
            ? undefined
            : canonical
              ? "effect-ui-holo-scan 1.1s linear infinite"
              : `effect-ui-holo-scan ${ms}ms linear infinite, effect-ui-holo-flicker ${flicker}s steps(2) infinite`,
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
