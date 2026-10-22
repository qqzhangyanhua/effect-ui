"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/thinking-bar.tsx. Modified for effect-ui.

import { ChevronRight } from "lucide-react"
import { useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ThinkingBarProps {
  className?: string
  text?: string
  onStop?: () => void
  stopLabel?: string
  onClick?: () => void
}

export function ThinkingBar({ className, text = "思考中", onStop, stopLabel = "立即回答", onClick }: ThinkingBarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const active = !reduced && motionOn
  const label = (
    <span
      className={cn("font-medium", active ? "bg-clip-text text-transparent" : "text-foreground")}
      style={
        active
          ? {
              backgroundImage: "linear-gradient(to right, var(--muted-foreground) 40%, var(--foreground) 60%, var(--muted-foreground) 80%)",
              backgroundSize: "200% auto",
              animation: "thinking-bar-shimmer 4s linear infinite",
            }
          : undefined
      }
    >
      {text}
    </span>
  )

  return (
    <div ref={ref} className={cn("flex w-full items-center justify-between gap-3", className)} data-reduced={reduced ? "true" : "false"} data-slot="thinking-bar">
      <style>{"@keyframes thinking-bar-shimmer { from { background-position: 200% 50%; } to { background-position: -200% 50%; } }"}</style>
      {onClick ? (
        <button className="flex items-center gap-1 text-sm" type="button" onClick={onClick}>
          {label}
          <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
        </button>
      ) : (
        label
      )}
      {onStop ? (
        <button className="border-b border-dotted border-muted-foreground/50 text-sm text-muted-foreground hover:border-foreground hover:text-foreground" type="button" onClick={onStop}>
          {stopLabel}
        </button>
      ) : null}
    </div>
  )
}
