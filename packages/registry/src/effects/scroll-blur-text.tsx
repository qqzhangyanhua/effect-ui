"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/scroll-text.tsx. Modified for effect-ui.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react"

export interface ScrollBlurTextProps extends HTMLAttributes<HTMLElement> {
  text: string
  direction?: "up" | "down" | "left" | "right"
  as?: "h1" | "h2" | "p" | "span" | "div"
  children?: ReactNode
}

function hiddenOffset(direction: NonNullable<ScrollBlurTextProps["direction"]>) {
  if (direction === "left") return "translateX(-1.5rem)"
  if (direction === "right") return "translateX(1.5rem)"
  if (direction === "up") return "translateY(-1.5rem)"
  return "translateY(1.5rem)"
}

export function ScrollBlurText({
  text,
  direction = "down",
  as = "h2",
  className,
  ...props
}: ScrollBlurTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const seen = useAnimationActive(ref)
  const visible = reduced || seen
  const words = text.split(/\s+/).filter((word) => word.length > 0)
  const classNames = cn("inline-flex flex-wrap gap-x-[0.35em]", className)
  const body = words.map((word, index) => {
    const style: CSSProperties = {
      opacity: visible ? 1 : 0,
      filter: visible ? "blur(0px)" : "blur(10px)",
      transform: visible ? "none" : hiddenOffset(direction),
      transition: reduced ? "none" : `opacity 0.4s ease ${index * 0.1}s, filter 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`,
    }
    return (
      <span className="inline-block" key={`${word}-${index}`} style={style}>
        {word}
      </span>
    )
  })
  return (
    <div ref={ref} data-reduced={reduced ? "true" : "false"} data-slot="scroll-blur-text" data-state={visible ? "visible" : "hidden"}>
      {as === "h1" ? <h1 {...props} className={classNames}>{body}</h1> : null}
      {as === "h2" ? <h2 {...props} className={classNames}>{body}</h2> : null}
      {as === "p" ? <p {...props} className={classNames}>{body}</p> : null}
      {as === "span" ? <span {...props} className={classNames}>{body}</span> : null}
      {as === "div" ? <div {...props} className={classNames}>{body}</div> : null}
    </div>
  )
}
