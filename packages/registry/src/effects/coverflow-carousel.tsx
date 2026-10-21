"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface CoverflowItem {
  title: string
  tint: string
}

export interface CoverflowCarouselProps {
  items?: CoverflowItem[]
  className?: string
  /** 侧卡转角。不传或 42 仍是 42°。 */
  angle?: number
  /** 侧卡缩放倍率。不传或 1 时侧卡仍是 0.82。 */
  scale?: number
  /** 弹簧倍率。不传或 1 时刚度 260、阻尼 28。 */
  speed?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const defaultItems: CoverflowItem[] = [
  { title: "Shaders", tint: "#7c3aed" },
  { title: "Globe", tint: "#22d3ee" },
  { title: "Sections", tint: "#f472b6" },
  { title: "Cursors", tint: "#f59e0b" },
  { title: "Bento", tint: "#34d399" },
]

function CoverflowCarousel({ items = defaultItems, className, angle, scale, speed }: CoverflowCarouselProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const last = Math.max(items.length - 1, 0)
  const turn = angle === undefined || angle === 42 ? 42 : angle
  const side = scale === undefined || scale === 1 ? 0.82 : 0.82 * scale
  const rate = pace(speed)

  const step = (delta: number) => setIndex((current) => Math.min(last, Math.max(0, current + delta)))

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-64 [perspective:1100px]">
        {items.map((item, itemIndex) => {
          const offset = itemIndex - index
          const hidden = Math.abs(offset) > 2
          return (
            <motion.button
              key={item.title}
              type="button"
              aria-current={offset === 0}
              onClick={() => setIndex(itemIndex)}
              animate={{
                x: `${offset * 58}%`,
                rotateY: reduced ? 0 : offset * -turn,
                scale: offset === 0 ? 1 : side,
                z: reduced ? 0 : -Math.abs(offset) * 80,
                opacity: hidden ? 0 : 1,
              }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: rate === 1 ? 260 : 260 * rate, damping: rate === 1 ? 28 : 28 * rate }
              }
              className="absolute top-4 left-1/2 h-52 w-40 -translate-x-1/2 rounded-2xl border border-white/20 text-white shadow-xl"
              style={{
                zIndex: 20 - Math.abs(offset),
                background: `linear-gradient(160deg, ${item.tint}, #09090b)`,
                transformStyle: "preserve-3d",
              }}
            >
              <span className="font-display text-xl">{item.title}</span>
            </motion.button>
          )
        })}
      </div>
      <div className="mt-2 flex justify-center gap-2">
        <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => step(-1)}>
          上一张
        </button>
        <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={() => step(1)}>
          下一张
        </button>
      </div>
    </div>
  )
}

export { CoverflowCarousel }
