"use client"

// Ported from Cult UI (MIT, (c) 2023 Jordan-Gilliam) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/glow-button.tsx. Modified for effect-ui.

import { useEffect, useRef, useState } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GlowTrackButtonProps {
  href?: string
  text: string
  glowColor?: string
  textColor?: string
  backgroundColor?: string
  className?: string
}

export function GlowTrackButton({
  href,
  text,
  glowColor = "#FFAA81",
  textColor = "black",
  backgroundColor = "#d1d1d1",
  className,
}: GlowTrackButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const moving = motionOn && !reduced
  const [hovering, setHovering] = useState(false)
  const [glowPosition, setGlowPosition] = useState(0)
  const track = moving && hovering

  useEffect(() => {
    if (!track) return
    const onMove = (event: MouseEvent) => {
      const node = ref.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      if (rect.width <= 0) return
      setGlowPosition(((event.clientX - rect.left) / rect.width) * 100)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [track])

  const body = (
    <>
      <span
        className="pointer-events-none absolute -z-10 flex w-[204px] items-center justify-center"
        data-part="glow"
        style={{
          transform: `translateX(calc(${glowPosition}% - 102px))`,
          opacity: track ? 1 : 0,
          transition: "opacity 0.2s ease-in-out, transform 0.1s ease-out",
        }}
      >
        <span
          className="absolute top-1/2 h-[121px] w-[121px] -translate-y-1/2"
          style={{
            background: `radial-gradient(50% 50% at 50% 50%, #FFFFF5 3.5%, ${glowColor} 26.5%, #FFDA9F 37.5%, rgba(255,170,129,0.50) 49%, rgba(210,106,58,0.00) 92.5%)`,
          }}
        />
        <span
          className="absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 blur-[5px]"
          style={{
            background:
              "radial-gradient(43.3% 44.23% at 50% 49.51%, #FFFFF7 29%, #FFFACD 48.5%, #F4D2BF 60.71%, rgba(214,211,210,0.00) 100%)",
          }}
        />
      </span>
      <span style={{ color: textColor }}>{text}</span>
      <svg aria-hidden="true" className="h-[9px] w-[17px]" fill="none" style={{ color: textColor }} viewBox="0 0 17 9" xmlns="http://www.w3.org/2000/svg">
        <path
          clipRule="evenodd"
          d="m12.495 0 4.495 4.495-4.495 4.495-.99-.99 2.805-2.805H0v-1.4h14.31L11.505.99z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </>
  )
  const classNames = cn(
    "relative z-10 inline-flex h-11 min-h-11 items-center justify-center gap-1 overflow-hidden rounded-full border border-primary/20 bg-gradient-to-br from-background to-muted/50 px-8 text-xs font-bold uppercase tracking-wide",
    className,
  )
  const shared = {
    className: classNames,
    "data-motion": moving ? "on" : "off",
    "data-reduced": reduced ? "true" : "false",
    "data-slot": "glow-track-button",
    style: { backgroundColor },
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  }
  return (
    <span className="relative z-10 inline-flex items-center">
      {href ? (
        <a ref={ref} href={href} {...shared}>
          {body}
        </a>
      ) : (
        <button ref={ref} {...shared} type="button">
          {body}
        </button>
      )}
    </span>
  )
}
