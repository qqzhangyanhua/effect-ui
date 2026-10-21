"use client"

import * as React from "react"
import { motion, useScroll, useSpring, useTransform } from "motion/react"

import { NumberFlow } from "@/components/ui/number-flow"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface ScrollSvgGraphProps {
  className?: string
  speed?: number
  intensity?: number
  color?: string
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const POINTS = [
  { label: "一月", value: 22 },
  { label: "二月", value: 38 },
  { label: "三月", value: 30 },
  { label: "四月", value: 56 },
  { label: "五月", value: 48 },
  { label: "六月", value: 74 },
  { label: "七月", value: 63 },
  { label: "八月", value: 88 },
]

function graphLinePath(values: readonly number[], width = 100, base = 88, scale = 0.72) {
  return values
    .map((value, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width
      const y = base - value * scale
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")
}

function linePath() {
  return graphLinePath(POINTS.map((point) => point.value))
}

function GraphMark({
  x,
  y,
  at,
  progress,
  reduced,
}: {
  x: number
  y: number
  at: number
  progress: ReturnType<typeof useSpring>
  reduced: boolean
}) {
  const scale = useTransform(progress, [at - 0.04, at], reduced ? [1, 1] : [0, 1])
  return <motion.circle cx={x} cy={y} r="1.15" fill="#f5f3ff" style={{ scale }} />
}

function ScrollSvgGraph({ className, speed, intensity, color }: ScrollSvgGraphProps) {
  const reduced = usePrefersReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const rate = pace(speed)
  const smooth = useSpring(
    scrollYProgress,
    reduced ? { duration: 0 } : rate === 1 ? { stiffness: 140, damping: 24 } : { stiffness: 140 * rate, damping: 24 },
  )
  const dash = useTransform(smooth, [0, 1], reduced ? [0, 0] : [100, 0])
  const areaStart = intensity === undefined || intensity === 1 ? 0.15 : 0.15 * intensity
  const areaOpacity = useTransform(smooth, [0, 1], reduced ? [1, 1] : [areaStart, 1])
  const canonical = color === undefined || color.toLowerCase() === "#c4b5fd"
  const stroke = canonical ? "#c4b5fd" : color
  const fill = canonical ? "#a78bfa" : color ?? "#a78bfa"
  const path = linePath()
  const [active, setActive] = React.useState(POINTS[0]?.value ?? 0)
  const area = `${path} L 100 92 L 0 92 Z`

  React.useEffect(() => {
    const unsubscribe = smooth.on("change", (value) => {
      const index = Math.min(POINTS.length - 1, Math.max(0, Math.round(value * (POINTS.length - 1))))
      const next = POINTS[index]?.value ?? 0
      setActive((current) => (current === next ? current : next))
    })
    return unsubscribe
  }, [smooth])

  return (
    <section ref={ref} data-slot="scroll-svg-graph" className={cn("relative h-[200vh]", className)}>
      <div className="sticky top-0 flex h-svh flex-col justify-center px-4">
        <div className="mb-3 flex items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">滚动时折线和面积一起描出来，数值跟着当前点走。</p>
          <p className="text-2xl font-medium">
            <NumberFlow value={reduced ? (POINTS.at(-1)?.value ?? 0) : active} />
          </p>
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-64 w-full" role="img" aria-label="八个月的滚动折线与面积">
          <line x1="0" y1="92" x2="100" y2="92" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
          <motion.path d={area} fill={fill} fillOpacity="0.22" stroke="none" style={{ opacity: areaOpacity }} />
          <motion.path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            style={{ strokeDashoffset: dash }}
          />
          {POINTS.map((point, index) => {
            const x = (index / (POINTS.length - 1)) * 100
            const y = 88 - point.value * 0.72
            const marker = index / (POINTS.length - 1)
            return (
              <GraphMark key={point.label} x={x} y={y} at={marker} progress={smooth} reduced={reduced} />
            )
          })}
        </svg>
        <table className="sr-only">
          <caption>折线数据</caption>
          <tbody>
            {POINTS.map((point) => (
              <tr key={point.label}>
                <th scope="row">{point.label}</th>
                <td>{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export { ScrollSvgGraph, graphLinePath }
