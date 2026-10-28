"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { LayoutGroup, motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TabMediaSwapProps {
  pace?: number
  intensity?: number
  autoplay?: boolean
  count?: number
  className?: string
  onIndexChange?: (index: number) => void
}

interface Feature {
  id: string
  title: string
  body: string
  media: string
  note: string
}

const features: readonly Feature[] = [
  { id: "scope", title: "范围", body: "左边先列出要看的几件事。", media: "色块一", note: "对应的说明停在这块里。" },
  { id: "focus", title: "焦点", body: "选中项有一条会滑动的底。", media: "色块二", note: "右边跟着换成这一条。" },
  { id: "swap", title: "切换", body: "媒体区交叉淡入，不整页翻。", media: "色块三", note: "方向键也能往下走。" },
  { id: "pause", title: "暂停", body: "指针放上来，自动轮播停下。", media: "色块四", note: "离开视口同样会停。" },
  { id: "end", title: "收束", body: "Home 和 End 跳到两端。", media: "色块五", note: "读屏报出当前这一项。" },
]

const tones = ["bg-primary", "bg-accent", "bg-secondary", "bg-muted", "bg-primary/70"] as const

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function TabMediaSwap({
  pace = 1,
  intensity = 0.6,
  autoplay = true,
  count = 4,
  className,
  onIndexChange,
}: TabMediaSwapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const frame = useRef(0)
  const originX = useRef(0)
  const indexRef = useRef(0)
  const liveRef = useRef(false)
  const onIndexRef = useRef(onIndexChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const baseId = useId()
  const total = clamp(Math.round(count), 3, 5)
  const items = features.slice(0, total)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const playing = autoplay && !reduced
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<"idle" | "swapping">("idle")
  const [paused, setPaused] = useState(false)
  const safe = clamp(index, 0, Math.max(0, items.length - 1))
  const current = items[safe]
  const running = playing && live && !paused
  const lengthRef = useRef(items.length)

  useEffect(() => {
    onIndexRef.current = onIndexChange
  }, [onIndexChange])

  useEffect(() => {
    lengthRef.current = items.length
  }, [items.length])

  useEffect(() => {
    liveRef.current = live
  }, [live])

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let acc = 0
    let marked = false
    const tick = (now: number) => {
      if (!liveRef.current) return
      const dt = Math.max(0, now - last)
      last = now
      acc += dt
      if (acc >= 1600 / rate) {
        acc = 0
        const next = (indexRef.current + 1) % Math.max(1, lengthRef.current)
        indexRef.current = next
        setIndex(next)
        setPhase("swapping")
        onIndexRef.current?.(next)
        marked = true
      } else if (marked) {
        marked = false
        setPhase("idle")
      }
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
    return () => {
      window.cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [running, rate])

  function go(next: number) {
    const clamped = clamp(next, 0, Math.max(0, items.length - 1))
    if (clamped === indexRef.current) return
    indexRef.current = clamped
    setIndex(clamped)
    setPhase(reduced || !liveRef.current ? "idle" : "swapping")
    onIndexRef.current?.(clamped)
    tabs.current[clamped]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      go(safe + 1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      go(safe - 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      go(0)
    } else if (event.key === "End") {
      event.preventDefault()
      go(items.length - 1)
    }
  }

  function onSwipeDown(event: PointerEvent<HTMLDivElement>) {
    originX.current = event.clientX
  }

  function onSwipeUp(event: PointerEvent<HTMLDivElement>) {
    const delta = event.clientX - originX.current
    if (Math.abs(delta) < 36) return
    go(safe + (delta < 0 ? 1 : -1))
  }

  if (!current) return null

  const shift = reduced ? 0 : Math.round(gain * 14)
  const tone = tones[safe] ?? "bg-primary"

  return (
    <div
      ref={ref}
      data-slot="tab-media-swap"
      data-ritual="tab-media"
      data-pace={rate}
      data-intensity={gain}
      data-autoplay={running ? "on" : "off"}
      data-paused={paused ? "on" : "off"}
      data-count={items.length}
      data-index={safe}
      data-media={current.id}
      data-state={phase}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-shift={shift}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={cn(
        "grid w-full max-w-3xl gap-4 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none md:grid-cols-[16rem_1fr]",
        className,
      )}
    >
      <style>
        {`@keyframes tab-media-rise { from { opacity: 0; } to { opacity: 1; } }
.tab-media-rise { animation: tab-media-rise 280ms ease; }
@media (prefers-reduced-motion: reduce) { .tab-media-rise { animation: none; } }`}
      </style>
      <LayoutGroup id={baseId}>
        <div role="tablist" aria-label="特性" aria-orientation="vertical" onKeyDown={onKeyDown} className="flex flex-col gap-2">
          {items.map((item, itemIndex) => {
            const selected = itemIndex === safe
            return (
              <button
                key={item.id}
                ref={(node) => {
                  tabs.current[itemIndex] = node
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                data-selected={selected ? "true" : "false"}
                onClick={() => go(itemIndex)}
                className="relative rounded-2xl px-3 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                {selected ? (
                  <motion.span
                    layoutId={reduced ? undefined : `tab-media-${baseId}`}
                    className="absolute inset-0 rounded-2xl bg-muted"
                    transition={reduced ? { duration: 0 } : { type: "spring", stiffness: Math.round(340 * rate), damping: 32 }}
                    data-indicator
                  />
                ) : null}
                <span className="relative block font-medium">{item.title}</span>
                <span className="relative block text-sm text-muted-foreground">{item.body}</span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        onPointerDown={onSwipeDown}
        onPointerUp={onSwipeUp}
        className="relative min-h-52 overflow-hidden rounded-2xl border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      >
        <div
          key={current.id}
          data-media-card
          className={cn("flex h-full min-h-52 flex-col justify-between gap-4 p-5 motion-reduce:transition-none", reduced ? "" : "tab-media-rise")}
          style={{ transform: shift === 0 ? undefined : `translateY(${shift}px)` }}
        >
          <span data-swatch className={cn("block h-24 rounded-2xl", tone)} />
          <p className="font-display text-3xl text-foreground">{current.media}</p>
          <p className="max-w-xs text-sm text-muted-foreground">{current.note}</p>
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        当前：{current.title}
      </p>
    </div>
  )
}
