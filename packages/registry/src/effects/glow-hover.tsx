"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlowHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
  speed?: number
  intensity?: number
  size?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const REST =
  "relative rounded-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--glow)_40%,transparent),0_12px_40px_-16px_var(--glow)] pointer-coarse:shadow-[0_0_0_1px_color-mix(in_oklab,var(--glow)_40%,transparent),0_12px_40px_-16px_var(--glow)]"

function GlowHover({ className, children, glowColor = "var(--primary)", speed, intensity, size, ...props }: GlowHoverProps) {
  const canonical = (speed === undefined || speed === 1) && (intensity === undefined || intensity === 1) && (size === undefined || size === 40)
  const mix = `${40 * (intensity ?? 1)}%`
  const blur = `${size ?? 40}px`
  const shadow = `0 0 0 1px color-mix(in oklab, var(--glow) ${mix}, transparent), 0 12px ${blur} -16px var(--glow)`

  return (
    <div
      data-slot="glow-hover"
      className={cn(
        canonical
          ? REST
          : "relative rounded-xl transition-[box-shadow,transform] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:[box-shadow:var(--glow-shadow)] pointer-coarse:[box-shadow:var(--glow-shadow)]",
        className,
      )}
      style={
        {
          "--glow": glowColor,
          "--glow-shadow": canonical ? undefined : shadow,
          transitionDuration: canonical ? undefined : `${300 / pace(speed)}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

export { GlowHover }
