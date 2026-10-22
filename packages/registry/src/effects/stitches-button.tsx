"use client"

// Ported from SyntaxUI (MIT, (c) 2024 SyntaxUI) — https://github.com/SyntaxUI/syntaxui/blob/main/src/showcase/components/button/StitchesButton.tsx
// SyntaxUI credits the stitches button to Saud (https://twitter.com/via_saud).

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes, type ReactNode } from "react"

export interface StitchesButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode
}

export function StitchesButton({ children = "缝线", className, ...props }: StitchesButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <button
      {...props}
      className={cn(
        "group relative rounded-lg border-2 border-red-500 bg-red-500 px-5 py-1 text-sm font-medium text-white hover:shadow-lg hover:shadow-red-500/50",
        prefersReducedMotion ? "transition-none" : "transition duration-300",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="stitches-button"
      type="button"
    >
      <span className="absolute inset-0 rounded-md border border-dashed border-red-50 shadow-inner shadow-white/30 group-active:shadow-white/10" />
      <span className="absolute inset-0 rotate-180 rounded-md shadow-inner shadow-black/30 group-active:shadow-black/10" />
      <span className="relative">{children}</span>
    </button>
  )
}
