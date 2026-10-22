"use client"

// Ported from Velora UI (MIT, (c) 2026 Aigars Silkalns) — https://github.com/ColorlibHQ/velora-ui/blob/main/src/components/velora/sticky-banner.tsx. Modified for effect-ui.

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StickyBannerProps extends HTMLAttributes<HTMLDivElement> {
  dismissible?: boolean
  onDismiss?: () => void
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function StickyBanner({ dismissible = true, onDismiss, children, className, ...props }: StickyBannerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const finished = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const [phase, setPhase] = useState<"open" | "leaving" | "closed">("open")

  useEffect(() => () => clearTimeout(timer.current), [])

  const finish = () => {
    if (finished.current) return
    finished.current = true
    setPhase("closed")
    onDismiss?.()
  }

  const dismiss = () => {
    const root = ref.current
    const next = root
      ? Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
          (element) =>
            !root.contains(element) &&
            (root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 &&
            element.getClientRects().length > 0,
        )
      : undefined
    next?.focus()
    if (reduced || !motionOn) {
      finish()
      return
    }
    setPhase("leaving")
    timer.current = setTimeout(finish, 240)
  }

  if (phase === "closed") return null

  return (
    <div
      {...props}
      ref={ref}
      role="region"
      aria-label={props["aria-label"] ?? "公告"}
      data-slot="sticky-banner"
      data-state={phase}
      data-reduced={reduced ? "true" : "false"}
      data-motion={motionOn && !reduced ? "on" : "off"}
      onAnimationEnd={(event) => {
        props.onAnimationEnd?.(event)
        if (event.target === event.currentTarget && phase === "leaving") finish()
      }}
      className={cn(
        "sticky top-0 z-[60] flex min-h-11 items-center justify-center gap-3 bg-primary px-4 py-2.5 text-center text-sm text-primary-foreground",
        className,
      )}
    >
      <style>
        {`@keyframes sticky-banner-out { to { transform: translateY(-100%); } }
[data-slot="sticky-banner"][data-state="leaving"][data-motion="on"] { animation: sticky-banner-out 220ms ease-in forwards; }`}
      </style>
      <div className="flex-1">{children}</div>
      {dismissible ? (
        <button
          type="button"
          aria-label="关闭公告"
          onClick={dismiss}
          className="-mr-1 inline-flex size-11 shrink-0 items-center justify-center rounded-md opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
