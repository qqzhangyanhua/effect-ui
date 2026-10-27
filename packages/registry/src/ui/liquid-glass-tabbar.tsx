"use client"

import * as React from "react"
import { motion } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GlassTab {
  id: string
  label: string
}

export interface LiquidGlassTabbarProps {
  tabs?: GlassTab[]
  className?: string
  speed?: number
  intensity?: number
  scale?: number
}

const defaultTabs: GlassTab[] = [
  { id: "home", label: "概览" },
  { id: "notes", label: "记录" },
  { id: "photos", label: "相册" },
  { id: "you", label: "我的" },
]

function LiquidGlassTabbar({ tabs = defaultTabs, className, speed, intensity, scale }: LiquidGlassTabbarProps) {
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = React.useState(0)
  const filterId = React.useId().replace(/:/g, "")
  const active = tabs[index] ?? tabs[0]
  const rate = speed === undefined || speed === 1 ? 1 : speed
  const pill = rate === 1 ? 0.6 : 0.6 / rate
  const blob = rate === 1 ? 0.7 : 0.7 / rate
  const pillBounce = intensity === undefined || intensity === 1 ? 0.32 : 0.32 * intensity
  const blobBounce = intensity === undefined || intensity === 1 ? 0.45 : 0.45 * intensity
  const deviation = scale === undefined || scale === 1 ? 8 : 8 * scale

  return (
    <div className={cn("relative grid place-items-center rounded-2xl border bg-[linear-gradient(180deg,#1e1b4b,#0f172a)] p-8", className)}>
      <svg className="absolute size-0" aria-hidden>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={deviation === 8 ? "8" : String(deviation)} result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
        </filter>
      </svg>
      <div
        className="relative flex w-full max-w-md rounded-full border border-white/20 bg-white/10 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-xl"
        role="tablist"
      >
        <div className="pointer-events-none absolute inset-1" style={{ filter: `url(#${filterId})` }}>
          <motion.span
            className="absolute top-0 bottom-0 rounded-full bg-white/70"
            animate={{
              left: `${(index / tabs.length) * 100}%`,
              width: `${100 / tabs.length}%`,
            }}
            transition={reduced ? { duration: 0 } : { type: "spring", bounce: pillBounce, duration: pill }}
          />
          <motion.span
            className="absolute top-1/2 size-8 -translate-y-1/2 rounded-full bg-white/80"
            animate={{ left: `calc(${((index + 0.5) / tabs.length) * 100}% - 1rem)` }}
            transition={reduced ? { duration: 0 } : { type: "spring", bounce: blobBounce, duration: blob }}
          />
        </div>
        {tabs.map((tab, tabIndex) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tabIndex === index}
            onClick={() => setIndex(tabIndex)}
            className={cn(
              "relative z-10 flex-1 rounded-full py-2 text-sm",
              tabIndex === index ? "text-zinc-950" : "text-white/80",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {active ? <p className="mt-4 text-sm text-white/70">{active.label}</p> : null}
    </div>
  )
}

export { LiquidGlassTabbar }
