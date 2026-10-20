"use client"

import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface WaveRow {
  id: string
  title: string
  note: string
  hue: number
}

export interface DualWaveTextListProps {
  rows?: readonly WaveRow[]
  className?: string
}

const ROWS: readonly WaveRow[] = [
  { id: "signal", title: "信号", note: "把滚动变成左右相反的波", hue: 262 },
  { id: "orbit", title: "轨道", note: "靠近中线的一行切换画面", hue: 190 },
  { id: "field", title: "场域", note: "两列文字共用同一组条目", hue: 28 },
  { id: "pulse", title: "脉冲", note: "方向键也能改选中行", hue: 330 },
  { id: "layer", title: "层次", note: "中间色块跟着当前标题", hue: 152 },
  { id: "drift", title: "漂移", note: "减弱动效时波浪停止", hue: 210 },
]

function WaveButton({
  row,
  index,
  side,
  progress,
  active,
  reduced,
  onSelect,
}: {
  row: WaveRow
  index: number
  side: "left" | "right"
  progress: MotionValue<number>
  active: boolean
  reduced: boolean
  onSelect: (id: string) => void
}) {
  const y = useTransform(progress, (value) => {
    const wave = Math.sin(value * Math.PI * 4 + index * 0.7)
    return (side === "left" ? wave : -wave) * 16
  })
  return (
    <motion.button
      type="button"
      data-wave-id={row.id}
      aria-current={active ? "true" : undefined}
      className={cn(
        "w-full rounded-lg px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active ? "bg-primary/15" : "hover:bg-muted",
      )}
      style={reduced ? undefined : { y }}
      onClick={() => onSelect(row.id)}
      onFocus={() => onSelect(row.id)}
    >
      <span className="block text-sm font-medium">{row.title}</span>
      <span className="block text-xs text-muted-foreground">{row.note}</span>
    </motion.button>
  )
}

function DualWaveTextList({ rows = ROWS, className }: DualWaveTextListProps) {
  const reduced = usePrefersReducedMotion()
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)
  const [active, setActive] = React.useState(rows[0]?.id ?? "")
  const current = rows.find((row) => row.id === active) ?? rows[0]

  const sync = (element: HTMLDivElement) => {
    const max = element.scrollHeight - element.clientHeight
    progress.set(max <= 0 ? 0 : element.scrollTop / max)
    if (reduced) return
    const mid = element.getBoundingClientRect().top + element.clientHeight / 2
    let best = active
    let bestDist = Number.POSITIVE_INFINITY
    for (const node of element.querySelectorAll<HTMLElement>("[data-wave-id]")) {
      const rect = node.getBoundingClientRect()
      const dist = Math.abs(rect.top + rect.height / 2 - mid)
      if (dist < bestDist) {
        bestDist = dist
        best = node.dataset.waveId ?? best
      }
    }
    if (best !== active) setActive(best)
  }

  return (
    <div
      data-slot="dual-wave-text-list"
      className={cn("grid w-full gap-3 md:grid-cols-[1fr_10rem_1fr]", className)}
    >
      <div
        ref={scrollerRef}
        tabIndex={0}
        aria-label="双列文字。滚动或用方向键切换中间画面。"
        className="col-span-full grid h-80 grid-cols-1 gap-3 overflow-auto rounded-xl border p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary md:grid-cols-[1fr_10rem_1fr]"
        onScroll={(event) => sync(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
          event.preventDefault()
          const index = rows.findIndex((row) => row.id === active)
          const next = rows[index + (event.key === "ArrowDown" ? 1 : -1)]
          if (!next) return
          setActive(next.id)
          scrollerRef.current
            ?.querySelector<HTMLElement>(`[data-wave-id="${next.id}"]`)
            ?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" })
        }}
      >
        <div className="space-y-2">
          {rows.map((row, index) => (
            <WaveButton
              key={`l-${row.id}`}
              row={row}
              index={index}
              side="left"
              progress={progress}
              active={row.id === active}
              reduced={reduced}
              onSelect={setActive}
            />
          ))}
        </div>
        <div className="sticky top-3 hidden h-40 place-items-end rounded-xl p-3 text-white md:grid" style={{ background: `hsl(${current?.hue ?? 200} 70% 46%)` }}>
          <span className="text-2xl font-medium">{current?.title}</span>
        </div>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <WaveButton
              key={`r-${row.id}`}
              row={row}
              index={index}
              side="right"
              progress={progress}
              active={row.id === active}
              reduced={reduced}
              onSelect={setActive}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { DualWaveTextList }
