"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/physics/elastic-line.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useDimensions } from "@/hooks/use-dimensions"
import { useElasticLineEvents } from "@/hooks/use-elastic-line-events"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

import { animate, motion, useAnimationFrame, useMotionValue, type ValueAnimationTransition } from "motion/react"
import { useEffect, useRef, useState } from "react"

export interface ElasticLineProps {
  isVertical?: boolean
  grabThreshold?: number
  releaseThreshold?: number
  strokeWidth?: number
  transition?: ValueAnimationTransition
  animateInTransition?: ValueAnimationTransition
  className?: string
}

const defaultSpring: ValueAnimationTransition = { type: "spring", stiffness: 300, damping: 5 }
const defaultEntrance: ValueAnimationTransition = { duration: 0.3, ease: "easeInOut" }

export function ElasticLine({
  isVertical = false,
  grabThreshold = 5,
  releaseThreshold = 100,
  strokeWidth = 1,
  transition = defaultSpring,
  animateInTransition = defaultEntrance,
  className,
}: ElasticLineProps) {
  const containerRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const dimensions = useDimensions(containerRef)
  const prefersReducedMotion = usePrefersReducedMotion()
  const motionOn = useAnimationActive(containerRef)
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false)
  const clampedReleaseThreshold = Math.min(releaseThreshold, Math.max(isVertical ? dimensions.width / 2 : dimensions.height / 2, 0))
  const { isGrabbed, controlPoint } = useElasticLineEvents(containerRef, isVertical, grabThreshold, clampedReleaseThreshold)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const pathLength = useMotionValue(prefersReducedMotion ? 1 : 0)

  useEffect(() => {
    if (dimensions.width <= 0 || dimensions.height <= 0) return
    x.set(dimensions.width / 2)
    y.set(dimensions.height / 2)
    if (prefersReducedMotion) {
      pathLength.set(1)
      queueMicrotask(() => setHasAnimatedIn(true))
      return
    }
    if (hasAnimatedIn) return
    const controls = animate(pathLength, 1, {
      ...animateInTransition,
      onComplete: () => setHasAnimatedIn(true),
    })
    return () => controls.stop()
  }, [animateInTransition, dimensions.height, dimensions.width, hasAnimatedIn, pathLength, prefersReducedMotion, x, y])

  useEffect(() => {
    if (prefersReducedMotion || !hasAnimatedIn || isGrabbed) return
    const xControls = animate(x, dimensions.width / 2, transition)
    const yControls = animate(y, dimensions.height / 2, transition)
    return () => {
      xControls.stop()
      yControls.stop()
    }
  }, [dimensions.height, dimensions.width, hasAnimatedIn, isGrabbed, prefersReducedMotion, transition, x, y])

  useAnimationFrame(() => {
    const straightX = dimensions.width / 2
    const straightY = dimensions.height / 2
    if (prefersReducedMotion || !motionOn) {
      pathRef.current?.setAttribute(
        "d",
        isVertical
          ? `M${straightX} 0Q${straightX} ${straightY} ${straightX} ${dimensions.height}`
          : `M0 ${straightY}Q${straightX} ${straightY} ${dimensions.width} ${straightY}`,
      )
      return
    }
    if (isGrabbed) {
      x.set(controlPoint.x)
      y.set(controlPoint.y)
    }
    const controlX = hasAnimatedIn ? x.get() : straightX
    const controlY = hasAnimatedIn ? y.get() : straightY
    pathRef.current?.setAttribute(
      "d",
      isVertical
        ? `M${straightX} 0Q${controlX} ${controlY} ${straightX} ${dimensions.height}`
        : `M0 ${straightY}Q${controlX} ${controlY} ${dimensions.width} ${straightY}`,
    )
  })

  return (
    <svg
      aria-hidden
      className={cn("h-full w-full", className)}
      data-reduced={prefersReducedMotion ? "true" : "false"}
      data-slot="elastic-line"
      preserveAspectRatio="none"
      ref={containerRef}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
    >
      <motion.path fill="none" initial={{ pathLength: prefersReducedMotion ? 1 : 0 }} ref={pathRef} stroke="currentColor" strokeWidth={strokeWidth} style={{ pathLength }} />
    </svg>
  )
}
