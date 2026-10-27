"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface ClickSparkProps {
  className?: string
  count?: number
  duration?: number
  scale?: number
  size?: number
  color?: string
  children?: React.ReactNode
}

interface Spark {
  id: number
  x: number
  y: number
}

function ClickSpark({ className, count = 12, duration, scale, size, color, children }: ClickSparkProps) {
  const reduced = usePrefersReducedMotion()
  const [sparks, setSparks] = React.useState<Spark[]>([])
  const timers = React.useRef<number[]>([])

  React.useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer)
    },
    [],
  )

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    if (event.target instanceof Element && event.target.closest("a, button")) return
    const rect = event.currentTarget.getBoundingClientRect()
    const spark = {
      id: Date.now() + Math.random(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
    setSparks((current) => [...current.slice(-10), spark])
    const timer = window.setTimeout(() => {
      setSparks((current) => current.filter((item) => item.id !== spark.id))
    }, duration === undefined || duration === 450 ? 520 : duration + 70)
    timers.current.push(timer)
  }

  return (
    <div
      data-slot="click-spark"
      className={cn(
        "relative min-h-48 w-full overflow-hidden rounded-xl border border-dashed bg-zinc-950 text-zinc-100",
        className,
      )}
      onPointerDown={onPointerDown}
    >
      <div className="grid min-h-48 place-items-center p-6 text-sm text-zinc-400">
        {children ?? "点击任意处"}
      </div>
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="pointer-events-none absolute"
          style={{ left: spark.x, top: spark.y }}
        >
          {Array.from({ length: count }, (_, index) => {
            const angle = (index / count) * 360
            return (
              <motion.span
                key={index}
                className={
                  (size === undefined || size === 12) && !color
                    ? "absolute top-0 left-0 h-0.5 w-3 origin-left rounded-full bg-amber-200"
                    : cn(
                        "absolute top-0 left-0 h-0.5 origin-left rounded-full",
                        (size === undefined || size === 12) && "w-3",
                        !color && "bg-amber-200",
                      )
                }
                style={{
                  rotate: angle,
                  ...(size === undefined || size === 12 ? null : { width: size }),
                  ...(color ? { backgroundColor: color } : null),
                }}
                initial={{ x: 4, scaleX: 0.3, opacity: 1 }}
                animate={{ x: scale === undefined || scale === 1 ? 22 : 22 * scale, scaleX: 1, opacity: 0 }}
                transition={{
                  duration: duration === undefined || duration === 450 ? 0.45 : duration / 1000,
                  ease: "easeOut",
                }}
              />
            )
          })}
        </span>
      ))}
    </div>
  )
}

export { ClickSpark }
