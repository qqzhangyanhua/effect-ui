"use client"

// Ported from Velora UI (MIT, (c) 2026 Aigars Silkalns) — https://github.com/ColorlibHQ/velora-ui/blob/main/src/components/velora/tweet-card.tsx. Modified for effect-ui.

import { useRef, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TweetCardProps extends Omit<HTMLAttributes<HTMLElement>, "content"> {
  name: string
  handle: string
  content: ReactNode
  avatar?: string
  time?: string
  verified?: boolean
}

export function TweetCard({ name, handle, content, avatar, time, verified = false, className, ...props }: TweetCardProps) {
  const ref = useRef<HTMLElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)

  return (
    <figure
      {...props}
      ref={ref}
      data-slot="tweet-card"
      data-reduced={reduced ? "true" : "false"}
      data-motion={motionOn && !reduced ? "on" : "off"}
      className={cn(
        "flex w-full max-w-sm flex-col gap-3 rounded-2xl border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/40",
        className,
      )}
    >
      <header className="flex items-center gap-3">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
          <img loading="lazy" decoding="async" src={avatar} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {name.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="truncate text-sm font-semibold">{name}</span>
            {verified ? (
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 fill-primary" aria-label="已认证" role="img">
                <path d="M12 2l2.4 1.8 3-.3 1 2.8 2.6 1.5-1 2.9 1 2.9-2.6 1.5-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3 16.2l1-2.9-1-2.9 2.6-1.5 1-2.8 3 .3z" />
                <path d="M8.5 12.2l2.3 2.3 4.5-4.6" fill="none" stroke="var(--card)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </div>
          <p className="truncate text-sm text-muted-foreground">@{handle}</p>
        </div>
        {time ? <time className="shrink-0 text-xs text-muted-foreground">{time}</time> : null}
      </header>
      <blockquote className="text-sm leading-relaxed text-pretty">{content}</blockquote>
    </figure>
  )
}
