"use client"

// Ported from Uiverse.io (MIT), author ArturCodeCraft — https://github.com/uiverse-io/galaxy/blob/main/Buttons/ArturCodeCraft_afraid-fish-22.html. Modified for effect-ui.

import { useRef, type AnchorHTMLAttributes, type CSSProperties, type MouseEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScrollCueButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  targetId?: string
  label?: string
  /** 为 true 时箭头循环播放；否则只在悬停时播放。 */
  autoPlay?: boolean
}

export function ScrollCueButton({
  targetId,
  autoPlay = false,
  label = "向下",
  href,
  className,
  style,
  onClick,
  children,
  ...props
}: ScrollCueButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const destination = href ?? (targetId ? `#${targetId}` : "#")
  const painted = { ...style } as CSSProperties

  function scroll(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || !targetId) return
    const node = document.getElementById(targetId)
    if (!node) return
    event.preventDefault()
    node.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })
  }

  return (
    <a
      {...props}
      ref={ref}
      className={cn("inline-flex flex-col items-center gap-1 text-sm text-foreground no-underline", className)}
      data-autoplay={autoPlay ? "true" : "false"}
      data-motion={moving ? "on" : "off"}
      data-reduced={reduced ? "true" : "false"}
      data-slot="scroll-cue-button"
      href={destination}
      onClick={scroll}
      style={painted}
    >
      <style>
        {`[data-slot="scroll-cue-button"][data-motion="on"][data-autoplay="true"] .scroll-cue,[data-slot="scroll-cue-button"][data-motion="on"]:hover .scroll-cue{animation:scroll-cue-slide 3s infinite}
@keyframes scroll-cue-slide{0%,100%{transform:translateY(0);opacity:1}35%{transform:translateY(1rem);opacity:0}70%{transform:translateY(-1rem);opacity:0}}`}
      </style>
      <span aria-hidden="true" className="scroll-cue block size-6">
        <svg viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M11.9997 13.1716L7.04996 8.22186L5.63574 9.63607L11.9997 16L18.3637 9.63607L16.9495 8.22186L11.9997 13.1716Z" fill="currentColor" />
        </svg>
      </span>
      <span>{children ?? label}</span>
    </a>
  )
}
