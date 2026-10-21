"use client"

import * as React from "react"
import { useMotionValueEvent, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WobbleLineCursorProps {
  lines?: number
  className?: string
}

function WobbleString({
  index,
  count,
  pointer,
  reduced,
}: {
  index: number
  count: number
  pointer: { x: number; y: number } | null
  reduced: boolean
}) {
  const base = ((index + 1) / (count + 1)) * 100
  const near = pointer && Math.abs(pointer.y - base) < 18
  const bend = useSpring(0, { stiffness: 260, damping: 16, mass: 0.35 })
  const [offset, setOffset] = React.useState(0)
  const control = pointer?.x ?? 50

  React.useEffect(() => {
    bend.set(reduced || !near || !pointer ? 0 : (pointer.y - base) * 1.4)
  }, [bend, near, pointer, base, reduced])

  useMotionValueEvent(bend, "change", (value) => {
    setOffset(value)
  })

  const path = `M 0 ${base} Q ${control} ${base + (reduced ? 0 : offset)} 100 ${base}`

  return <path d={path} fill="none" stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
}

function WobbleLineCursor({ lines = 5, className }: WobbleLineCursorProps) {
  const reduced = usePrefersReducedMotion()
  const [pointer, setPointer] = React.useState<{ x: number; y: number } | null>(null)

  return (
    <div
      data-slot="wobble-line-cursor"
      className={cn("relative h-56 overflow-hidden rounded-xl border bg-slate-950 text-sky-100", className)}
      onPointerMove={(event) => {
        if (reduced) return
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
          <WobbleString key={index} index={index} count={lines} pointer={pointer} reduced={reduced} />
        ))}
      </svg>
    </div>
  )
}

export { WobbleLineCursor }
