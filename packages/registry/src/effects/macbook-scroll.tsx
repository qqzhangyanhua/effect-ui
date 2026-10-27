"use client"

import { motion, useMotionValue, useTransform } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface MacbookScrollProps {
  className?: string
  intensity?: number
  scale?: number
  speed?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

function ScreenMock() {
  return (
    <div className="flex h-full flex-col bg-zinc-950 p-3 text-zinc-100">
      <div className="mb-3 h-2 w-16 rounded-full bg-white/30" />
      <div className="grid flex-1 grid-cols-[4rem_1fr] gap-2">
        <div className="space-y-2">
          <div className="h-8 rounded-md bg-cyan-400/70" />
          <div className="h-8 rounded-md bg-white/15" />
          <div className="h-8 rounded-md bg-white/15" />
        </div>
        <div className="rounded-md bg-[linear-gradient(160deg,#312e81,#0e7490_60%,#b45309)] p-3">
          <div className="h-2 w-1/2 rounded-full bg-white/70" />
          <div className="mt-6 h-16 rounded-md bg-white/20" />
        </div>
      </div>
    </div>
  )
}

function MacbookScroll({ className, intensity, scale: endScale, speed }: MacbookScrollProps) {
  const reduced = usePrefersReducedMotion()
  const progress = useMotionValue(reduced ? 1 : 0)
  const rate = pace(speed)
  const shaped = useTransform(progress, (value) =>
    rate === 1 ? value : Math.pow(Math.min(Math.max(value, 0), 1), rate),
  )
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const open = gain === 1 ? 68 : 68 * gain
  const end = endScale === undefined || endScale === 1 ? 1.7 : 1.7 * endScale
  const rotateX = useTransform(shaped, [0, 0.62], [-open, 0])
  const scale = useTransform(shaped, [0.4, 1], [1, end])

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (reduced) return
    const element = event.currentTarget
    const max = element.scrollHeight - element.clientHeight
    progress.set(max <= 0 ? 1 : element.scrollTop / max)
  }

  return (
    <div
      data-slot="macbook-scroll"
      tabIndex={0}
      aria-label="滚动时笔记本屏幕打开，画面再稍微放大。这是通用机身，没有品牌标志。"
      className={cn(
        "h-96 w-full overflow-auto rounded-xl border bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
      onScroll={onScroll}
    >
      <div className="h-[180vh]">
        <div className="sticky top-0 grid h-96 place-items-center [perspective:1100px]">
          <div className="w-72">
            <motion.div
              className="origin-bottom overflow-visible rounded-t-xl border border-b-0 border-white/20 bg-zinc-800 p-2"
              style={reduced ? { rotateX: 0 } : { rotateX }}
            >
              <motion.div className="h-40 overflow-hidden rounded-md" style={reduced ? undefined : { scale }}>
                <ScreenMock />
              </motion.div>
            </motion.div>
            <div className="h-3 rounded-b-xl bg-zinc-700 shadow-[0_16px_30px_rgba(0,0,0,0.35)]">
              <div className="mx-auto h-1 w-16 rounded-b-md bg-zinc-500" />
            </div>
            <p className="mt-4 text-center text-xs text-zinc-400">滚动展开屏幕</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { MacbookScroll }
