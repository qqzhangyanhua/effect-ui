"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/carousel-navigator-base.tsx

import { useId, useRef } from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface CarouselNavigatorProps {
  totalSlides?: number
  currentIndex: number
  onIndexChange: (index: number) => void
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  className?: string
}

export function CarouselNavigator({
  totalSlides = 4,
  currentIndex,
  onIndexChange,
  color = "var(--primary)",
  duration = 5000,
  intensity = 48,
  speed = 1,
  className,
}: CarouselNavigatorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const fillName = `carousel-nav-fill-${useId().replace(/:/g, "")}`
  const slides = Math.max(1, totalSlides)
  const index = ((currentIndex % slides) + slides) % slides
  const fillMs = Math.max(200, duration / Math.max(speed, 0.1))
  const moving = live && !reduced
  const go = (next: number) => onIndexChange(((next % slides) + slides) % slides)

  return (
    <div
      ref={rootRef}
      data-slot="carousel-navigator"
      data-index={index}
      data-motion={moving ? "on" : "off"}
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 motion-reduce:transition-none ${className ?? ""}`}
    >
      <style>{`@keyframes ${fillName}{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
      <motion.button
        type="button"
        aria-label="Previous"
        disabled={index === 0}
        whileTap={{ scale: 0.9 }}
        onClick={() => go(index - 1)}
        className="flex items-center justify-center rounded-full text-primary-foreground disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60"
        style={{ width: intensity, height: intensity, background: index === 0 ? undefined : color }}
      >
        <ChevronLeft aria-hidden="true" />
      </motion.button>
      <div className="flex items-center gap-2 px-2">
        {Array.from({ length: slides }, (_, slide) => {
          const active = slide === index
          return (
            <button
              key={slide}
              type="button"
              aria-label={`Slide ${slide + 1}`}
              aria-current={active ? "true" : undefined}
              onClick={() => onIndexChange(slide)}
              className="relative h-3 overflow-hidden rounded-full bg-secondary"
              style={{ width: active ? intensity : 12 }}
            >
              {active ? (
                <span
                  className="absolute inset-0 origin-left rounded-full motion-reduce:animate-none"
                  style={{
                    background: color,
                    transform: reduced ? "scaleX(1)" : undefined,
                    animationName: reduced ? undefined : fillName,
                    animationDuration: `${fillMs}ms`,
                    animationTimingFunction: "linear",
                    animationIterationCount: "1",
                    animationFillMode: "forwards",
                    animationPlayState: moving ? "running" : "paused",
                  }}
                />
              ) : null}
            </button>
          )
        })}
      </div>
      <motion.button
        type="button"
        aria-label="Next"
        whileTap={{ scale: 0.9 }}
        onClick={() => go(index + 1)}
        className="flex items-center justify-center rounded-full text-primary-foreground"
        style={{ width: intensity, height: intensity, background: color }}
      >
        <ChevronRight aria-hidden="true" />
      </motion.button>
    </div>
  )
}
