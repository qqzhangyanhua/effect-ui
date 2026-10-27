"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GlareHoverProps {
  className?: string
  children?: React.ReactNode
  speed?: number
  intensity?: number
  scale?: number
  color?: string
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function plainWhite(color: string | undefined) {
  if (!color) return true
  const value = color.trim().toLowerCase()
  return value === "#fff" || value === "#ffffff" || value === "white"
}

function GlareHover({ className, children, speed, intensity, scale, color }: GlareHoverProps) {
  const reduced = usePrefersReducedMotion()
  const keepSpeed = speed === undefined || speed === 1
  const white = plainWhite(color)
  const keepBand = (intensity === undefined || intensity === 1) && white
  const keepScale = scale === undefined || scale === 1
  const alpha = 0.75 * (intensity ?? 1)
  const band = white ? `rgb(255 255 255 / ${alpha})` : color

  return (
    <div
      data-slot="glare-hover"
      className={cn(
        "group relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card p-6 shadow-sm",
        className,
      )}
    >
      {children ?? (
        <div>
          <p className="text-xs tracking-[0.22em] text-muted-foreground">HOVER</p>
          <p className="mt-2 font-display text-3xl tracking-tight">对角高光扫过</p>
        </div>
      )}
      {reduced ? null : (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-[-20%] -left-1/3 rotate-12 opacity-0 transition ease-out pointer-fine:group-hover:translate-x-[280%] pointer-fine:group-hover:opacity-100 pointer-coarse:translate-x-[40%] pointer-coarse:opacity-100 motion-reduce:hidden",
            keepSpeed && "duration-700",
            keepScale && "w-1/2",
            keepBand && "bg-linear-to-r from-transparent via-white/75 to-transparent",
          )}
          style={{
            transitionDuration: keepSpeed ? undefined : `${700 / pace(speed)}ms`,
            width: keepScale ? undefined : `${50 * (scale ?? 1)}%`,
            backgroundImage: keepBand ? undefined : `linear-gradient(to right, transparent, ${band}, transparent)`,
          }}
        />
      )}
    </div>
  )
}

export { GlareHover }
