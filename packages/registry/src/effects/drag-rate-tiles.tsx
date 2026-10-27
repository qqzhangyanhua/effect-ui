"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { animate } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type DragRateValue = "love" | "skip"

export interface DragRateTile {
  id: string
  title: string
  note: string
}

export interface DragRateTilesProps {
  threshold?: number
  snap?: number
  pace?: number
  tiles?: readonly DragRateTile[]
  className?: string
  onRate?: (id: string, value: DragRateValue) => void
}

const builtIn: readonly DragRateTile[] = [
  { id: "cedar", title: "雪松", note: "清冷的木质" },
  { id: "citrus", title: "柑橘", note: "明亮的果皮" },
  { id: "ink", title: "墨", note: "压住的纸味" },
  { id: "salt", title: "海盐", note: "一点点咸" },
]

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function DragRateTiles({
  threshold = 0.34,
  snap = 0.8,
  pace = 1,
  tiles = builtIn,
  className,
  onRate,
}: DragRateTilesProps) {
  const reduced = usePrefersReducedMotion()
  const alive = useRef(true)
  const done = useRef(new Set<string>())
  const [gone, setGone] = useState<readonly { id: string; value: DragRateValue }[]>([])
  const [offset, setOffset] = useState<Readonly<Record<string, number>>>({})
  const drag = useRef<{ id: string; startX: number; base: number } | null>(null)
  const playback = useRef<{ stop: () => void } | null>(null)
  const stopDrag = useRef<(() => void) | null>(null)
  const limit = clamp(threshold, 0.16, 0.62)
  const spring = clamp(snap, 0, 1)
  const items = tiles.length > 0 ? tiles : builtIn
  const remaining = items.filter((tile) => !gone.some((entry) => entry.id === tile.id))
  const loved = gone.filter((entry) => entry.value === "love").length
  const skipped = gone.length - loved

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      playback.current?.stop()
      stopDrag.current?.()
    }
  }, [])

  function commit(id: string, value: DragRateValue) {
    if (done.current.has(id)) return
    done.current.add(id)
    playback.current?.stop()
    drag.current = null
    onRate?.(id, value)
    if (reduced) {
      setOffset((current) => ({ ...current, [id]: 0 }))
      setGone((current) => [...current, { id, value }])
      return
    }
    const from = offset[id] ?? 0
    const dest = value === "love" ? 420 : -420
    playback.current = animate(from, dest, {
      duration: 0.36 / rateOf(pace),
      ease: [0.22, 1, 0.36, 1],
      onUpdate(next) {
        if (!alive.current) return
        setOffset((current) => ({ ...current, [id]: next }))
      },
      onComplete() {
        if (!alive.current) return
        setGone((current) => (current.some((entry) => entry.id === id) ? current : [...current, { id, value }]))
      },
    })
  }

  function release(id: string, x: number, width: number) {
    const gate = Math.max(48, width * limit)
    if (x >= gate) {
      commit(id, "love")
      return
    }
    if (x <= -gate) {
      commit(id, "skip")
      return
    }
    drag.current = null
    if (spring <= 0) {
      setOffset((current) => ({ ...current, [id]: x }))
      return
    }
    playback.current?.stop()
    playback.current = animate(x, 0, {
      duration: reduced ? 0 : (0.32 / rateOf(pace)) * (1.2 - spring * 0.7),
      onUpdate(next) {
        if (!alive.current) return
        setOffset((current) => ({ ...current, [id]: next }))
      },
    })
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>, id: string) {
    if (event.button !== 0) return
    playback.current?.stop()
    stopDrag.current?.()
    const width = event.currentTarget.getBoundingClientRect().width
    const pointerId = event.pointerId
    drag.current = { id, startX: event.clientX, base: offset[id] ?? 0 }
    const move = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId || drag.current?.id !== id) return
      const next = drag.current.base + (native.clientX - drag.current.startX)
      setOffset((offsets) => ({ ...offsets, [id]: next }))
    }
    const up = (native: globalThis.PointerEvent) => {
      if (native.pointerId !== pointerId) return
      stop()
      const current = drag.current
      if (!current || current.id !== id) return
      release(id, current.base + (native.clientX - current.startX), width)
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (stopDrag.current === stop) stopDrag.current = null
    }
    stopDrag.current = stop
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    try {
      event.currentTarget.setPointerCapture(pointerId)
    } catch {
      // jsdom 没有活动指针时会拒绝捕获。窗口监听仍然收得到冒泡。
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>, id: string) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    commit(id, event.key === "ArrowRight" ? "love" : "skip")
  }

  const active = remaining[0] ? (offset[remaining[0].id] ?? 0) : 0
  const side = active > 24 ? "love" : active < -24 ? "skip" : "none"

  return (
    <div
      data-slot="drag-rate-tiles"
      data-threshold={limit}
      data-snap={spring}
      data-pace={pace}
      data-motion={reduced ? "off" : "on"}
      data-remaining={remaining.length}
      data-side={side}
      className={cn("grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-stretch gap-3 motion-reduce:transition-none", className)}
    >
      <div data-zone="skip" className={cn("grid place-items-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground", side === "skip" && "border-destructive bg-destructive/10 text-destructive")}>
        不爱
      </div>
      <div className="space-y-3">
        {remaining.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-4 py-8 text-center text-card-foreground">
            都评完了。喜欢 {loved}，跳过 {skipped}。
          </p>
        ) : (
          remaining.map((tile) => {
            const x = offset[tile.id] ?? 0
            return (
              <div
                key={tile.id}
                role="slider"
                tabIndex={0}
                aria-valuemin={-1}
                aria-valuemax={1}
                aria-valuenow={0}
                aria-valuetext="未评分。左方向键不爱，右方向键喜欢。"
                aria-label={`${tile.title}。${tile.note}`}
                aria-keyshortcuts="ArrowLeft ArrowRight"
                onKeyDown={(event) => onKeyDown(event, tile.id)}
                onPointerDown={(event) => onPointerDown(event, tile.id)}
                style={{ transform: `translate3d(${x}px, 0, 0)` }}
                className="cursor-grab touch-none rounded-2xl border border-border bg-card px-4 py-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing motion-reduce:transition-none"
              >
                <p className="font-display text-2xl tracking-tight">{tile.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tile.note}</p>
              </div>
            )
          })
        )}
      </div>
      <div data-zone="love" className={cn("grid place-items-center rounded-2xl border border-dashed border-border text-sm text-muted-foreground", side === "love" && "border-primary bg-primary/10 text-primary")}>
        爱
      </div>
    </div>
  )
}
