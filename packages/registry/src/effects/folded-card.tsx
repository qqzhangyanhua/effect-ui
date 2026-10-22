"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/folded-card.tsx. Modified for effect-ui.

import { useId, useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const CLIP = "polygon(0 8px, 8px 0, calc(100% - 40px) 0, 100% 40px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px))"

export interface FoldedCardProps extends HTMLAttributes<HTMLDivElement> {
  href?: string
  badge?: ReactNode
  description?: ReactNode
  gridRows?: number
  gridColumns?: number
}

export function FoldedCard({
  className,
  href,
  title,
  badge,
  description,
  gridRows = 4,
  gridColumns = 4,
  children,
  ...props
}: FoldedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const gradientId = useId().replaceAll(":", "")
  const rows = Math.max(1, Math.floor(gridRows))
  const columns = Math.max(1, Math.floor(gridColumns))
  const body = (
    <>
      <div className="pointer-events-none absolute inset-0 z-20" style={{ clipPath: CLIP, background: "var(--border)", padding: 1, mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", maskComposite: "exclude" }} />
      <div className="relative h-[228px] overflow-hidden bg-muted/40">
        <div className="absolute inset-0">
          {Array.from({ length: rows - 1 }, (_, index) => (
            <hr className="absolute w-full border-t border-dashed border-border/30" key={`row-${index + 1}`} style={{ top: `${((index + 1) / rows) * 100}%` }} />
          ))}
          {Array.from({ length: columns - 1 }, (_, index) => (
            <hr className="absolute h-full border-l border-dashed border-border/30" key={`column-${index + 1}`} style={{ left: `${((index + 1) / columns) * 100}%` }} />
          ))}
        </div>
        {children}
      </div>
      <div className="pointer-events-none absolute top-0 right-0 z-30 h-10 w-10" data-slot="folded-card-fold">
        <svg aria-hidden="true" className="h-full w-full" fill="none" viewBox="0 0 40 40">
          <defs>
            <linearGradient id={gradientId} x1="100%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="var(--card)" />
              <stop offset="40%" stopColor="var(--muted)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
          <path d="M0 0 L40 40 L40 0 Z" fill={`url(#${gradientId})`} />
          <line stroke="var(--border)" strokeWidth="1" x1="0" x2="40" y1="0" y2="40" />
          <path d="M36 18 L36 4 L22 4" fill="none" stroke="var(--border)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" />
        </svg>
      </div>
      <div className="flex flex-col gap-2 border-t border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          {title ? <h3 className="text-sm font-medium text-foreground">{title}</h3> : null}
          {badge ? <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">{badge}</span> : null}
        </div>
        {description ? <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
    </>
  )
  const shared = {
    className: cn("relative mx-auto block max-w-sm overflow-hidden bg-card no-underline", className),
    "data-motion": motionOn && !reduced ? "on" : "off",
    "data-reduced": reduced ? "true" : "false",
    "data-slot": "folded-card",
    style: { clipPath: CLIP },
  }
  if (href) {
    return (
      <div ref={ref}>
        <a href={href} {...shared}>
          {body}
        </a>
      </div>
    )
  }
  return (
    <div {...props} {...shared} ref={ref}>
      {body}
    </div>
  )
}
