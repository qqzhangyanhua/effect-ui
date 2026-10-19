"use client"

import { Heart, Sparkles, Star, Zap } from "lucide-react"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface BurstIconsProps {
  className?: string
  count?: number
}

const ICONS = [Heart, Star, Sparkles, Zap]
const COLORS = ["#f43f5e", "#f59e0b", "#22d3ee", "#a78bfa"]

function BurstIcons({ className, count = 10 }: BurstIconsProps) {
  const [burst, setBurst] = React.useState(0)
  const reduced = React.useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      mq.addEventListener("change", onStoreChange)
      return () => mq.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )

  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm text-primary-foreground",
        className,
      )}
      onClick={() => setBurst((value) => value + 1)}
    >
      爆发
      {burst > 0
        ? Array.from({ length: count }, (_, index) => {
            const Icon = ICONS[index % ICONS.length] ?? Star
            const angle = (index / count) * Math.PI * 2
            const distance = reduced ? 0 : 56 + (index % 3) * 10
            return (
              <BurstPiece
                key={`${burst}-${index}`}
                angle={angle}
                distance={distance}
                color={COLORS[index % COLORS.length] ?? "#a78bfa"}
                Icon={Icon}
              />
            )
          })
        : null}
    </button>
  )
}

function BurstPiece({
  angle,
  distance,
  color,
  Icon,
}: {
  angle: number
  distance: number
  color: string
  Icon: typeof Star
}) {
  const progress = useMotionValue(0)
  const x = useTransform(progress, (value) => Math.cos(angle) * distance * value)
  const y = useTransform(progress, (value) => Math.sin(angle) * distance * value)
  const opacity = useTransform(progress, [0, 0.15, 1], [0, 1, 0])
  const scale = useTransform(progress, [0, 0.3, 1], [0.4, 1.15, 0.2])

  React.useEffect(() => {
    const control = animate(progress, 1, { duration: 0.7, ease: "easeOut" })
    return () => control.stop()
  }, [progress])

  return (
    <motion.span className="pointer-events-none absolute" style={{ x, y, opacity, scale, color }}>
      <Icon className="size-4" />
    </motion.span>
  )
}

export { BurstIcons }
