"use client"

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import { animate } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SpotlightFocusBlurProps {
  text?: string
  blur?: number
  glow?: number
  pace?: number
  className?: string
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function SpotlightFocusBlur({
  text = "聚光停住的地方，这句话才清楚。",
  blur = 8,
  glow = 0.65,
  pace = 1,
  className,
}: SpotlightFocusBlurProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [spot, setSpot] = useState({ x: 50, y: 46 })
  const [following, setFollowing] = useState(false)
  const blurPx = Math.round(clamp(blur, 0, 16))
  const halo = clamp(glow, 0, 1)
  const radius = 16 + halo * 14
  const feather = 8 + (1 - halo) * 18
  const moving = live && !reduced && !following

  useEffect(() => {
    if (!moving) return
    let stopped = false
    const playback = animate(0, 360, {
      duration: 7.2 / rateOf(pace),
      repeat: Infinity,
      ease: "linear",
      onUpdate(angle) {
        if (stopped) return
        const rad = (angle * Math.PI) / 180
        setSpot({ x: 50 + Math.cos(rad) * 22, y: 46 + Math.sin(rad * 2) * 14 })
      },
    })
    return () => {
      stopped = true
      playback.stop()
    }
  }, [moving, pace])

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || reduced) return
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    setFollowing(true)
    setSpot({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    })
  }

  const mask = reduced
    ? undefined
    : `radial-gradient(circle at ${spot.x}% ${spot.y}%, #000 0%, #000 ${radius}%, transparent ${radius + feather}%)`
  const sharpStyle: CSSProperties = {
    WebkitMaskImage: mask,
    maskImage: mask,
  }

  return (
    <div
      ref={ref}
      data-slot="spotlight-focus-blur"
      data-blur={blurPx}
      data-glow={halo}
      data-pace={pace}
      data-motion={reduced ? "off" : moving ? "on" : "paused"}
      data-mask={reduced ? "off" : "on"}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setFollowing(false)}
      onPointerCancel={() => setFollowing(false)}
      className={cn(
        "relative mx-auto min-h-56 max-w-3xl overflow-hidden rounded-3xl border border-border bg-card px-8 py-12 text-card-foreground motion-reduce:blur-none",
        className,
      )}
    >
      <p aria-hidden className="font-display text-4xl leading-tight tracking-tight text-foreground motion-reduce:blur-none sm:text-5xl" style={{ filter: reduced ? undefined : `blur(${blurPx}px)` }}>
        {text}
      </p>
      <p className="font-display absolute inset-x-8 top-12 text-4xl leading-tight tracking-tight text-foreground sm:text-5xl" style={sharpStyle}>
        {text}
      </p>
    </div>
  )
}
