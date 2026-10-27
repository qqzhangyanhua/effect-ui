"use client"

import { useRef, useState, type CSSProperties, type FocusEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type LogoMarqueeDirection = "left" | "right"

export interface LogoMarqueeLogo {
  id: string
  name: string
}

export interface LogoMarqueeProps {
  logos?: readonly LogoMarqueeLogo[]
  speed?: number
  gap?: number
  direction?: LogoMarqueeDirection
  pauseOnHover?: boolean
  paused?: boolean
  className?: string
}

const defaultLogos: readonly LogoMarqueeLogo[] = [
  { id: "north", name: "北窗" },
  { id: "tide", name: "潮汐社" },
  { id: "paper", name: "纸飞机" },
  { id: "harbor", name: "慢码头" },
  { id: "field", name: "青田" },
  { id: "echo", name: "回声实验室" },
]

const KEYFRAMES = `
@keyframes logo-marquee-shift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
`

function rateOf(speed: number) {
  return Number.isFinite(speed) && speed > 0 ? speed : 1
}

function gapOf(gap: number) {
  if (!Number.isFinite(gap) || gap < 0) return 0
  return gap
}

export function LogoMarquee({
  logos = defaultLogos,
  speed = 1,
  gap = 32,
  direction = "left",
  pauseOnHover = true,
  paused = false,
  className,
}: LogoMarqueeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const space = gapOf(gap)
  const duration = Math.round(28000 / rateOf(speed))
  const held = paused || focused || (pauseOnHover && hovering) || !live
  const moving = !reduced && !held && logos.length > 1

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return
    setFocused(false)
  }

  if (logos.length === 0) {
    return <p className={cn("text-sm text-muted-foreground", className)}>还没有标志</p>
  }

  const row = (clone: boolean) => (
    <ul
      data-clone={clone ? "true" : "false"}
      aria-hidden={clone}
      className={cn("flex shrink-0 items-center", reduced && "flex-wrap")}
      style={{ gap: space, paddingRight: reduced ? undefined : space }}
    >
      {logos.map((logo) => (
        <li key={logo.id} className="text-lg font-semibold tracking-wide text-foreground">
          {logo.name}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      ref={ref}
      tabIndex={0}
      data-slot="logo-marquee"
      data-motion={reduced ? "off" : moving ? "on" : "paused"}
      data-speed={speed}
      data-gap={gap}
      data-direction={direction}
      data-pause-on-hover={pauseOnHover ? "true" : "false"}
      aria-label="合作标志，聚焦后暂停"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:animate-none",
        className,
      )}
    >
      <style>{KEYFRAMES}</style>
      <div
        data-track="logos"
        className={cn("flex w-max motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:animate-none", reduced && "w-auto flex-wrap px-6")}
        style={
          reduced
            ? ({ animationName: "none", gap: space } as CSSProperties)
            : ({
                animationName: "logo-marquee-shift",
                animationDuration: `${duration}ms`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                animationDirection: direction === "right" ? "reverse" : "normal",
                animationPlayState: moving ? "running" : "paused",
              } as CSSProperties)
        }
      >
        {row(false)}
        {reduced ? null : row(true)}
      </div>
    </div>
  )
}
