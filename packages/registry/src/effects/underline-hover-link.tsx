"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/underline-center.tsx and https://github.com/danielpetho/fancy/blob/main/src/fancy/components/text/underline-comes-in-goes-out.tsx. Modified for effect-ui.

import { useEffect, useRef, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface UnderlineHoverLinkProps {
  children: ReactNode
  variant?: "center" | "in-out"
  direction?: "left" | "right"
  href?: string
  className?: string
  underlineHeightRatio?: number
  underlinePaddingRatio?: number
}

const CSS = `
[data-slot="underline-hover-link"]{position:relative;display:inline-block;cursor:pointer}
[data-slot="underline-hover-link"] .bar{position:absolute;background:currentColor;height:var(--underline-height,1px);pointer-events:none}
[data-slot="underline-hover-link"][data-variant="center"] .bar{left:50%;bottom:calc(-1 * var(--underline-padding,0px));width:0;transform:translateX(-50%);transition:width .25s ease-in-out}
[data-slot="underline-hover-link"][data-variant="center"]:hover .bar,[data-slot="underline-hover-link"][data-variant="center"]:focus-visible .bar{width:100%}
[data-slot="underline-hover-link"][data-variant="in-out"][data-direction="left"] .bar{left:0;bottom:var(--underline-padding,0px);width:0}
[data-slot="underline-hover-link"][data-variant="in-out"][data-direction="right"] .bar{right:0;bottom:var(--underline-padding,0px);width:0}
[data-slot="underline-hover-link"][data-variant="in-out"][data-direction="left"]:hover .bar,[data-slot="underline-hover-link"][data-variant="in-out"][data-direction="left"]:focus-visible .bar{animation:underline-hover-in-out-left .8s ease-in-out}
[data-slot="underline-hover-link"][data-variant="in-out"][data-direction="right"]:hover .bar,[data-slot="underline-hover-link"][data-variant="in-out"][data-direction="right"]:focus-visible .bar{animation:underline-hover-in-out-right .8s ease-in-out}
[data-slot="underline-hover-link"][data-reduced="true"] .bar{transition:none;animation:none}
@keyframes underline-hover-in-out-left{0%{width:0;left:0;right:auto}45%{width:100%;left:0;right:auto}55%{width:100%;left:auto;right:0}100%{width:0;left:auto;right:0}}
@keyframes underline-hover-in-out-right{0%{width:0;right:0;left:auto}45%{width:100%;right:0;left:auto}55%{width:100%;right:auto;left:0}100%{width:0;right:auto;left:0}}
`

export function UnderlineHoverLink({
  children,
  variant = "center",
  direction = "left",
  href,
  className,
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
}: UnderlineHoverLinkProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const update = () => {
      const fontSize = Number.parseFloat(getComputedStyle(node).fontSize)
      if (!Number.isFinite(fontSize)) return
      node.style.setProperty("--underline-height", `${fontSize * underlineHeightRatio}px`)
      node.style.setProperty("--underline-padding", `${fontSize * underlinePaddingRatio}px`)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [underlineHeightRatio, underlinePaddingRatio])

  const shared = {
    className: cn(className),
    "data-direction": direction,
    "data-reduced": reduced ? "true" : "false",
    "data-slot": "underline-hover-link",
    "data-variant": variant,
  } as const
  const body = (
    <>
      <style>{CSS}</style>
      <span>{children}</span>
      <span aria-hidden className="bar" />
    </>
  )

  if (href) {
    return (
      <a
        {...shared}
        href={href}
        ref={(node) => {
          ref.current = node
        }}
      >
        {body}
      </a>
    )
  }

  return (
    <span
      {...shared}
      ref={(node) => {
        ref.current = node
      }}
    >
      {body}
    </span>
  )
}
