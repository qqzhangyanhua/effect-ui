"use client"

import { animate, motion, useMotionValue, useTransform } from "motion/react"
import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StickerPeelProps {
  className?: string
  label?: string
}

function StickerPeel({ className, label = "STICKER" }: StickerPeelProps) {
  const reduced = usePrefersReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const drag = React.useRef<{ px: number; py: number } | null>(null)
  const rotate = useTransform([x, y], ([latestX, latestY]) => Number(latestX) * 0.05 + Number(latestY) * 0.08)
  const clip = useTransform([x, y], ([latestX, latestY]) => {
    const dx = Math.max(0, -Number(latestX))
    const dy = Math.max(0, Number(latestY))
    const cut = Math.min(86, (dx + dy) * 0.55)
    return `polygon(0% 0%, ${100 - cut}% 0%, 100% ${cut}%, 100% 100%, 0% 100%)`
  })
  const fold = useTransform([x, y], ([latestX, latestY]) => {
    const dx = Math.max(0, -Number(latestX))
    const dy = Math.max(0, Number(latestY))
    return Math.min(92, 18 + (dx + dy) * 0.45)
  })

  const springBack = () => {
    drag.current = null
    void animate(x, 0, { type: "spring", stiffness: 340, damping: 22 })
    void animate(y, 0, { type: "spring", stiffness: 340, damping: 22 })
  }

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    drag.current = { px: event.clientX, py: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const previous = drag.current
    if (!previous) return
    const dx = event.clientX - previous.px
    const dy = event.clientY - previous.py
    drag.current = { px: event.clientX, py: event.clientY }
    x.set(Math.max(-150, Math.min(12, x.get() + dx)))
    y.set(Math.max(-12, Math.min(130, y.get() + dy)))
  }

  return (
    <div data-slot="sticker-peel" className={cn("relative h-56 w-56", className)}>
      <div className="absolute inset-0 rounded-2xl bg-white shadow-inner">
        <div className="absolute inset-3 rounded-xl border border-dashed border-zinc-300" />
        <p className="absolute bottom-4 left-4 text-xs tracking-[0.22em] text-zinc-400">WHITE BACK</p>
      </div>
      {reduced ? null : (
        <motion.span
          aria-hidden
          className="absolute top-0 right-0 bg-zinc-100 shadow-md"
          style={{
            width: fold,
            height: fold,
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />
      )}
      <motion.div
        aria-label="拖动揭开贴纸"
        className="absolute inset-0 cursor-grab touch-none rounded-2xl shadow-xl active:cursor-grabbing"
        style={{ x, y, rotate, clipPath: clip }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={springBack}
        onPointerCancel={springBack}
      >
        <div className="grid h-full place-items-center rounded-2xl bg-[conic-gradient(from_120deg,#fb7185,#fbbf24,#34d399,#60a5fa,#fb7185)]">
          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-zinc-900">{label}</span>
        </div>
      </motion.div>
    </div>
  )
}

export { StickerPeel }
