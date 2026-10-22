"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/NeubrutalismButton.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes, type ReactNode } from "react"

export interface NeubrutalismButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  children?: ReactNode
  color?: string
}

export function NeubrutalismButton({
  children = "粗野",
  color = "var(--primary)",
  className,
  ...props
}: NeubrutalismButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <button
      {...props}
      className={cn("group/button rounded-lg bg-foreground text-foreground", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="neubrutalism-button"
      type="button"
    >
      <span
        className={cn(
          "block -translate-x-1 -translate-y-1 rounded-lg border-2 border-foreground px-4 py-1 text-sm font-medium text-primary-foreground",
          prefersReducedMotion
            ? "transition-none"
            : "transition-transform group-hover/button:-translate-y-2 group-active/button:translate-x-0 group-active/button:translate-y-0",
        )}
        style={{ background: color }}
      >
        {children}
      </span>
    </button>
  )
}
