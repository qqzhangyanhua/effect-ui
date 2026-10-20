"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GhostTrailTextProps {
  text?: string
  className?: string
}

function GhostCopy({
  text,
  index,
  shift,
  amount,
}: {
  text: string
  index: number
  shift: number
  amount: number
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 text-foreground"
      style={{
        transform: `translateY(${shift * index * 0.55}px)`,
        filter: `blur(${Math.max(0, amount * index * 0.45)}px)`,
        opacity: 0.5 - index * 0.07,
      }}
    >
      {text}
    </span>
  )
}

function GhostTrailText({ text = "GHOST", className }: GhostTrailTextProps) {
  const reduced = usePrefersReducedMotion()
  const [trail, setTrail] = React.useState({ shift: 0, amount: 0 })
  const lastTop = React.useRef(0)
  const lastTime = React.useRef(0)
  const timer = React.useRef(0)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const pushVelocity = (velocity: number) => {
    setTrail({
      shift: Math.max(-42, Math.min(42, velocity * 2.4)),
      amount: Math.min(12, Math.abs(velocity) * 0.7),
    })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setTrail({ shift: 0, amount: 0 }), 900)
  }

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (reduced) return
    const now = performance.now()
    const top = event.currentTarget.scrollTop
    const elapsed = now - lastTime.current
    const dt = elapsed > 0 && elapsed < 80 ? elapsed : 32
    const velocity = ((top - lastTop.current) / dt) * 16
    lastTop.current = top
    lastTime.current = now
    if (Math.abs(velocity) > 0.35) pushVelocity(velocity)
  }

  const onWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (reduced) return
    const pixels =
      event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY
    if (pixels !== 0) pushVelocity(pixels / 10)
  }

  return (
    <div
      data-slot="ghost-trail-text"
      tabIndex={0}
      aria-label="滚动标题。速度越快，残影越长。"
      className={cn("h-80 w-full overflow-auto rounded-xl border bg-background", className)}
      onScroll={onScroll}
      onWheel={onWheel}
      onKeyDown={(event) => {
        if (reduced) return
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
        event.preventDefault()
        const direction = event.key === "ArrowDown" ? 1 : -1
        event.currentTarget.scrollBy({ top: direction * 90 })
        pushVelocity(direction * 16)
      }}
    >
      <div className="relative h-[170vh]">
        <div className="sticky top-16 px-6">
          <div className="relative font-display text-6xl tracking-tight sm:text-7xl">
            {reduced
              ? null
              : [1, 2, 3, 4].map((index) => (
                  <GhostCopy key={index} text={text} index={index} shift={trail.shift} amount={trail.amount} />
                ))}
            <h2 className="relative z-10">{text}</h2>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">在这个区域里滚动，标题会拖出模糊残影。</p>
        </div>
      </div>
    </div>
  )
}

export { GhostTrailText }
