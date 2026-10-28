"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface MasonryLayout {
  size: number
  gap: number
  padding: number
  columns: number
}

export interface MasonryDensityLiveProps {
  pace?: number
  intensity?: number
  size?: number
  gap?: number
  padding?: number
  columns?: number
  className?: string
  onLayoutChange?: (layout: MasonryLayout) => void
}

const TILES = [
  { id: "a", label: "Tile A", base: 68, tone: "bg-chart-1" },
  { id: "b", label: "Tile B", base: 104, tone: "bg-chart-2" },
  { id: "c", label: "Tile C", base: 84, tone: "bg-chart-3" },
  { id: "d", label: "Tile D", base: 128, tone: "bg-chart-4" },
  { id: "e", label: "Tile E", base: 76, tone: "bg-chart-5" },
  { id: "f", label: "Tile F", base: 112, tone: "bg-chart-1" },
  { id: "g", label: "Tile G", base: 92, tone: "bg-chart-2" },
  { id: "h", label: "Tile H", base: 136, tone: "bg-chart-3" },
  { id: "i", label: "Tile I", base: 72, tone: "bg-chart-4" },
  { id: "j", label: "Tile J", base: 120, tone: "bg-chart-5" },
  { id: "k", label: "Tile K", base: 88, tone: "bg-chart-1" },
  { id: "l", label: "Tile L", base: 100, tone: "bg-chart-2" },
] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function sizeOf(size: number) {
  return clamp(size, 80, 200)
}

function gapOf(gap: number) {
  return clamp(gap, 0, 40)
}

function padOf(padding: number) {
  return clamp(padding, 0, 48)
}

function columnsOf(columns: number) {
  return clamp(Math.round(columns), 2, 4)
}

function tileHeight(base: number, size: number, intensity: number) {
  const factor = 0.65 + clamp(intensity, 0, 1) * 0.7
  return Math.round(base * (sizeOf(size) / 128) * factor)
}

function layoutKey(layout: MasonryLayout) {
  return `${layout.size}|${layout.gap}|${layout.padding}|${layout.columns}`
}

export function MasonryDensityLive({
  pace = 1,
  intensity = 0.65,
  size = 128,
  gap = 12,
  padding = 16,
  columns = 3,
  className,
  onLayoutChange,
}: MasonryDensityLiveProps) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const onLayoutRef = useRef(onLayoutChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const rateRef = useRef(1)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const incoming: MasonryLayout = {
    size: sizeOf(size),
    gap: gapOf(gap),
    padding: padOf(padding),
    columns: columnsOf(columns),
  }
  const key = layoutKey(incoming)
  const [seen, setSeen] = useState(key)
  const [layout, setLayout] = useState(incoming)
  const [phase, setPhase] = useState<"idle" | "adjusting" | "settled">("idle")
  const ease = reduced ? 0 : Math.round(280 / rate)

  if (seen !== key) {
    setSeen(key)
    setLayout(incoming)
  }

  useEffect(() => {
    onLayoutRef.current = onLayoutChange
  }, [onLayoutChange])

  useEffect(() => {
    rateRef.current = rate
    liveRef.current = live
    reducedRef.current = reduced
  }, [rate, live, reduced])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "adjusting" ? "settled" : current))
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(frame.current)
  }, [])

  function stopFrame() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function armSettle() {
    stopFrame()
    if (reducedRef.current || !liveRef.current) {
      setPhase("settled")
      return
    }
    setPhase("adjusting")
    let left = Math.max(2, Math.round(4 / rateRef.current))
    const tick = () => {
      if (!liveRef.current) {
        setPhase("settled")
        frame.current = 0
        return
      }
      left -= 1
      if (left <= 0) {
        setPhase("settled")
        frame.current = 0
        return
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  function update(partial: Partial<MasonryLayout>) {
    const next: MasonryLayout = {
      size: sizeOf(partial.size ?? layout.size),
      gap: gapOf(partial.gap ?? layout.gap),
      padding: padOf(partial.padding ?? layout.padding),
      columns: columnsOf(partial.columns ?? layout.columns),
    }
    setLayout(next)
    onLayoutRef.current?.(next)
    armSettle()
  }

  function onSliderKey(event: KeyboardEvent<HTMLInputElement>, keyName: "size" | "gap" | "padding", step: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft" && event.key !== "ArrowDown") return
    event.preventDefault()
    const dir = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1
    update({ [keyName]: layout[keyName] + dir * step })
  }

  return (
    <div
      ref={ref}
      data-slot="masonry-density-live"
      data-ritual="masonry-density"
      data-pace={rate}
      data-intensity={gain}
      data-size={layout.size}
      data-gap={layout.gap}
      data-padding={layout.padding}
      data-columns={layout.columns}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-lg rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 grid gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-16 text-foreground">Size</span>
          <input
            type="range"
            aria-label="Size"
            min={80}
            max={200}
            step={4}
            value={layout.size}
            onChange={(event) => update({ size: Number(event.target.value) })}
            onKeyDown={(event) => onSliderKey(event, "size", 4)}
            className="min-w-0 flex-1"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-16 text-foreground">Gap</span>
          <input
            type="range"
            aria-label="Gap"
            min={0}
            max={40}
            step={2}
            value={layout.gap}
            onChange={(event) => update({ gap: Number(event.target.value) })}
            onKeyDown={(event) => onSliderKey(event, "gap", 2)}
            className="min-w-0 flex-1"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-16 text-foreground">Padding</span>
          <input
            type="range"
            aria-label="Padding"
            min={0}
            max={48}
            step={2}
            value={layout.padding}
            onChange={(event) => update({ padding: Number(event.target.value) })}
            onKeyDown={(event) => onSliderKey(event, "padding", 2)}
            className="min-w-0 flex-1"
          />
        </label>
      </div>
      <div
        data-part="board"
        data-layout="masonry"
        aria-label="砌体"
        className="rounded-2xl bg-background"
        style={{ columnCount: layout.columns, columnGap: layout.gap, padding: layout.padding }}
      >
        {TILES.map((tile) => {
          const height = tileHeight(tile.base, layout.size, gain)
          return (
            <motion.div
              key={tile.id}
              data-tile={tile.id}
              data-height={height}
              className={cn("break-inside-avoid rounded-2xl text-background motion-reduce:transition-none", tile.tone)}
              style={{
                height,
                marginBottom: layout.gap,
                transition: reduced ? "none" : `height ${ease}ms ease, margin ${ease}ms ease`,
              }}
            >
              <span className="block p-3 text-sm">{tile.label}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
