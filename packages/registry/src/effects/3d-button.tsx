"use client"

// Ported from SyntaxUI（MIT，(c) 2024 SyntaxUI）— https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/3DButton.tsx

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes, type ReactNode } from "react"

export interface ThreeDButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  children?: ReactNode
  color?: string
}

export function ThreeDButton({ children = "立体", color = "var(--primary)", className, ...props }: ThreeDButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <button
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-lg border-b-2 border-foreground/40 px-4 py-1 text-primary-foreground shadow-lg",
        prefersReducedMotion ? "transition-none" : "transition duration-100 active:translate-y-0.5 active:shadow-none",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="3d-button"
      style={{ background: color }}
      type="button"
    >
      <span
        className={cn(
          "absolute h-0 w-0 rounded-full bg-primary-foreground opacity-20",
          prefersReducedMotion ? "transition-none" : "transition-all duration-300 ease-out group-hover:h-32 group-hover:w-32",
        )}
      />
      <span className="relative font-medium">{children}</span>
    </button>
  )
}
