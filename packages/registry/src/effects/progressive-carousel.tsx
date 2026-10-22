"use client"

// Ported from UI Layouts (MIT, (c) 2024 UI LAYOUT) — https://github.com/ui-layouts/uilayouts/blob/main/apps/ui-layout/components/ui/progressive-carousel.tsx. Modified for effect-ui.

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useMediaQuery } from "@/hooks/use-media-query"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { useEffect, useRef, useState, type HTMLAttributes } from "react"

export interface ProgressiveCarouselSlide {
  value: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
}

export interface ProgressiveCarouselProps extends HTMLAttributes<HTMLDivElement> {
  slides: readonly ProgressiveCarouselSlide[]
  defaultActive?: string
  duration?: number
  fastDuration?: number
  vertical?: boolean
}

export function ProgressiveCarousel({
  slides,
  defaultActive,
  duration = 5000,
  fastDuration = 400,
  vertical,
  className,
  ...props
}: ProgressiveCarouselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const motionOn = useAnimationActive(ref)
  const wide = useMediaQuery("(min-width: 640px)")
  const stacked = vertical ?? wide
  const [active, setActive] = useState(defaultActive ?? slides[0]?.value ?? "")
  const [progress, setProgress] = useState(0)
  const playing = !reduced && motionOn && slides.length > 1
  const cycle = Math.max(1, reduced ? fastDuration : duration)

  useEffect(() => {
    if (!playing) return
    const started = performance.now()
    let raf = 0
    const loop = (now: number) => {
      const fraction = (now - started) / cycle
      if (fraction >= 1) {
        setActive((current) => {
          const index = slides.findIndex((slide) => slide.value === current)
          const next = slides[(index + 1) % slides.length]
          return next?.value ?? current
        })
        setProgress(0)
        return
      }
      setProgress(fraction * 100)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playing, active, cycle, slides])

  const current = slides.find((slide) => slide.value === active) ?? slides[0]

  return (
    <div
      {...props}
      ref={ref}
      className={cn("grid w-full gap-4", stacked ? "sm:grid-cols-[16rem_1fr]" : undefined, className)}
      data-reduced={reduced ? "true" : "false"}
      data-slot="progressive-carousel"
    >
      <div className={cn("grid gap-2", stacked ? "sm:grid-cols-1" : "grid-cols-2")}>
        {slides.map((slide) => {
          const selected = slide.value === current?.value
          return (
            <button
              className={cn("relative overflow-hidden px-3 py-3 text-left", selected ? "opacity-100" : "opacity-50")}
              key={slide.value}
              onClick={() => {
                setActive(slide.value)
                setProgress(0)
              }}
              type="button"
            >
              <span className="relative z-10 block font-semibold">{slide.title}</span>
              <span className="relative z-10 mt-1 block text-sm text-muted-foreground">{slide.description}</span>
              <span
                aria-valuenow={selected ? Math.round(progress) : 0}
                aria-valuemin={0}
                aria-valuemax={100}
                className="absolute inset-0 -z-0 bg-muted"
                role="progressbar"
                style={{ [stacked ? "height" : "width"]: selected && !reduced ? `${progress}%` : selected ? "100%" : "0%" }}
              />
            </button>
          )
        })}
      </div>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element -- registry 组件用 img，不引入 next/image
        <img alt={current.imageAlt} className="h-64 w-full rounded-xl object-cover" src={current.imageUrl} />
      ) : null}
    </div>
  )
}
