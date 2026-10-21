"use client"

import { Heart, Sparkles, Star, Zap } from "lucide-react"
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface BurstIconsProps {
  className?: string
  count?: number
  colors?: readonly string[]
  duration?: number
  scale?: number
  size?: number
}

const ICONS = [Heart, Star, Sparkles, Zap]
const COLORS = ["#f43f5e", "#f59e0b", "#22d3ee", "#a78bfa"]

function BurstIcons({ className, count = 10, colors, duration, scale, size }: BurstIconsProps) {
  const palette = colors ?? COLORS
  const reach = scale === undefined || scale === 1 ? 1 : scale
  const durationMs = duration === undefined || duration === 700 ? undefined : duration
  const iconSize = size === undefined || size === 16 ? undefined : size
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
            const distance = reduced ? 0 : (56 + (index % 3) * 10) * reach
            return (
              <BurstPiece
                key={`${burst}-${index}`}
                angle={angle}
                distance={distance}
                color={palette[index % palette.length] ?? "#a78bfa"}
                durationMs={durationMs}
                iconSize={iconSize}
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
  durationMs,
  iconSize,
  Icon,
}: {
  angle: number
  distance: number
  color: string
  durationMs?: number
  iconSize?: number
  Icon: typeof Star
}) {
  const progress = useMotionValue(0)
  const x = useTransform(progress, (value) => Math.cos(angle) * distance * value)
  const y = useTransform(progress, (value) => Math.sin(angle) * distance * value)
  const opacity = useTransform(progress, [0, 0.15, 1], [0, 1, 0])
  const scale = useTransform(progress, [0, 0.3, 1], [0.4, 1.15, 0.2])

  React.useEffect(() => {
    const control = animate(
      progress,
      1,
      durationMs === undefined ? { duration: 0.7, ease: "easeOut" } : { duration: durationMs / 1000, ease: "easeOut" },
    )
    return () => control.stop()
  }, [progress, durationMs])

  return (
    <motion.span className="pointer-events-none absolute" style={{ x, y, opacity, scale, color }}>
      <Icon
        className={iconSize === undefined ? "size-4" : undefined}
        style={iconSize === undefined ? undefined : { width: iconSize, height: iconSize }}
      />
    </motion.span>
  )
}

export { BurstIcons }
