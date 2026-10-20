"use client"

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface Scroll3dImageRotateProps {
  className?: string
}

const CARDS = [
  { id: "north", label: "01", hue: 262 },
  { id: "east", label: "02", hue: 190 },
  { id: "south", label: "03", hue: 28 },
  { id: "west", label: "04", hue: 330 },
]

function FlipCard({
  card,
  index,
  progress,
  reduced,
}: {
  card: (typeof CARDS)[number]
  index: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const start = index * 0.16
  const rotateY = useTransform(progress, [start, start + 0.16, start + 0.34], [80, 0, -80])
  const opacity = useTransform(progress, [start, start + 0.08, start + 0.28, start + 0.38], [0.15, 1, 1, 0.15])
  return (
    <motion.div
      className="absolute inset-x-8 top-10 flex h-48 items-end rounded-2xl p-4 text-2xl font-medium text-white shadow-xl"
      style={{
        background: `linear-gradient(150deg, hsl(${card.hue} 55% 32%), hsl(${card.hue} 75% 52%))`,
        rotateY: reduced ? 0 : rotateY,
        opacity: reduced ? 1 : opacity,
      }}
    >
      {card.label}
    </motion.div>
  )
}

function Scroll3dImageRotate({ className }: Scroll3dImageRotateProps) {
  const reduced = usePrefersReducedMotion()
  const progress = useMotionValue(0)

  return (
    <div
      data-slot="scroll-3d-image-rotate"
      tabIndex={0}
      aria-label="滚动时色块绕竖直轴翻入再翻出。"
      className={cn(
        "h-96 w-full overflow-auto rounded-xl border bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onScroll={(event) => {
        if (reduced) return
        const element = event.currentTarget
        const max = element.scrollHeight - element.clientHeight
        progress.set(max <= 0 ? 1 : element.scrollTop / max)
      }}
    >
      <div className="h-[220vh]">
        <div className="sticky top-0 h-96 [perspective:900px]">
          {CARDS.map((card, index) => (
            <FlipCard key={card.id} card={card} index={index} progress={progress} reduced={reduced} />
          ))}
          <p className="absolute bottom-4 left-4 text-xs text-zinc-400">
            {reduced ? "色块叠放，不再翻转。" : "在这个区域里滚动。"}
          </p>
        </div>
      </div>
    </div>
  )
}

export { Scroll3dImageRotate }
