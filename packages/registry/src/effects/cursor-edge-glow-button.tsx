"use client"

// Ported from MicroKit (MIT, (c) 2026 Henrique Barone) — https://github.com/henriquegpb/microkit/blob/fd993e8/registry/microkit/cursor-edge-glow-button.tsx

import { useEffect, useRef } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CursorEdgeGlowButtonProps {
  label?: string
  color?: string
  intensity?: number
  speed?: number
  size?: number
  className?: string
}

const FREQUENCY = 3.4
const DAMPING = 0.78

export function CursorEdgeGlowButton({
  label = "See in Action",
  color = "var(--primary)",
  intensity = 12,
  speed = 1,
  size = 40,
  className,
}: CursorEdgeGlowButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const trackRef = useRef<HTMLSpanElement>(null)
  const rightRef = useRef<HTMLSpanElement>(null)
  const leftRef = useRef<HTMLSpanElement>(null)
  const frameRef = useRef<number | null>(null)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(containerRef)

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    if (!live || reduced) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [live, reduced])

  useEffect(() => {
    const container = containerRef.current
    const button = buttonRef.current
    const track = trackRef.current
    const right = rightRef.current
    const left = leftRef.current
    if (!container || !button || !track || !right || !left) return

    let bound = container.getBoundingClientRect().width / 2 + intensity
    let x = bound
    let velocity = 0
    let target = bound
    let inside = false
    let last = 0

    const measure = () => {
      bound = container.getBoundingClientRect().width / 2 + intensity
    }

    const paint = () => {
      track.style.setProperty("--light-x", `${x.toFixed(2)}px`)
      const normalized = Math.max(-1, Math.min(1, bound === 0 ? 0 : x / bound))
      const magnitude = Math.abs(normalized)
      const glow = magnitude ** 0.5
      right.style.opacity = normalized > 0 ? glow.toFixed(3) : "0"
      left.style.opacity = normalized < 0 ? glow.toFixed(3) : "0"
    }

    measure()
    paint()
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure)
      observer.observe(container)
    }

    const frame = (now: number) => {
      if (!liveRef.current || reducedRef.current) {
        frameRef.current = null
        return
      }
      const delta = last === 0 ? 0.016 : Math.min((now - last) / 1000, 0.032)
      last = now
      const omega = 2 * Math.PI * FREQUENCY * speed
      velocity += (omega * omega * (target - x) - 2 * DAMPING * omega * velocity) * delta
      x += velocity * delta
      paint()
      if (inside || Math.abs(target - x) > 0.15 || Math.abs(velocity) > 0.6) {
        frameRef.current = requestAnimationFrame(frame)
      } else {
        frameRef.current = null
        x = target
        velocity = 0
        paint()
      }
    }

    const kick = () => {
      if (!liveRef.current || reducedRef.current || frameRef.current !== null) return
      last = 0
      frameRef.current = requestAnimationFrame(frame)
    }

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect()
      inside = true
      target = Math.max(-bound, Math.min(bound, event.clientX - (bounds.left + bounds.width / 2)))
      kick()
    }
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return
      onPointerMove(event)
    }
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return
      inside = false
      target = x
      kick()
    }
    const onLeave = () => {
      inside = false
      target = x
      kick()
    }
    const onFocus = () => {
      inside = false
      target = 0
      kick()
    }
    const onBlur = () => {
      inside = false
      target = x
      kick()
    }

    container.addEventListener("pointermove", onPointerMove)
    container.addEventListener("pointerdown", onPointerDown)
    container.addEventListener("pointerup", onPointerUp)
    container.addEventListener("pointerleave", onLeave)
    button.addEventListener("focus", onFocus)
    button.addEventListener("blur", onBlur)
    return () => {
      observer?.disconnect()
      container.removeEventListener("pointermove", onPointerMove)
      container.removeEventListener("pointerdown", onPointerDown)
      container.removeEventListener("pointerup", onPointerUp)
      container.removeEventListener("pointerleave", onLeave)
      button.removeEventListener("focus", onFocus)
      button.removeEventListener("blur", onBlur)
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [intensity, speed])

  const edge = `linear-gradient(transparent, transparent) padding-box, linear-gradient(90deg, transparent, color-mix(in srgb, ${color} 80%, white)) border-box`

  return (
    <div ref={containerRef} data-slot="cursor-edge-glow-button" data-motion={live && !reduced ? "on" : "off"} className={cn("relative inline-flex items-center motion-reduce:transition-none", className)}>
      <span ref={rightRef} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-transparent" style={{ width: `calc(100% + ${intensity}px)`, height: `calc(100% + ${intensity}px)`, background: edge }} />
      <span ref={leftRef} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-transparent opacity-0" style={{ width: `calc(100% + ${intensity}px)`, height: `calc(100% + ${intensity}px)`, background: edge, transform: "translate(-50%, -50%) scaleX(-1)" }} />
      <button
        ref={buttonRef}
        type="button"
        className="relative z-10 inline-flex cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-full border border-border bg-secondary px-10 text-xs font-bold tracking-wide text-foreground uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        style={{ height: size, color }}
      >
        <span ref={trackRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-40 -translate-x-1/2" style={{ transform: "translateX(var(--light-x, 0px))" }}>
          <span className="absolute top-1/2 left-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-md" style={{ background: `radial-gradient(circle, color-mix(in srgb, ${color} 70%, white), transparent 70%)` }} />
        </span>
        <span className="relative">{label}</span>
        <svg className="relative h-2.5 w-4" viewBox="0 0 17 9" aria-hidden="true">
          <path fill="currentColor" d="m12.495 0 4.495 4.495-4.495 4.495-.99-.99 2.805-2.805H0v-1.4h14.31L11.505.99z" />
        </svg>
      </button>
    </div>
  )
}
