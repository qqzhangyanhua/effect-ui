"use client"

import * as React from "react"
import { useMotionValueEvent, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface WobbleLineCursorProps {
  lines?: number
  className?: string
  speed?: number
  intensity?: number
  color?: string
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function WobbleString({
  index,
  count,
  pointer,
  reduced,
  speed,
  intensity,
  color,
}: {
  index: number
  count: number
  pointer: { x: number; y: number } | null
  reduced: boolean
  speed?: number
  intensity?: number
  color?: string
}) {
  const base = ((index + 1) / (count + 1)) * 100
  const near = pointer && Math.abs(pointer.y - base) < 18
  const bend = useSpring(0, { stiffness: 260 * pace(speed), damping: 16, mass: 0.35 })
  const [offset, setOffset] = React.useState(0)
  const control = pointer?.x ?? 50
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity

  React.useEffect(() => {
    bend.set(reduced || !near || !pointer ? 0 : (pointer.y - base) * 1.4 * gain)
  }, [bend, near, pointer, base, reduced, gain])

  useMotionValueEvent(bend, "change", (value) => {
    setOffset(value)
  })

  const path = `M 0 ${base} Q ${control} ${base + (reduced ? 0 : offset)} 100 ${base}`

  return <path d={path} fill="none" stroke={color ?? "currentColor"} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
}

function WobbleLineCursor({ lines = 5, className, speed, intensity, color }: WobbleLineCursorProps) {
  const reduced = usePrefersReducedMotion()
  const [pointer, setPointer] = React.useState<{ x: number; y: number } | null>(null)

  return (
    <div
      data-slot="wobble-line-cursor"
      className={cn("relative h-56 overflow-hidden rounded-xl border bg-slate-950 text-sky-100", className)}
      onPointerMove={(event) => {
        if (reduced || window.matchMedia("(pointer: coarse)").matches) return
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({
          x: ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100,
          y: ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100,
        })
      }}
      onPointerLeave={() => setPointer(null)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-label="可以被拨动的弦">
        {Array.from({ length: lines }, (_, index) => (
          <WobbleString key={index} index={index} count={lines} pointer={pointer} reduced={reduced} speed={speed} intensity={intensity} color={color} />
        ))}
      </svg>
    </div>
  )
}

export { WobbleLineCursor }
