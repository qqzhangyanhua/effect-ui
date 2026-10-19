"use client"

import * as React from "react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface LiquidGlassProps {
  children?: ReactNode
  className?: string
}

function supportsDisplacement() {
  if (typeof window === "undefined") return false
  return CSS.supports("backdrop-filter", "url(#x)") || "CSS" in window
}

function FallbackGlass({ children, className }: LiquidGlassProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  )
}

function LiquidGlass({ children, className }: LiquidGlassProps) {
  const [Impl, setImpl] = React.useState<ComponentType<{
    children?: ReactNode
    className?: string
  }> | null>(null)

  React.useEffect(() => {
    if (!supportsDisplacement()) return
    void import("liquid-glass-react")
      .then((mod) => {
        const Candidate = (mod.default ?? (mod as { LiquidGlass?: ComponentType<{ children?: ReactNode }> }).LiquidGlass) as
          | ComponentType<{ children?: ReactNode; className?: string }>
          | undefined
        if (Candidate) setImpl(() => Candidate)
      })
      .catch(() => undefined)
  }, [])

  if (!Impl) {
    return <FallbackGlass className={className}>{children}</FallbackGlass>
  }

  return (
    <Impl className={cn("rounded-2xl p-6", className)}>
      {children}
    </Impl>
  )
}

export { LiquidGlass, FallbackGlass }
