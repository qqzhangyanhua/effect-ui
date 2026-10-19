"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface GlowHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string
}

function GlowHover({
  className,
  children,
  glowColor = "var(--primary)",
  ...props
}: GlowHoverProps) {
  return (
    <div
      data-slot="glow-hover"
      className={cn(
        "relative rounded-xl transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--glow)_40%,transparent),0_12px_40px_-16px_var(--glow)]",
        className,
      )}
      style={{ "--glow": glowColor } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

export { GlowHover }
