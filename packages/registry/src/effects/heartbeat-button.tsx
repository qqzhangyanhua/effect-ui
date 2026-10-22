"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/HeartbeatButton.tsx
// buttonheartbeat 关键帧来自 SyntaxUI tailwind.config.ts。

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react"

export interface HeartbeatButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  children?: ReactNode
  color?: string
}

export function HeartbeatButton({ children = "心跳", color = "var(--destructive)", className, ...props }: HeartbeatButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const animate = !prefersReducedMotion && motionOn

  return (
    <button
      {...props}
      ref={ref}
      className={cn("rounded-md px-4 py-1 text-sm font-medium text-primary-foreground", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="heartbeat-button"
      style={{
        background: color,
        animation: animate ? "effect-ui-heartbeat 2s infinite ease-in-out" : "none",
        ["--hb" as string]: color,
      }}
      type="button"
    >
      <style>{`
        @keyframes effect-ui-heartbeat {
          0% { box-shadow: 0 0 0 0 var(--hb); transform: scale(1); }
          50% { box-shadow: 0 0 0 7px color-mix(in oklab, var(--hb), transparent); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 transparent; transform: scale(1); }
        }
      `}</style>
      {children}
    </button>
  )
}
