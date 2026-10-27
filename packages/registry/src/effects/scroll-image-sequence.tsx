"use client"

import * as React from "react"
import { useScroll } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ScrollImageSequenceProps {
  frames: string[]
  className?: string
  speed?: number
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function ScrollImageSequence({ frames, className, speed, intensity }: ScrollImageSequenceProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.2"] })
  const rate = pace(speed)
  const keepOpacity = intensity === undefined || intensity === 1

  React.useEffect(() => {
    if (reduced) return
    return scrollYProgress.on("change", (value) => {
      const progress = rate === 1 ? value : Math.min(1, Math.max(0, value * rate))
      const index = Math.min(frames.length - 1, Math.max(0, Math.floor(progress * frames.length)))
      if (imgRef.current && frames[index]) imgRef.current.src = frames[index]
    })
  }, [frames, rate, reduced, scrollYProgress])

  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      <div className="overflow-hidden rounded-xl border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={frames[0]}
          alt=""
          className="aspect-video w-full object-cover"
          style={keepOpacity ? undefined : { opacity: intensity }}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground">滚动切换帧 · 灵感来自 Apple 产品页，原创实现</p>
    </div>
  )
}

export { ScrollImageSequence }
