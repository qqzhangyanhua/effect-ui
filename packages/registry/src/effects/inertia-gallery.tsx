"use client"

// Ported from GodUI (MIT, (c) 2026 Lucas Bassetti) — https://github.com/LucasBassetti/godui/blob/1f632a7/packages/lab/src/inertia-gallery/inertia-gallery.tsx

import { animate, motion, useMotionTemplate, useMotionValue, useTransform, type MotionValue } from "motion/react"
import { useCallback, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type InertiaGalleryProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "color"> & {
  children?: ReactNode
  size?: number
  gap?: number
  intensity?: number
  speed?: number
  color?: string
  snap?: boolean
  defaultIndex?: number
  onChange?: (index: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function InertiaItem({
  offset,
  pitch,
  x,
  falloff,
  reduced,
  width,
  color,
  children,
}: {
  offset: number
  pitch: number
  x: MotionValue<number>
  falloff: number
  reduced: boolean
  width: number
  color: string
  children: ReactNode
}) {
  const distance = useTransform(x, (value) => Math.min(Math.abs(offset + value) / pitch, 2.4))
  const scale = useTransform(distance, (value) => 1 - value * 0.14 * falloff)
  const opacity = useTransform(distance, (value) => clamp(1 - value * 0.3 * falloff, 0.4, 1))
  const blur = useTransform(distance, (value) => (reduced ? 0 : Math.min(value * 3.2, 5) * falloff))
  const filter = useMotionTemplate`blur(${blur}px)`
  return (
    <motion.div className="relative shrink-0" style={{ width, scale, opacity, filter }}>
      <div className="aspect-[3/4] size-full overflow-hidden rounded-2xl border bg-card shadow-xl" style={{ borderColor: color }}>
        {children}
      </div>
    </motion.div>
  )
}

export function InertiaGallery({
  children,
  size = 200,
  gap = 24,
  intensity = 1,
  speed = 1,
  color = "var(--primary)",
  snap = true,
  defaultIndex = 0,
  onChange,
  className,
  ...props
}: InertiaGalleryProps) {
  const reduced = usePrefersReducedMotion()
  const viewportRef = useRef<HTMLDivElement>(null)
  const live = useAnimationActive(viewportRef)
  const items = Array.isArray(children) ? children : children ? [children] : []
  const count = items.length
  const pitch = size + gap
  const falloff = reduced ? 0 : intensity
  const start = clamp(defaultIndex, 0, Math.max(0, count - 1))
  const x = useMotionValue(-start * pitch)
  const [active, setActive] = useState(start)
  const [pad, setPad] = useState(0)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return
    const measure = () => setPad(Math.max(0, (node.clientWidth - size) / 2))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [size])

  const commit = useCallback(
    (index: number) => {
      const next = clamp(index, 0, Math.max(0, count - 1))
      setActive((prev) => {
        if (prev !== next) onChangeRef.current?.(next)
        return next
      })
      return next
    },
    [count],
  )

  const goTo = useCallback(
    (index: number) => {
      const next = commit(index)
      animate(x, -next * pitch, reduced || !live ? { duration: 0 } : { type: "spring", stiffness: 320 * speed, damping: 32, mass: 0.9 })
    },
    [commit, live, pitch, reduced, speed, x],
  )

  return (
    <div data-slot="inertia-gallery" data-motion={live && !reduced ? "on" : "off"} className={`flex flex-col items-center gap-5 motion-reduce:transition-none ${className ?? ""}`} {...props}>
      <div
        ref={viewportRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="Gallery"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault()
            goTo(active - 1)
          } else if (event.key === "ArrowRight") {
            event.preventDefault()
            goTo(active + 1)
          }
        }}
        className="relative w-full max-w-full touch-pan-y overflow-hidden outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        style={{ maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)" }}
      >
        <motion.div
          className="flex cursor-grab items-center active:cursor-grabbing"
          style={{ x, gap, paddingLeft: pad, paddingRight: pad }}
          drag="x"
          dragConstraints={{ left: -(Math.max(count, 1) - 1) * pitch, right: 0 }}
          dragElastic={0.16}
          onDragEnd={() => {
            const nearest = clamp(Math.round(-x.get() / pitch), 0, Math.max(0, count - 1))
            if (snap) goTo(nearest)
            else commit(nearest)
          }}
        >
          {items.map((child, index) => (
            <InertiaItem key={index} offset={index * pitch} pitch={pitch} x={x} falloff={falloff} reduced={reduced} width={size} color={color}>
              {child}
            </InertiaItem>
          ))}
        </motion.div>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous" className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground active:scale-95 disabled:opacity-40">
          ‹
        </button>
        <span className="text-sm tabular-nums text-muted-foreground">
          {active + 1} / {count}
        </span>
        <button type="button" onClick={() => goTo(active + 1)} disabled={active === count - 1} aria-label="Next" className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground active:scale-95 disabled:opacity-40">
          ›
        </button>
      </div>
    </div>
  )
}
