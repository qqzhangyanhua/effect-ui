"use client"

import { useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface HoverOverlayRevealProps {
  title: string
  action?: string
  href?: string
  overlayOpacity?: number
  duration?: number
  from?: "bottom" | "center"
  className?: string
  children?: ReactNode
}

function coarsePointer() {
  return window.matchMedia("(pointer: coarse)").matches
}

export function HoverOverlayReveal({
  title,
  action = "查看",
  href,
  overlayOpacity = 0.55,
  duration = 320,
  from = "bottom",
  className,
  children,
}: HoverOverlayRevealProps) {
  const [open, setOpen] = useState(false)
  const [hovering, setHovering] = useState(false)
  const reduced = usePrefersReducedMotion()
  const centered = from === "center"
  const shown = open || hovering
  const scrim = `color-mix(in oklab, var(--foreground) ${Math.round(overlayOpacity * 100)}%, transparent)`

  function onClick(event: MouseEvent<HTMLElement>) {
    if (!coarsePointer()) return
    if (!open) {
      event.preventDefault()
      setOpen(true)
      return
    }
    if (!href) {
      event.preventDefault()
      setOpen(false)
    }
  }

  function onPointerEnter(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || coarsePointer()) return
    setHovering(true)
  }

  function onFocus() {
    if (coarsePointer()) return
    setHovering(true)
  }

  function onBlur() {
    setHovering(false)
    setOpen(false)
  }

  const copy = (
    <div
      className="max-w-xs transition-transform motion-reduce:transform-none motion-reduce:transition-none"
      style={{
        transform: shown ? "translateY(0)" : centered ? "translateY(0.5rem)" : "translateY(1rem)",
        transitionDuration: `${reduced ? 0 : duration}ms`,
      }}
    >
      <p className="font-display text-2xl tracking-tight text-background">{title}</p>
      <span className="mt-3 inline-flex rounded-full bg-background px-3 py-1.5 text-sm text-foreground">{action}</span>
    </div>
  )

  const frame = (
    <>
      <div className="absolute inset-0">{children ?? <div className="h-full w-full bg-linear-to-br from-primary/30 via-muted to-accent/40" />}</div>
      <div
        data-slot="hover-overlay-reveal-scrim"
        className={cn(
          "absolute inset-0 flex p-5 transition-opacity motion-reduce:transition-none",
          centered ? "items-center justify-center text-center" : "items-end",
        )}
        style={
          {
            backgroundColor: scrim,
            opacity: shown ? 1 : 0,
            transitionDuration: `${reduced ? 0 : duration}ms`,
          } as CSSProperties
        }
      >
        {copy}
      </div>
    </>
  )

  const shared = cn(
    "group relative block aspect-4/3 overflow-hidden rounded-2xl border border-border bg-muted motion-reduce:transition-none",
    className,
  )

  if (href) {
    return (
      <a
        href={href}
        data-slot="hover-overlay-reveal"
        data-motion={reduced ? "off" : "on"}
        data-from={from}
        data-open={open ? "true" : "false"}
        data-revealed={shown ? "true" : "false"}
        className={shared}
        onClick={onClick}
        onPointerEnter={onPointerEnter}
        onPointerLeave={() => setHovering(false)}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {frame}
      </a>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      data-slot="hover-overlay-reveal"
      data-motion={reduced ? "off" : "on"}
      data-from={from}
      data-open={open ? "true" : "false"}
      data-revealed={shown ? "true" : "false"}
      className={shared}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => setHovering(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={(event) => {
        if (!coarsePointer()) return
        if (event.key !== "Enter" && event.key !== " ") return
        event.preventDefault()
        setOpen((value) => !value)
      }}
    >
      {frame}
    </div>
  )
}
