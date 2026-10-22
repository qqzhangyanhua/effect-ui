"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/texture-card.tsx. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TextureCardProps extends HTMLAttributes<HTMLDivElement> {
  styled?: boolean
}

function Shell({ children, styled }: { children: ReactNode; styled: boolean }) {
  if (styled) {
    return (
      <div className="rounded-[24px] border border-white/60 bg-gradient-to-b from-neutral-100 to-white/70 dark:border-stone-950/60 dark:from-neutral-800 dark:to-neutral-900">
        <div className="rounded-[23px] border border-black/10 dark:border-neutral-900/80">
          <div className="rounded-[22px] border border-white/50 dark:border-neutral-950">
            <div className="rounded-[21px] border border-neutral-950/20 dark:border-neutral-900/70">
              <div className="w-full rounded-[20px] border border-white/50 text-neutral-500 dark:border-neutral-700/50">{children}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="rounded-[calc(var(--radius))] border border-white/60 dark:border-border/30">
      <div className="rounded-[calc(var(--radius)-1px)] border border-black/10 dark:border-neutral-900/80">
        <div className="rounded-[calc(var(--radius)-2px)] border border-white/50 dark:border-neutral-950">
          <div className="rounded-[calc(var(--radius)-3px)] border border-neutral-950/20 dark:border-neutral-900/70">
            <div className="w-full rounded-[calc(var(--radius)-4px)] border border-white/50 bg-gradient-to-b from-card/70 to-secondary/50 text-neutral-500 dark:border-neutral-700/50">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TextureCard({ className, styled = false, children, ...props }: TextureCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  return (
    <div
      {...props}
      ref={ref}
      className={cn("text-neutral-500", className)}
      data-motion={motionOn && !reduced ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="texture-card"
    >
      <Shell styled={styled}>{children}</Shell>
    </div>
  )
}

export function TextureCardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("first:pt-6 last:pb-6", className)} data-slot="texture-card-header" {...props} />
}

export function TextureCardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("pl-2 text-lg font-semibold leading-tight text-neutral-900 dark:text-neutral-100", className)} data-slot="texture-card-title" {...props} />
}

export function TextureCardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("pl-2 text-sm text-neutral-600 dark:text-neutral-400", className)} {...props} />
}

export function TextureCardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-4", className)} {...props} />
}

export function TextureCardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center justify-between gap-2 px-6 py-4", className)} {...props} />
}

export function TextureSeparator() {
  return <div className="border border-b-neutral-300/50 border-l-transparent border-r-transparent border-t-neutral-50 dark:border-b-neutral-700/50 dark:border-t-neutral-950" />
}
