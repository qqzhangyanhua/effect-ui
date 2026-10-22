"use client"

// Ported from Uiverse galaxy（MIT，(c) 2023 Uiverse.io, author vinodjangid07）— https://github.com/uiverse-io/galaxy/blob/main/Tooltips/vinodjangid07_mighty-elephant-52.html

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { type HTMLAttributes, type ReactNode } from "react"

export interface SocialFollowTooltipProps extends HTMLAttributes<HTMLElement> {
  icon?: ReactNode
  name?: string
  handle?: string
  stats?: string
  href?: string
}

function PersonIcon() {
  return (
    <svg aria-hidden className="h-4 w-auto fill-current" viewBox="0 0 95 114">
      <rect height="57" rx="28.5" width="57" x="19" />
      <path d="M0 109.5C0 83.3 21.3 62 47.5 62S95 83.3 95 109.5V114H0v-4.5z" />
    </svg>
  )
}

export function SocialFollowTooltip({
  icon,
  name = "关注",
  handle,
  stats = "45k",
  href,
  className,
  ...props
}: SocialFollowTooltipProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const classes = cn(
    "group/follow relative inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground",
    className,
  )
  const body = (
    <>
      <style>{`
        [data-slot="social-follow-tooltip"] .follow-tip {
          top: 0.4rem;
          opacity: 0;
          transition: top 0.3s, opacity 0.3s;
        }
        [data-slot="social-follow-tooltip"]:hover .follow-tip,
        [data-slot="social-follow-tooltip"]:focus-within .follow-tip {
          top: -2.4rem;
          opacity: 1;
        }
        [data-slot="social-follow-tooltip"][data-reduced="true"] .follow-tip {
          transition: none;
        }
      `}</style>
      <span
        aria-hidden
        className="follow-tip pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-xl border border-border bg-popover px-2 py-1 text-xs font-medium whitespace-nowrap text-popover-foreground shadow-sm"
      >
        {handle ? `@${handle} · ${stats}` : stats}
        <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b border-border bg-popover" />
      </span>
      {icon ?? <PersonIcon />}
      <span>{name}</span>
    </>
  )

  if (href) {
    return (
      <a {...props} className={classes} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="social-follow-tooltip" href={href}>
        {body}
      </a>
    )
  }

  return (
    <div {...props} className={classes} data-reduced={prefersReducedMotion ? "true" : "false"} data-slot="social-follow-tooltip" tabIndex={0}>
      {body}
    </div>
  )
}
