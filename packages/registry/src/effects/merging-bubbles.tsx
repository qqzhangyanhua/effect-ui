"use client"

// Ported from Cult UI (MIT) — https://github.com/nolly-studio/cult-ui/blob/main/apps/www/registry/default/ui/merging-bubbles.tsx

import { useEffect, useId, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface MergingBubblesProps {
  count?: number
  colors?: readonly string[]
  className?: string
  children?: ReactNode
}

const DEFAULT_COLORS = ["#38bdf8", "#f472b6", "#facc15", "#a78bfa", "#34d399"]

interface Bubble {
  x: number
  y: number
  vx: number
  vy: number
  size: number
}

function filterId(raw: string) {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "")
  return `merging-bubbles-${cleaned || "goo"}`
}

function MergingBubbles({ count = 7, colors = DEFAULT_COLORS, className, children }: MergingBubblesProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(wrapRef)
  const activeRef = useRef(active)
  const reducedRef = useRef(reduced)
  const resumeRef = useRef<() => void>(() => {})
  const id = filterId(useId())
  const total = Math.max(3, Math.round(count))
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS

  useEffect(() => {
    activeRef.current = active
    reducedRef.current = reduced
    if (!reduced && active) resumeRef.current()
  }, [active, reduced])

  useEffect(() => {
    const bubbles: Bubble[] = Array.from({ length: total }, (_, index) => ({
      x: 24 + (index % 4) * 48,
      y: 28 + Math.floor(index / 4) * 52,
      vx: (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 6),
      vy: (index % 3 === 0 ? 1 : -1) * (14 + (index % 3) * 5),
      size: 36 + (index % 3) * 16,
    }))

    const place = (moving: boolean, dt: number) => {
      const width = wrapRef.current?.clientWidth || 360
      const height = wrapRef.current?.clientHeight || 192
      bubbles.forEach((bubble, index) => {
        if (moving) {
          bubble.x += bubble.vx * dt
          bubble.y += bubble.vy * dt
          if (bubble.x < 0 || bubble.x > width - bubble.size) bubble.vx *= -1
          if (bubble.y < 0 || bubble.y > height - bubble.size) bubble.vy *= -1
          bubble.x = Math.min(Math.max(0, bubble.x), Math.max(0, width - bubble.size))
          bubble.y = Math.min(Math.max(0, bubble.y), Math.max(0, height - bubble.size))
        }
        const node = wrapRef.current?.querySelectorAll<HTMLElement>("[data-bubble]")[index]
        if (!node) return
        node.style.transform = `translate(${bubble.x}px, ${bubble.y}px)`
      })
    }

    place(false, 0)
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      frame = 0
      if (reducedRef.current || !activeRef.current) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      place(true, dt)
      frame = window.requestAnimationFrame(step)
    }
    const start = () => {
      if (reducedRef.current || !activeRef.current || frame) return
      last = performance.now()
      frame = window.requestAnimationFrame(step)
    }
    resumeRef.current = start
    if (!reduced) start()
    return () => {
      window.cancelAnimationFrame(frame)
      frame = 0
      resumeRef.current = () => {}
    }
  }, [reduced, total])

  return (
    <div
      ref={wrapRef}
      data-slot="merging-bubbles"
      data-reduced={reduced ? "true" : undefined}
      className={cn("relative h-48 w-full overflow-hidden rounded-xl bg-[#0b1020]", className)}
    >
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>
      <div className="absolute inset-0" style={{ filter: `url(#${id})` }}>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            data-bubble=""
            aria-hidden="true"
            className="absolute left-0 top-0 block rounded-full"
            style={{
              width: 36 + (index % 3) * 16,
              height: 36 + (index % 3) * 16,
              background: palette[index % palette.length],
            }}
          />
        ))}
      </div>
      {children ? <div className="pointer-events-none relative z-10 flex h-full items-center justify-center">{children}</div> : null}
    </div>
  )
}

export { MergingBubbles }
