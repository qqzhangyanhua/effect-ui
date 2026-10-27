"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ScrollSplitRevealProps {
  intensity?: number
  seam?: number
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

function revealAmount(top: number, height: number, view: number, pace: number) {
  const span = Math.max(180, (view + height) * 0.62 / rateOf(pace))
  return clamp((view * 0.92 - top) / span, 0, 1)
}

export function ScrollSplitReveal({
  intensity = 0.75,
  seam = 50,
  pace = 1,
  className,
}: ScrollSplitRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const [progress, setProgress] = useState(0)
  const seamPct = clamp(seam, 24, 76)
  const amp = clamp(intensity, 0, 1)
  const open = reduced ? 1 : progress
  const travel = reduced ? 220 : Math.round(open * amp * 180)

  useEffect(() => {
    const root = ref.current
    if (!root || reduced || !live) return
    let frame = 0
    const measure = () => {
      frame = 0
      const rect = root.getBoundingClientRect()
      const view = window.innerHeight || 800
      setProgress(revealAmount(rect.top, rect.height || 1, view, pace))
    }
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [live, pace, reduced])

  const topStyle: CSSProperties = { height: `${seamPct}%`, transform: `translate3d(0, ${-travel}px, 0)` }
  const bottomStyle: CSSProperties = {
    top: `${seamPct}%`,
    height: `${100 - seamPct}%`,
    transform: `translate3d(0, ${travel}px, 0)`,
  }
  const opened = open > 0.98 || reduced

  return (
    <div
      ref={ref}
      data-slot="scroll-split-reveal"
      data-intensity={amp}
      data-seam={seamPct}
      data-pace={pace}
      data-progress={open.toFixed(2)}
      data-open={reduced || opened ? "full" : open > 0.02 ? "split" : "closed"}
      data-motion={reduced ? "off" : live ? "on" : "paused"}
      className={cn(
        "relative h-[28rem] overflow-hidden rounded-3xl border border-border bg-background motion-reduce:transform-none",
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center bg-primary/15 p-8">
        <div>
          <p className="font-display text-4xl tracking-tight text-foreground">缝后面才是正文</p>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">上下两半沿接缝分开，底下的内容才露出来。这不是多层视差。</p>
        </div>
      </div>
      <div
        aria-hidden
        data-cover="top"
        style={topStyle}
        className="absolute inset-x-0 top-0 flex items-end overflow-hidden bg-card px-8 pb-4 text-card-foreground motion-reduce:translate-y-[-100%]"
      >
        <p className="font-display text-4xl tracking-tight">合上的封面</p>
      </div>
      <div
        aria-hidden
        data-cover="bottom"
        style={bottomStyle}
        className="absolute inset-x-0 overflow-hidden bg-muted px-8 pt-4 text-foreground motion-reduce:translate-y-full"
      >
        <p className="text-sm tracking-[0.2em] text-muted-foreground">SCROLL</p>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 h-px bg-border"
        style={{ top: `${seamPct}%`, opacity: opened ? 0 : 1 }}
      />
    </div>
  )
}
