"use client"

// Ported from Amicro (MIT, (c) 2026 SYED SUBHAN UDDIN) — https://github.com/Subhan-code/Amicro--Micro-transitions-/blob/dc2a183/registry/ui/loading/wave-physics-loader.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import { useMemo, useRef } from "react"

export interface WavePhysicsLoaderProps {
  color?: string
  count?: number
  duration?: number
  speed?: number
  intensity?: number
  size?: number
  gap?: number
  className?: string
}

const FRAMES = 201
const BASE = 16
const BOUNCES = 4
const MAX_BOUNCE = 60

function buildWave(numBars: number, barWidth: number, barGap: number, wavePeakH: number) {
  const step = barWidth + barGap
  const bars = Array.from({ length: numBars }, () => ({ height: [] as string[], opacity: [] as number[] }))
  const ballX: string[] = []
  const ballY: string[] = []
  const scaleX: number[] = []
  const scaleY: number[] = []
  const times: number[] = []

  for (let frame = 0; frame < FRAMES; frame += 1) {
    const t = frame / (FRAMES - 1)
    times.push(t)
    const xFrac = t < 0.5 ? t / 0.5 : (1 - t) / 0.5
    const ballIndex = xFrac * (numBars - 1)
    ballX.push(`${ballIndex * step}px`)

    let bounce = (xFrac * BOUNCES) % 1
    if (xFrac === 0 || xFrac === 1) bounce = 0
    const bounceHeight = 4 * bounce * (1 - bounce)
    const landed = Math.max(0, 1 - bounceHeight * 2)
    const ballIndent = landed * 20
    ballY.push(`-${BASE + wavePeakH - ballIndent + bounceHeight * MAX_BOUNCE}px`)
    scaleY.push(1 - landed * 0.3)
    scaleX.push(1 + landed * 0.25)

    for (let index = 0; index < numBars; index += 1) {
      const bar = bars[index]
      if (!bar) continue
      const dist = Math.abs(index - ballIndex)
      const wave = dist < 3 ? Math.cos((dist / 3) * (Math.PI / 2)) : 0
      const indent = dist < 1.5 ? Math.cos((dist / 1.5) * (Math.PI / 2)) * landed * 20 : 0
      bar.height.push(`${Math.max(4, BASE + wave * wavePeakH - indent)}px`)
      bar.opacity.push(0.35 + wave * 0.65)
    }
  }

  return { bars, ballX, ballY, scaleX, scaleY, times }
}

export function WavePhysicsLoader({
  color = "var(--foreground)",
  count = 15,
  duration = 4000,
  speed = 1,
  intensity = 48,
  size = 12,
  gap = 8,
  className,
}: WavePhysicsLoaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const moving = live && !reduced
  const bars = Math.max(1, Math.round(count))
  const width = Math.max(1, size)
  const space = Math.max(0, gap)
  const peak = Math.max(0, intensity)
  const seconds = Math.max(0.2, duration / 1000 / Math.max(speed, 0.1))
  const model = useMemo(() => buildWave(bars, width, space, peak), [bars, width, space, peak])
  const track = bars * width + Math.max(0, bars - 1) * space
  const rest = moving
    ? null
    : {
        height: model.bars[0]?.height[0] ?? `${BASE}px`,
        opacity: model.bars[0]?.opacity[0] ?? 0.35,
        x: model.ballX[0] ?? "0px",
        y: model.ballY[0] ?? "0px",
        scaleX: model.scaleX[0] ?? 1,
        scaleY: model.scaleY[0] ?? 1,
      }

  return (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      data-slot="wave-physics-loader"
      data-motion={moving ? "on" : "off"}
      className={cn("flex items-center justify-center motion-reduce:transform-none", className)}
    >
      <div className="relative flex items-end" style={{ width: track, height: BASE + peak + MAX_BOUNCE + width, gap: space }}>
        {model.bars.map((bar, index) => (
          <motion.div
            key={index}
            className="origin-bottom rounded-full"
            style={{ width, background: color }}
            initial={false}
            animate={moving ? { height: bar.height, opacity: bar.opacity } : { height: bar.height[0] ?? rest?.height, opacity: bar.opacity[0] ?? rest?.opacity }}
            transition={moving ? { duration: seconds, repeat: Infinity, times: model.times, ease: "linear" } : { duration: 0 }}
          />
        ))}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 rounded-full"
          style={{ width, height: width, background: color, transformOrigin: "bottom center" }}
          initial={false}
          animate={
            moving
              ? { x: model.ballX, y: model.ballY, scaleX: model.scaleX, scaleY: model.scaleY }
              : { x: rest?.x, y: rest?.y, scaleX: rest?.scaleX, scaleY: rest?.scaleY }
          }
          transition={moving ? { duration: seconds, repeat: Infinity, times: model.times, ease: "linear" } : { duration: 0 }}
        />
      </div>
    </div>
  )
}
