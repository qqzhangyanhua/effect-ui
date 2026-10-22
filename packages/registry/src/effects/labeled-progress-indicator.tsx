"use client"

// Ported from Watermelon UI (MIT, (c) 2025-present Watermelon Contributors) — https://github.com/WatermelonCorp/watermellon-registry/blob/86052b8/src/components/watermelon-ui/labeled-progress-indicator-base.tsx

import { useEffect, useId, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export interface LabeledProgressIndicatorProps {
  labels: string[]
  progress?: number
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  className?: string
}

export function LabeledProgressIndicator({
  labels,
  progress = 55,
  color = "var(--primary)",
  duration = 2000,
  intensity = 60,
  speed = 1,
  className,
}: LabeledProgressIndicatorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const sweepName = `labeled-progress-sweep-${useId().replace(/:/g, "")}`
  const [labelIndex, setLabelIndex] = useState(0)
  const safeLabels = labels.length > 0 ? labels : [""]
  const index = labelIndex % safeLabels.length
  const label = safeLabels[index] ?? ""
  const fill = Math.min(100, Math.max(0, progress))
  const wait = Math.max(400, duration)
  const sweepMs = wait / Math.max(speed, 0.1)
  const moving = live && !reduced
  const tilt = Math.min(80, Math.max(0, intensity))

  useEffect(() => {
    if (!moving || safeLabels.length < 2) return
    const timer = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % safeLabels.length)
    }, wait)
    return () => clearInterval(timer)
  }, [moving, safeLabels.length, wait])

  return (
    <div
      ref={rootRef}
      data-slot="labeled-progress-indicator"
      data-motion={moving ? "on" : "off"}
      className={`flex w-full max-w-sm flex-col items-center gap-5 motion-reduce:transition-none ${className ?? ""}`}
    >
      <style>{`@keyframes ${sweepName}{from{transform:translateX(-100%)}to{transform:translateX(200%)}}`}</style>
      <div className="relative flex h-14 w-full items-center justify-center [perspective:800px]">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={label}
            initial={reduced ? false : { opacity: 0, y: 10, filter: "blur(4px)", rotateX: -tilt }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", rotateX: tilt }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 32 }}
            className="text-3xl font-bold text-muted-foreground motion-reduce:transform-none"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full border border-border bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fill} aria-valuetext={label}>
        <div className="relative h-full overflow-hidden rounded-full" style={{ width: `${fill}%`, background: color }}>
          <span
            className="absolute inset-y-0 w-1/3 bg-foreground/20 motion-reduce:hidden"
            style={{
              animationName: reduced ? undefined : sweepName,
              animationDuration: `${sweepMs}ms`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationPlayState: moving ? "running" : "paused",
            }}
          />
        </div>
      </div>
    </div>
  )
}
