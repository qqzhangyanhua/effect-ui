"use client"

import { motion } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HeatmapCalendarProps {
  year?: number
  className?: string
}

const LEVELS = ["#e5e7eb", "#bbf7d0", "#4ade80", "#16a34a", "#14532d"]
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"]

function levelFor(index: number) {
  const noise = Math.sin(index * 12.9898) * 43758.5453
  return Math.floor((noise - Math.floor(noise)) * 5)
}

function HeatmapCalendar({ year = 2026, className }: HeatmapCalendarProps) {
  const reduced = usePrefersReducedMotion()
  const [tip, setTip] = React.useState<{ x: number; y: number; text: string } | null>(null)
  const start = new Date(Date.UTC(year, 0, 1))
  const startOffset = start.getUTCDay()
  const days = Math.ceil((Date.UTC(year + 1, 0, 1) - start.getTime()) / 86400000)
  const cells = Array.from({ length: startOffset + days }, (_, index) => {
    if (index < startOffset) return null
    const date = new Date(start.getTime() + (index - startOffset) * 86400000)
    return {
      key: date.toISOString().slice(0, 10),
      level: levelFor(index),
    }
  })
  const weeks: (typeof cells)[] = []
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7))

  const showTip = (event: React.SyntheticEvent<HTMLButtonElement>, text: string) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setTip({ x: rect.left + rect.width / 2, y: rect.top, text })
  }

  return (
    <div data-slot="heatmap-calendar" className={cn("w-full", className)}>
      <p className="mb-3 text-sm font-medium">{year}</p>
      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-0.5 text-[10px] text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <motion.div
              key={weekIndex}
              className="flex flex-col gap-1"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.28, delay: reduced ? 0 : weekIndex * 0.012 }}
            >
              {week.map((cell, dayIndex) =>
                cell ? (
                  <button
                    key={cell.key}
                    type="button"
                    aria-label={`${cell.key}，${cell.level} 次`}
                    className="size-3 rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ background: LEVELS[cell.level] }}
                    onPointerEnter={(event) => showTip(event, `${cell.key} · ${cell.level} 次`)}
                    onFocus={(event) => showTip(event, `${cell.key} · ${cell.level} 次`)}
                    onPointerLeave={() => setTip(null)}
                    onBlur={() => setTip(null)}
                  />
                ) : (
                  <span key={`empty-${weekIndex}-${dayIndex}`} className="size-3" />
                ),
              )}
            </motion.div>
          ))}
        </div>
      </div>
      {tip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-8 rounded-md bg-foreground px-2 py-1 text-xs text-background"
          style={{ left: tip.x, top: tip.y }}
        >
          {tip.text}
        </div>
      ) : null}
    </div>
  )
}

export { HeatmapCalendar }
