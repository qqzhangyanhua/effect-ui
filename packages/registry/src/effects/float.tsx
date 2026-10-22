"use client"

// Ported from Fancy Components (MIT, (c) 2024 Daniel Petho) — https://github.com/danielpetho/fancy/blob/main/src/fancy/components/blocks/float.tsx. Modified for effect-ui.

import { motion, useMotionValue } from "motion/react"
import { useEffect, useRef, type ReactNode } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface FloatProps {
  children: ReactNode
  speed?: number
  amplitude?: readonly [number, number, number]
  rotationRange?: readonly [number, number, number]
  timeOffset?: number
  className?: string
}

function axis(values: readonly number[] | undefined, index: number, fallback: number) {
  return values?.[index] ?? fallback
}

export function Float({
  children,
  speed = 0.5,
  amplitude = [10, 30, 30],
  rotationRange = [15, 15, 7.5],
  timeOffset = 0,
  className,
}: FloatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const active = useAnimationActive(ref)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const z = useMotionValue(0)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const rotateZ = useMotionValue(0)
  const ax = axis(amplitude, 0, 10)
  const ay = axis(amplitude, 1, 30)
  const az = axis(amplitude, 2, 30)
  const rx = axis(rotationRange, 0, 15)
  const ry = axis(rotationRange, 1, 15)
  const rz = axis(rotationRange, 2, 7.5)
  const motionOn = !reduced && active

  useEffect(() => {
    if (!motionOn) {
      x.set(0)
      y.set(0)
      z.set(0)
      rotateX.set(0)
      rotateY.set(0)
      rotateZ.set(0)
      return
    }
    let frame = 0
    const started = performance.now()
    const tick = (now: number) => {
      const time = ((now - started) / 1000) * speed + timeOffset
      x.set(Math.sin(time * 0.7) * ax)
      y.set(Math.sin(time * 0.6) * ay)
      z.set(Math.sin(time * 0.5) * az)
      rotateX.set(Math.sin(time * 0.5) * rx)
      rotateY.set(Math.sin(time * 0.4) * ry)
      rotateZ.set(Math.sin(time * 0.3) * rz)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, ax, ay, az, motionOn, rotateX, rotateY, rotateZ, rx, ry, rz, speed, timeOffset, x, y, z])

  return (
    <div ref={ref} className={cn("[perspective:600px]", className)} data-motion={motionOn ? "on" : "off"} data-reduced={reduced ? "true" : "false"} data-slot="float">
      <motion.div style={{ x, y, z, rotateX, rotateY, rotateZ, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  )
}
