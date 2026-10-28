"use client"

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface StickyStackCard {
  id: string
  title: string
  body: string
}

export interface StickyStackCardsProps {
  pace?: number
  tilt?: number
  depth?: number
  cards?: readonly StickyStackCard[]
  className?: string
}

const builtIn: readonly StickyStackCard[] = [
  { id: "open", title: "打开", body: "第一张先占满画面。继续往下滚，它会留在原处。" },
  { id: "pin", title: "钉住", body: "卡片顶到容器上沿后不再跟着走，后面的滚动只改变它的姿态。" },
  { id: "settle", title: "沉降", body: "前一张缩小、微微偏转，并沉进阴影里。" },
  { id: "next", title: "下一张", body: "新的卡片从下方顶上来，盖住已经沉降的那一张。" },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function fixed(value: number, digits: number) {
  const factor = 10 ** digits
  return (Math.round(value * factor) / factor).toFixed(digits)
}

export function StickyStackCards({
  pace = 1,
  tilt = 6,
  depth = 0.16,
  cards = builtIn,
  className,
}: StickyStackCardsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const items = cards.length > 0 ? cards : builtIn
  const step = Math.round(280 / rateOf(pace))
  const angle = clamp(tilt, 0, 24)
  const drop = clamp(depth, 0, 0.45)
  const listening = live && !reduced
  const [scrollTop, setScrollTop] = useState(0)
  const spans = Math.max(1, items.length - 1)
  const total = step * spans
  const index = Math.min(spans, Math.floor(scrollTop / step))
  const into = scrollTop - index * step
  const local = clamp(into / step, 0, 1)
  const state = scrollTop <= 0.5 ? "idle" : scrollTop >= total - 0.5 ? "stacked" : "pinning"

  useEffect(() => {
    const node = ref.current
    if (!node || !listening) return
    const onScroll = () => setScrollTop(node.scrollTop)
    node.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => node.removeEventListener("scroll", onScroll)
  }, [listening])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (reduced) return
    const forward = event.key === "ArrowDown" || event.key === "PageDown"
    const backward = event.key === "ArrowUp" || event.key === "PageUp"
    if (!forward && !backward) return
    event.preventDefault()
    const current = Math.floor(scrollTop / step)
    const nextIndex = clamp(current + (forward ? 1 : -1), 0, spans)
    const nextTop = nextIndex * step
    if (ref.current) ref.current.scrollTop = nextTop
    setScrollTop(nextTop)
  }

  return (
    <div
      ref={ref}
      data-slot="sticky-stack-cards"
      data-scroller=""
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-tilt={angle}
      data-depth={drop}
      data-step={step}
      data-motion={reduced ? "off" : "on"}
      data-listening={listening ? "on" : "off"}
      data-layout={reduced ? "column" : "pin-stack"}
      data-state={state}
      data-index={index}
      data-progress={fixed(reduced ? 0 : local, 3)}
      data-count={items.length}
      tabIndex={0}
      role="region"
      aria-label="叠卡。滚动时当前卡片缩小并沉降，下一张从下方顶上。"
      onKeyDown={onKeyDown}
      className={cn(
        "h-96 w-full overflow-y-auto rounded-3xl border border-border bg-background text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="space-y-3 p-4" style={{ minHeight: reduced ? undefined : total + 384 }}>
        {items.map((card, cardIndex) => {
          const settled = reduced ? 0 : clamp((scrollTop - cardIndex * step) / step, 0, 1)
          const scale = 1 - drop * settled
          const rotate = (cardIndex % 2 === 0 ? -1 : 1) * angle * settled
          const style: CSSProperties = reduced
            ? { position: "static", transform: "none" }
            : {
                position: "sticky",
                top: 16,
                zIndex: cardIndex + 1,
                transform: `translateY(${fixed(settled * -12, 2)}px) scale(${fixed(scale, 3)}) rotate(${fixed(rotate, 2)}deg)`,
                boxShadow: `0 16px 36px color-mix(in oklch, var(--foreground) ${Math.round(10 + settled * 16)}%, transparent)`,
              }
          return (
            <article
              key={card.id}
              data-card={cardIndex}
              data-pin={reduced ? "static" : "sticky"}
              data-settled={fixed(settled, 3)}
              style={style}
              className="min-h-48 rounded-3xl border border-border bg-card p-5 text-card-foreground shadow-sm motion-reduce:transform-none motion-reduce:transition-none"
            >
              <p className="text-xs text-muted-foreground">0{cardIndex + 1}</p>
              <h3 className="mt-2 text-lg font-medium">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
