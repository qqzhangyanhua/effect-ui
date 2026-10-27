"use client"

import { motion, useMotionValue, useTransform } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface StickyGridScrollProps {
  className?: string
  intensity?: number
  speed?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const TILES = [
  { id: "a", label: "01", hue: 262 },
  { id: "b", label: "02", hue: 200 },
  { id: "c", label: "03", hue: 24 },
  { id: "d", label: "04", hue: 330 },
  { id: "e", label: "05", hue: 152 },
  { id: "f", label: "06", hue: 48 },
  { id: "g", label: "07", hue: 210 },
  { id: "h", label: "08", hue: 280 },
  { id: "i", label: "09", hue: 12 },
]

function Tile({ tile, hero = false }: { tile: (typeof TILES)[number]; hero?: boolean }) {
  return (
    <div
      className={cn("flex items-end rounded-xl p-3 text-sm font-medium text-white", hero ? "min-h-28 flex-1" : "h-24")}
      style={{ background: `linear-gradient(145deg, hsl(${tile.hue} 55% 32%), hsl(${tile.hue} 75% 52%))` }}
    >
      {tile.label}
    </div>
  )
}

function StickyGridScroll({ className, intensity, speed }: StickyGridScrollProps) {
  const reduced = usePrefersReducedMotion()
  const progress = useMotionValue(0)
  const rate = pace(speed)
  const shaped = useTransform(progress, (value) =>
    rate === 1 ? value : Math.pow(Math.min(Math.max(value, 0), 1), rate),
  )
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const leftY = useTransform(shaped, [0, 1], gain === 1 ? [24, -80] : [24 * gain, -80 * gain])
  const rightY = useTransform(shaped, [0, 1], gain === 1 ? [-12, 64] : [-12 * gain, 64 * gain])
  const endScale = gain === 1 ? 3.8 : 1 + (3.8 - 1) * gain
  const scale = useTransform(shaped, [0.12, 0.9], [1, endScale])

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const max = element.scrollHeight - element.clientHeight
    progress.set(max <= 0 ? 0 : element.scrollTop / max)
  }

  return (
    <div
      data-slot="sticky-grid-scroll"
      tabIndex={0}
      aria-label="钉住的图片网格。滚动时两侧错位，中间图片放大到铺满。"
      className={cn("h-96 w-full overflow-auto rounded-xl border bg-background outline-none focus-visible:ring-2 focus-visible:ring-primary", className)}
      onScroll={onScroll}
    >
      <div className="h-[190vh]">
        <div className="sticky top-0 grid h-96 grid-cols-3 gap-3 overflow-hidden p-4">
          {[
            { tiles: TILES.slice(0, 3), motionY: leftY, center: false },
            { tiles: TILES.slice(3, 6), motionY: undefined, center: true },
            { tiles: TILES.slice(6, 9), motionY: rightY, center: false },
          ].map((column) => (
            <motion.div
              key={column.tiles.map((tile) => tile.id).join("-")}
              className="flex flex-col gap-3"
              style={reduced || !column.motionY ? undefined : { y: column.motionY }}
            >
              {column.tiles.map((tile, index) =>
                column.center && index === 1 ? (
                  <motion.div key={tile.id} className="z-10 origin-center" style={reduced ? undefined : { scale }}>
                    <Tile tile={tile} hero />
                  </motion.div>
                ) : (
                  <Tile key={tile.id} tile={tile} />
                ),
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { StickyGridScroll }
