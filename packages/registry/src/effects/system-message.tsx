"use client"

// Ported from prompt-kit (MIT, (c) 2025 Julien Thibeaut) — https://github.com/ibelick/prompt-kit/blob/main/components/prompt-kit/system-message.tsx. Modified for effect-ui.

import { CircleAlert, Info, TriangleAlert } from "lucide-react"
import type { ComponentProps, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface SystemMessageProps extends ComponentProps<"div"> {
  variant?: "action" | "warning" | "error"
  fill?: boolean
  icon?: ReactNode
  isIconHidden?: boolean
  cta?: {
    label: string
    onClick?: () => void
    variant?: "solid" | "outline" | "ghost"
  }
}

const BUTTON_VARIANT = { solid: "default", outline: "outline", ghost: "ghost" } as const

export function SystemMessage({ children, variant = "action", fill = false, icon, isIconHidden = false, cta, className, ...props }: SystemMessageProps) {
  const reduced = usePrefersReducedMotion()
  const shown = isIconHidden ? null : icon ?? (variant === "error" ? <CircleAlert className="size-4" /> : variant === "warning" ? <TriangleAlert className="size-4" /> : <Info className="size-4" />)
  return (
    <div
      {...props}
      className={cn(
        "flex flex-row items-center gap-3 rounded-xl border py-2 pr-2 pl-3",
        variant === "action" && (fill ? "border-transparent bg-muted text-foreground" : "border-border text-foreground"),
        variant === "warning" && (fill ? "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/20" : "border-amber-600 text-amber-800"),
        variant === "error" && (fill ? "border-transparent bg-destructive/10 text-destructive" : "border-destructive text-destructive"),
        className,
      )}
      data-reduced={reduced ? "true" : "false"}
      data-slot="system-message"
      data-variant={variant}
    >
      <div className="flex flex-1 flex-row items-center gap-3 leading-normal">
        {shown ? <div className="flex h-[1lh] shrink-0 items-center justify-center self-start">{shown}</div> : null}
        <div className="min-w-0 flex-1 text-sm">{children}</div>
      </div>
      {cta ? (
        <Button size="sm" type="button" variant={BUTTON_VARIANT[cta.variant ?? "solid"]} onClick={cta.onClick}>
          {cta.label}
        </Button>
      ) : null}
    </div>
  )
}
