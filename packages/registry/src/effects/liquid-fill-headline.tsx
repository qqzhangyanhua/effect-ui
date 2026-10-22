"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/text/liquid-fill-headline.tsx

import { useEffect, useRef, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LiquidFillHeadlineProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  text: string
  color?: string
  duration?: number
  intensity?: number
  fontSize?: number
  loop?: boolean
}

const POINTS = 24
const EMPTY = 108
const FULL = -6

function clipPolygon(level: number, amp: number, offset: number, wave: number) {
  let pts = ""
  for (let i = 0; i < POINTS; i += 1) {
    const x = i * (100 / (POINTS - 1))
    const y =
      level +
      amp * Math.sin(x * 0.11 + wave * 3.1 + offset) +
      amp * 0.6 * Math.sin(x * 0.183 + wave * -4.3 + offset * 1.7)
    pts += `${x.toFixed(1)}% ${y.toFixed(1)}%, `
  }
  return `polygon(0% 120%, ${pts}100% 120%)`
}

function ease(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2
}

export function LiquidFillHeadline({
  text,
  color = "var(--primary)",
  duration = 3000,
  intensity = 4.5,
  fontSize = 56,
  loop = true,
  className,
  ...props
}: LiquidFillHeadlineProps) {
  const rootRef = useRef<HTMLParagraphElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const backRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef(0)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced

  useEffect(() => {
    const fill = fillRef.current
    const back = backRef.current
    if (!fill || !back) return
    const apply = (level: number, amp: number, wave: number) => {
      fill.style.clipPath = clipPolygon(level, amp, 0, wave)
      back.style.clipPath = clipPolygon(level - 3.5, amp * 1.15, 1.4, wave)
    }
    if (reduced) {
      fill.style.clipPath = "none"
      back.style.clipPath = "polygon(0 0, 0 0, 0 0)"
      return
    }
    if (!moving) return
    const rise = Math.max(0.05, duration / 1000)
    const settle = 0.8
    const hold = 1.4
    const drain = 1
    const total = rise + settle + hold + drain + 0.8
    const span = EMPTY - FULL
    let raf = 0
    let last = 0
    let wave = 0
    const frame = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016
      last = now
      wave += dt
      timelineRef.current += dt
      if (timelineRef.current >= total) {
        if (!loop) {
          fill.style.clipPath = "none"
          back.style.clipPath = "polygon(0 0, 0 0, 0 0)"
          return
        }
        timelineRef.current -= total
      }
      let t = timelineRef.current
      if (t < rise) apply(EMPTY - span * ease(t / rise), intensity, wave)
      else if ((t -= rise) < settle) apply(FULL, intensity * (1 - t / settle), wave)
      else if ((t -= settle) < hold) apply(FULL, 0, wave)
      else if ((t -= hold) < drain) apply(FULL + span * (t / drain) ** 3, intensity * 0.78, wave)
      else apply(EMPTY, 0, wave)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [duration, intensity, loop, moving, reduced])

  const replay = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduced || event.button !== 0) return
    timelineRef.current = 0
  }

  const layer = {
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  } as const

  return (
    <p
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      {...props}
      onPointerDown={replay}
      className={cn("w-full font-extrabold leading-none tracking-tight text-foreground motion-reduce:animate-none", className)}
      style={{ fontSize }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden className="relative inline-block max-w-full select-none">
        <span className="block" style={{ color: "transparent", WebkitTextStroke: "1.5px var(--foreground)" }}>
          {text}
        </span>
        <span
          ref={backRef}
          className="absolute inset-0 block"
          style={{ ...layer, opacity: 0.45, backgroundImage: `linear-gradient(180deg, var(--accent), ${color})` }}
        >
          {text}
        </span>
        <span
          ref={fillRef}
          className="absolute inset-0 block"
          style={{ ...layer, backgroundImage: `linear-gradient(180deg, var(--accent), ${color} 46%, var(--foreground))` }}
        >
          {text}
        </span>
      </span>
    </p>
  )
}
