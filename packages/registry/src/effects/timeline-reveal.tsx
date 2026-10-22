"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/timeline-animation.tsx. Modified for effect-ui.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from "react"

export interface TimelineRevealProps extends HTMLAttributes<HTMLElement> {
  animationNum?: number
  as?: "div" | "p" | "h2" | "h3" | "li" | "span"
  once?: boolean
  children?: ReactNode
}

export function TimelineReveal({
  animationNum = 0,
  as = "div",
  once = true,
  className,
  children,
  ...props
}: TimelineRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const seen = useAnimationActive(ref)
  const [locked, setLocked] = useState(false)
  if (once && seen && !locked) setLocked(true)
  const visible = reduced || (once ? locked || seen : seen)
  const delay = Math.max(0, animationNum) * 0.5
  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    filter: visible ? "blur(0px)" : "blur(20px)",
    transition: reduced ? "none" : `opacity 0.5s ease ${delay}s, filter 0.5s ease ${delay}s`,
  }
  const inner = {
    ...props,
    className: cn(className),
    "data-state": visible ? "visible" : "hidden",
    style,
  }
  return (
    <div ref={ref} data-reduced={reduced ? "true" : "false"} data-slot="timeline-reveal">
      {as === "p" ? <p {...inner}>{children}</p> : null}
      {as === "h2" ? <h2 {...inner}>{children}</h2> : null}
      {as === "h3" ? <h3 {...inner}>{children}</h3> : null}
      {as === "li" ? <li {...inner}>{children}</li> : null}
      {as === "span" ? <span {...inner}>{children}</span> : null}
      {as === "div" ? <div {...inner}>{children}</div> : null}
    </div>
  )
}
