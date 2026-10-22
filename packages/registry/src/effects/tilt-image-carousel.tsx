"use client"

// Ported from MosaicUI (MIT, (c) 2026 Darshan Sunil Rajadhyaksha) — https://github.com/darshan-rajadhyaksha/mosaicui/blob/2baca92/src/registry/components/tilt-image-carousel/tilt-image-carousel.tsx

import { useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TiltCarouselPanel {
  title: string
}

export interface TiltImageCarouselProps {
  items?: TiltCarouselPanel[]
  color?: string
  size?: number
  intensity?: number
  angle?: number
  speed?: number
  className?: string
}

export function TiltImageCarousel({
  items = [],
  color = "var(--primary)",
  size = 220,
  intensity = 48,
  angle = 42,
  speed = 1,
  className,
}: TiltImageCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [current, setCurrent] = useState(0)
  const last = Math.max(0, items.length - 1)
  const index = Math.min(Math.max(0, current), last)
  const height = Math.round(size * 1.15)
  const motionOn = live && !reduced
  const transition = motionOn ? { type: "spring" as const, stiffness: 200 * speed, damping: 15, mass: 0.5 } : { duration: 0 }
  const radians = (angle * Math.PI) / 180

  return (
    <div
      ref={rootRef}
      data-slot="tilt-image-carousel"
      data-index={index}
      data-motion={motionOn ? "on" : "off"}
      className={cn("motion-reduce:transition-none", className)}
      style={{ perspective: 800 }}
    >
      <div className="relative mx-auto" style={{ width: size, height, transformStyle: "preserve-3d" }}>
        {items.map((item, itemIndex) => {
          const pos = itemIndex - index
          const currentPanel = pos === 0
          const previous = pos < 0
          const padding = (previous ? -1 : 1) * (size * (1 - Math.cos(radians) / 2))
          return (
            <motion.div
              key={item.title}
              aria-hidden={currentPanel ? undefined : true}
              className="absolute top-0 left-0 flex items-end rounded-2xl border border-border p-4 text-card-foreground motion-reduce:transition-none"
              style={{
                width: size,
                height,
                transformOrigin: "50% center",
                background: `color-mix(in srgb, ${color} ${16 + itemIndex * 16}%, var(--muted))`,
              }}
              initial={false}
              animate={{
                x: currentPanel ? 0 : intensity * pos + padding,
                y: 0,
                z: currentPanel ? 0 : -10 * Math.abs(pos),
                scale: currentPanel ? 1 : 1 - 0.05 * Math.abs(pos),
                rotateY: currentPanel ? 0 : angle * (previous ? 1 : -1),
              }}
              transition={transition}
            >
              <span className="text-sm font-semibold">{item.title}</span>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-3 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted/70 p-1.5">
          <button
            type="button"
            className="grid size-6 place-items-center rounded-full text-foreground hover:bg-background"
            aria-label="Previous"
            onClick={() => setCurrent(Math.max(0, index - 1))}
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path fill="currentColor" d="m8.5 12.8 5.7 5.6c.4.4 1 .4 1.4 0s.4-1 0-1.4l-4.9-5 4.9-5c.4-.4.4-1 0-1.4-.2-.2-.4-.3-.7-.3s-.5.1-.7.3l-5.7 5.6c-.4.5-.4 1.1 0 1.6" />
            </svg>
          </button>
          <div className="flex items-center gap-1">
            {items.map((item, itemIndex) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Slide ${itemIndex + 1}`}
                aria-current={itemIndex === index ? "true" : undefined}
                className={cn("h-2 rounded-full bg-muted-foreground/50", itemIndex === index ? "w-4 bg-foreground" : "w-2")}
                onClick={() => setCurrent(itemIndex)}
              />
            ))}
          </div>
          <button
            type="button"
            className="grid size-6 place-items-center rounded-full text-foreground hover:bg-background"
            aria-label="Next"
            onClick={() => setCurrent(Math.min(last, index + 1))}
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path fill="currentColor" d="M15.54 11.29 9.88 5.64a1 1 0 0 0-1.42 0 1 1 0 0 0 0 1.41l4.95 5L8.46 17a1 1 0 0 0 0 1.41 1 1 0 0 0 .71.3 1 1 0 0 0 .71-.3l5.66-5.65a1 1 0 0 0 0-1.47" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
