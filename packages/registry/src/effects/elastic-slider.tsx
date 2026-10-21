"use client"

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ElasticSliderProps {
  className?: string
  min?: number
  max?: number
  defaultValue?: number
  color?: string
  scale?: number
  speed?: number
}

function ElasticSlider({
  className,
  min = 0,
  max = 100,
  defaultValue = 42,
  color,
  scale,
  speed,
}: ElasticSliderProps) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = React.useState(defaultValue)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const stretch = useMotionValue(0)
  const amount = scale === undefined || scale === 1 ? 1 : scale
  const scaleX = useTransform(stretch, (latest) => {
    if (amount === 1) return 1 + Math.min(0.22, Math.abs(latest) * 0.55)
    return 1 + Math.min(0.22 * amount, Math.abs(latest) * 0.55 * amount)
  })
  const origin = useTransform(stretch, (latest) => (latest < 0 ? "right center" : "left center"))
  const thumbX = useTransform(stretch, (latest) => latest * (amount === 1 ? 42 : 42 * amount))

  const applyPointer = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width
    if (ratio < 0) {
      setValue(min)
      if (!reduced) stretch.set(ratio)
      return
    }
    if (ratio > 1) {
      setValue(max)
      if (!reduced) stretch.set(ratio - 1)
      return
    }
    stretch.set(0)
    setValue(min + ratio * (max - min))
  }

  const release = () => {
    if (reduced) {
      stretch.set(0)
      return
    }
    void animate(
      stretch,
      0,
      speed === undefined || speed === 1
        ? { type: "spring", stiffness: 460, damping: 16 }
        : { type: "spring", stiffness: 460 * speed, damping: 16 },
    )
  }

  const percent = ((value - min) / Math.max(max - min, 1)) * 100

  return (
    <div data-slot="elastic-slider" className={cn("w-full max-w-md space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span>弹性滑块</span>
        <span className="tabular-nums text-muted-foreground">{Math.round(value)}</span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-label="弹性滑块"
        className="relative h-10 cursor-ew-resize touch-none outline-none"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          applyPointer(event.clientX)
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
          applyPointer(event.clientX)
        }}
        onPointerUp={release}
        onPointerCancel={release}
        onKeyDown={(event) => {
          const step = (max - min) / 20
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            setValue((current) => Math.min(max, current + step))
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            setValue((current) => Math.max(min, current - step))
          }
        }}
      >
        <motion.div
          className="absolute top-4 h-2 w-full rounded-full bg-muted"
          style={{ scaleX, transformOrigin: origin }}
        />
        <motion.div
          className={cn("absolute top-4 h-2 rounded-full", color ? undefined : "bg-primary")}
          style={
            color
              ? { width: `${percent}%`, scaleX, transformOrigin: origin, backgroundColor: color }
              : { width: `${percent}%`, scaleX, transformOrigin: origin }
          }
        />
        <motion.div
          className="absolute top-2.5 size-5 rounded-full border-2 border-primary bg-background shadow"
          style={{ left: `calc(${percent}% - 10px)`, x: thumbX }}
        />
      </div>
      <p className="text-xs text-muted-foreground">拖过两端会像橡皮一样拉长，松手弹回。</p>
    </div>
  )
}

export { ElasticSlider }
