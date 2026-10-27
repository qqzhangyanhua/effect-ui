"use client"

import * as React from "react"
import { motion, useSpring } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface RepetitionImageHoverProps {
  label?: string
  layers?: number
  className?: string
}

function Echo({
  index,
  count,
  nx,
  ny,
  hovering,
  label,
}: {
  index: number
  count: number
  nx: number
  ny: number
  hovering: boolean
  label: string
}) {
  const factor = index / Math.max(count - 1, 1)
  const x = useSpring(0, { stiffness: 220, damping: 18 })
  const y = useSpring(0, { stiffness: 220, damping: 18 })
  React.useEffect(() => {
    x.set(hovering ? nx * factor * 1.7 : 0)
    y.set(hovering ? ny * factor * 1.7 : 0)
  }, [factor, hovering, nx, ny, x, y])
  const scale = 1 - factor * 0.55
  const opacity = hovering || index === 0 ? 1 - factor * 0.62 : 0
  return (
    <motion.div
      aria-hidden={index === 0 ? undefined : true}
      className="absolute top-1/2 left-1/2 flex h-48 w-64 items-end rounded-2xl p-4 text-slate-950 shadow-lg"
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex: count - index,
        marginLeft: "-8rem",
        marginTop: "-6rem",
        backgroundImage: `linear-gradient(145deg, hsl(${18 + index * 16} 82% ${68 - index * 6}%), hsl(${32 + index * 10} 70% 42%))`,
      }}
    >
      <span className="text-lg font-medium">{label}</span>
    </motion.div>
  )
}

function RepetitionImageHover({ label = "回声", layers = 5, className }: RepetitionImageHoverProps) {
  const reduced = usePrefersReducedMotion()
  const count = Math.min(8, Math.max(2, Math.round(layers)))
  const [point, setPoint] = React.useState({ x: 0, y: 0, hovering: false })

  if (reduced) {
    return (
      <div data-slot="repetition-image-hover" className={cn("relative h-72", className)}>
        <div className="absolute top-1/2 left-1/2 flex h-48 w-64 -translate-x-1/2 -translate-y-1/2 items-end rounded-2xl bg-linear-to-br from-orange-300 to-rose-500 p-4 text-lg text-slate-950">{label}</div>
      </div>
    )
  }

  return (
    <div
      data-slot="repetition-image-hover"
      className={cn("relative h-80 overflow-hidden rounded-xl border bg-slate-950", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        const length = Math.hypot(dx, dy)
        if (length < 8) {
          setPoint({ x: 140, y: 0, hovering: true })
          return
        }
        const reach = Math.max(140, Math.min(170, length))
        setPoint({
          x: (dx / length) * reach,
          y: (dy / length) * Math.min(64, reach),
          hovering: true,
        })
      }}
      onPointerLeave={() => setPoint({ x: 0, y: 0, hovering: false })}
    >
      {Array.from({ length: count }, (_, index) => (
        <Echo key={index} index={index} count={count} nx={point.x} ny={point.y} hovering={point.hovering} label={label} />
      ))}
    </div>
  )
}

export { RepetitionImageHover }
