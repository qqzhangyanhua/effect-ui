"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author WittyHydra）— https://github.com/uiverse-io/galaxy/blob/main/Notifications/WittyHydra_nervous-zebra-0.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type HTMLAttributes } from "react"

export interface AchievementToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onAnimationEnd"> {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}

export function AchievementToast({
  title,
  subtitle,
  actionLabel,
  onAction,
  className,
  ...props
}: AchievementToastProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <div
      {...props}
      className={cn("relative h-24 w-72 overflow-hidden rounded-xl bg-card text-card-foreground shadow-lg", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="achievement-toast"
      role="status"
    >
      <style>{`
        @keyframes effect-ui-toast-down {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes effect-ui-toast-flip {
          from { transform: rotateX(90deg); opacity: 0; }
          to { transform: rotateX(0); opacity: 1; }
        }
      `}</style>
      <div
        className="absolute inset-x-0 top-0 flex h-1/2 items-center justify-center bg-primary text-primary-foreground"
        style={{ animation: prefersReducedMotion ? "none" : "effect-ui-toast-down 0.7s ease-out both" }}
      >
        <span
          className="text-lg font-bold tracking-wide"
          style={{ animation: prefersReducedMotion ? "none" : "effect-ui-toast-flip 0.7s ease-in-out both" }}
        >
          {title}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-1/2 items-center justify-between px-4">
        <span className="font-semibold">{subtitle}</span>
        {actionLabel ? (
          <button className="rounded-md bg-foreground px-2 py-1 text-sm font-semibold text-background" onClick={onAction} type="button">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
