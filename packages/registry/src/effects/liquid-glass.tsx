"use client"

import * as React from "react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface LiquidGlassProps {
  children?: ReactNode
  className?: string
  /** 回退毛玻璃的叠色倍率。不传或 1 仍是白 10% 底。库组件加载后忽略。 */
  intensity?: number
  /** 回退模糊，像素。不传或 24 仍是 backdrop-blur-xl。库组件加载后忽略。 */
  size?: number
}

function supportsDisplacement() {
  if (typeof window === "undefined") return false
  return CSS.supports("backdrop-filter", "url(#x)") || "CSS" in window
}

function FallbackGlass({ children, className, intensity, size }: LiquidGlassProps) {
  const glass = intensity === undefined || intensity === 1
  const blur = size === undefined || size === 24
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 shadow-lg",
        glass && "border-white/20 bg-white/10",
        blur && "backdrop-blur-xl",
        className,
      )}
      style={
        glass && blur
          ? undefined
          : {
              ...(glass ? {} : { backgroundColor: `rgb(255 255 255 / ${0.1 * intensity})`, borderColor: `rgb(255 255 255 / ${0.2 * intensity})` }),
              ...(blur ? {} : { backdropFilter: `blur(${size}px)` }),
            }
      }
    >
      {children}
    </div>
  )
}

function LiquidGlass({ children, className, intensity, size }: LiquidGlassProps) {
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
    return (
      <FallbackGlass className={className} intensity={intensity} size={size}>
        {children}
      </FallbackGlass>
    )
  }

  return (
    <Impl className={cn("rounded-2xl p-6", className)}>
      {children}
    </Impl>
  )
}

export { LiquidGlass, FallbackGlass }
