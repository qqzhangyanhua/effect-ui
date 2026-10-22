"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author SelfMadeSystem）— https://github.com/uiverse-io/galaxy/blob/main/Buttons/SelfMadeSystem_lucky-cougar-76.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type ButtonHTMLAttributes, type ReactNode } from "react"

export interface LiftGradientBorderButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode
}

export function LiftGradientBorderButton({
  children = "发送消息",
  className,
  ...props
}: LiftGradientBorderButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <button
      {...props}
      className={cn(
        "group/lift relative cursor-pointer rounded-[calc(0.5rem+3px)] border border-border bg-gradient-to-b from-muted to-muted-foreground/50 p-[3px] font-semibold text-foreground shadow-[0_5px_15px_color-mix(in_oklab,var(--foreground)_18%,transparent)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        prefersReducedMotion
          ? "transition-none"
          : "transition duration-300 hover:-translate-y-[5px] hover:shadow-[0_10px_15px_color-mix(in_oklab,var(--foreground)_22%,transparent)] active:translate-y-0 active:shadow-none",
        className,
      )}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="lift-gradient-border-button"
      type="button"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-[inherit] bg-muted-foreground/25",
          prefersReducedMotion ? "hidden" : "transition-transform duration-300 group-hover/lift:translate-y-1.5 group-active/lift:translate-y-0",
        )}
      />
      <span className="relative block rounded-lg bg-gradient-to-b from-background via-muted to-background p-1">
        <span className="flex items-center gap-2 rounded-full bg-gradient-to-b from-muted via-background to-muted px-4 py-2 text-sm">
          <svg aria-hidden className="size-4 fill-foreground" viewBox="0 0 24 24">
            <path d="M3.4 11.7 20.2 3.4c.7-.3 1.4.4 1.1 1.1l-8.3 16.8c-.3.7-1.3.6-1.5-.1l-2.1-6.7-6.7-2.1c-.7-.2-.8-1.2-.3-1.5z" />
          </svg>
          {children}
        </span>
      </span>
    </button>
  )
}
