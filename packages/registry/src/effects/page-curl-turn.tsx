"use client"

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface CurlPage {
  id: string
  title: string
  body: string
}

export interface PageCurlTurnProps {
  threshold?: number
  pace?: number
  curl?: number
  pages?: readonly CurlPage[]
  className?: string
  onTurn?: (pageIndex: number) => void
}

const builtIn: readonly CurlPage[] = [
  { id: "dawn", title: "晨页", body: "这一页还盖着后面的内容。从右下角卷起来，才能看见下一页。" },
  { id: "noon", title: "午页", body: "角翻过去之后，这段才露出来。还可以再往后翻。" },
  { id: "night", title: "夜页", body: "已经是最后一页。左方向键可以翻回去。" },
]

const travel = 140

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function PageCurlTurn({
  threshold = 0.42,
  pace = 1,
  curl = 36,
  pages = builtIn,
  className,
  onTurn,
}: PageCurlTurnProps) {
  const reduced = usePrefersReducedMotion()
  const items = pages.length > 0 ? pages : builtIn
  const gate = clamp(threshold, 0.05, 0.95)
  const bend = clamp(curl, 0, 96)
  const ms = Math.round(360 / rateOf(pace))
  const [page, setPage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"rest" | "curling" | "turned">("rest")
  const progressRef = useRef(0)
  const dragRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const pageRef = useRef(0)
  const onTurnRef = useRef(onTurn)
  const safePage = clamp(page, 0, items.length - 1)
  const current = items[safePage] ?? items[0]
  const upcoming = items[safePage + 1]
  const cut = reduced ? 0 : Math.min(46, progress * (18 + bend * 0.25))
  useEffect(() => {
    onTurnRef.current = onTurn
  }, [onTurn])

  const faceStyle: CSSProperties = {
    clipPath: cut <= 0 ? undefined : `polygon(0 0, 100% 0, 100% ${100 - cut}%, ${100 - cut}% 100%, 0 100%)`,
    transition: reduced ? "none" : `clip-path ${ms}ms ease`,
  }

  function setCurl(value: number) {
    const next = clamp(value, 0, 1)
    progressRef.current = next
    setProgress(next)
  }

  function turn(direction: 1 | -1) {
    const next = pageRef.current + direction
    setCurl(0)
    if (next < 0 || next >= items.length) {
      setPhase("rest")
      return
    }
    pageRef.current = next
    setPage(next)
    setPhase("turned")
    onTurnRef.current?.(next)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.button !== 0 || safePage >= items.length - 1) return
    dragRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    setPhase("curling")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        return
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId || reduced) return
    const dx = Math.max(0, drag.x - event.clientX)
    const dy = Math.max(0, drag.y - event.clientY)
    setCurl(Math.hypot(dx, dy) / travel)
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (progressRef.current >= gate) turn(1)
    else {
      setCurl(0)
      setPhase("rest")
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button")) return
    if (event.key === "ArrowRight" || event.key === "Enter") {
      event.preventDefault()
      turn(1)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      turn(-1)
    }
  }

  if (!current) return null

  return (
    <div
      data-slot="page-curl-turn"
      data-threshold={gate}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-curl={bend}
      data-motion={reduced ? "off" : "on"}
      data-curl-motion={reduced ? "off" : "on"}
      data-state={phase}
      data-page={safePage}
      data-progress={progress.toFixed(2)}
      data-count={items.length}
      tabIndex={0}
      role="group"
      aria-label="翻页卡片"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-background p-4 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-56 overflow-hidden rounded-2xl border border-border bg-muted">
        {upcoming && !reduced ? (
          <article data-under="" aria-hidden className="absolute inset-0 bg-card p-5 text-card-foreground">
            <h3 className="text-lg font-medium">{upcoming.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{upcoming.body}</p>
          </article>
        ) : null}
        <article data-face="" style={faceStyle} className="absolute inset-0 bg-card p-5 text-card-foreground motion-reduce:transition-none">
          <p className="text-xs text-muted-foreground">
            第 {safePage + 1} / {items.length} 页
          </p>
          <h3 className="mt-2 text-lg font-medium">{current.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{current.body}</p>
        </article>
        {cut > 0 ? (
          <div
            aria-hidden
            data-curl-shadow=""
            className="pointer-events-none absolute bottom-0 right-0 bg-foreground/10"
            style={{ width: `${cut}%`, height: `${cut}%` }}
          />
        ) : null}
        {reduced || safePage >= items.length - 1 ? null : (
          <div
            data-curl-handle=""
            aria-hidden
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="absolute bottom-0 right-0 size-16 cursor-pointer touch-none"
          />
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div role="tablist" aria-label="页码" className="flex gap-2">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-label={`第 ${itemIndex + 1} 页`}
              aria-selected={itemIndex === safePage}
              onClick={() => {
                if (itemIndex === pageRef.current) return
                const direction = itemIndex > pageRef.current ? 1 : -1
                const steps = Math.abs(itemIndex - pageRef.current)
                for (let i = 0; i < steps; i += 1) turn(direction)
              }}
              className={cn(
                "size-2.5 rounded-full bg-muted-foreground/40",
                itemIndex === safePage && "bg-primary",
              )}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => turn(-1)} className="rounded-full border border-border px-3 py-1.5 text-sm">
            Previous page
          </button>
          <button type="button" onClick={() => turn(1)} className="rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            Turn page
          </button>
        </div>
      </div>
    </div>
  )
}
