"use client"

// Ported from Framekit UI (MIT, (c) 2026 Framekit UI contributors) — https://github.com/Sid9022/framekit-ui/blob/master/src/components/ui/smart-widget-stack.tsx

import { useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StackWidget {
  id: string
  label: string
  tint: string
  node: ReactNode
}

export interface SmartWidgetStackProps {
  widgets?: StackWidget[]
  defaultIndex?: number
  autoMs?: number
  className?: string
}

function money(value: number) {
  const sign = value < 0 ? "-" : ""
  const absolute = Math.abs(value)
  return `${sign}$${Math.floor(absolute).toLocaleString("en-US")}.${String(Math.round((absolute % 1) * 100)).padStart(2, "0")}`
}

const DEFAULT_WIDGETS: StackWidget[] = [
  { id: "bal", label: "Balance", tint: "from-primary to-chart-5", node: <div><p className="text-[13px] text-primary-foreground/80">Total balance</p><p className="mt-1 text-[34px] font-semibold">{money(24830.4)}</p><p className="mt-3 text-[13px]">+$1,204 this month</p></div> },
  { id: "steps", label: "Steps", tint: "from-chart-2 to-chart-3", node: <div><p className="text-[13px] text-primary-foreground/80">Steps today</p><p className="text-[30px] font-semibold">7,214</p><p className="text-[13px]">of 10,000</p></div> },
  { id: "spend", label: "Spend", tint: "from-chart-4 to-destructive", node: <div><p className="text-[13px] text-primary-foreground/80">Spent this week</p><p className="mt-1 text-[30px] font-semibold">{money(642)}</p></div> },
  { id: "bill", label: "Next bill", tint: "from-foreground to-muted-foreground", node: <div><p className="text-[13px] text-primary-foreground/80">Next bill · in 3 days</p><p className="mt-1 text-[30px] font-semibold">Studio rent</p><p className="mt-3">{money(1850)} · Oct 10</p></div> },
]

export function SmartWidgetStack({ widgets = DEFAULT_WIDGETS, defaultIndex = 0, autoMs = 0, className }: SmartWidgetStackProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const moving = live && !reduced
  const [index, setIndex] = useState(defaultIndex)
  const [paused, setPaused] = useState(false)
  const count = widgets.length
  const lock = useRef(0)
  const go = (delta: number) => setIndex((value) => (value + delta + count) % count)

  useEffect(() => {
    if (!autoMs || paused || !moving) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1 + count) % count), autoMs)
    return () => window.clearInterval(timer)
  }, [autoMs, count, moving, paused])

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 12 || event.timeStamp - lock.current < 450) return
    lock.current = event.timeStamp
    go(event.deltaY > 0 ? 1 : -1)
  }

  const current = widgets[index] ?? widgets[0]
  if (!current) return null

  return (
    <div ref={rootRef} className={cn("flex items-center gap-3 motion-reduce:animate-none", className)} data-motion={moving ? "on" : "off"} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div
        role="region"
        aria-roledescription="widget stack"
        aria-label="Widgets"
        tabIndex={0}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); go(1) }
          if (event.key === "ArrowUp") { event.preventDefault(); go(-1) }
        }}
        onWheel={onWheel}
        className="relative h-[196px] w-[min(86vw,340px)] rounded-[30px] pt-5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {widgets.map((widget, widgetIndex) => {
          const order = (widgetIndex - index + count) % count
          if (order > 2) return null
          return (
            <motion.div
              key={widget.id}
              drag={order === 0 && moving ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.35}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y) > 40 || Math.abs(info.velocity.y) > 400) go(info.offset.y < 0 ? 1 : -1)
              }}
              className={cn("absolute inset-x-0 bottom-0 h-[176px] overflow-hidden rounded-[28px] bg-gradient-to-br p-5 text-primary-foreground shadow-lg", widget.tint, order === 0 && "cursor-grab")}
              initial={false}
              animate={{ y: -order * 10, scale: 1 - order * 0.06, zIndex: 10 - order, opacity: order === 0 ? 1 : 0.7 }}
              transition={moving ? { type: "spring", stiffness: 300, damping: 34 } : { duration: 0 }}
              aria-hidden={order === 0 ? undefined : true}
            >
              {order === 0 ? widget.node : null}
            </motion.div>
          )
        })}
        <p className="sr-only" aria-live="polite">{current.label}, {index + 1} of {count}</p>
      </div>
      <div className="flex flex-col gap-1">
        {widgets.map((widget, widgetIndex) => (
          <button key={widget.id} type="button" onClick={() => setIndex(widgetIndex)} aria-label={`Show ${widget.label}`} aria-current={widgetIndex === index || undefined} className="grid w-6 place-items-center rounded-full py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className={cn("block w-1.5 rounded-full bg-foreground", widgetIndex === index ? "h-[18px]" : "h-1.5 opacity-30")} />
          </button>
        ))}
      </div>
    </div>
  )
}
