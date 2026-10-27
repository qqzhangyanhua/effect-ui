"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { animate } from "motion/react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SpaceJumpHeroProps {
  pace?: number
  height?: number
  gravity?: number
  label?: string
  className?: string
  onJump?: () => void
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function jumpLift(progress: number, height: number, peak: number) {
  const t = clamp(progress, 0, 1)
  const shaped = t <= peak ? Math.sin((t / peak) * (Math.PI / 2)) : Math.cos(((t - peak) / (1 - peak)) * (Math.PI / 2))
  return -height * shaped
}

export function SpaceJumpHero({
  pace = 1,
  height = 104,
  gravity = 1,
  label = "跳跃",
  className,
  onJump,
}: SpaceJumpHeroProps) {
  const reduced = usePrefersReducedMotion()
  const alive = useRef(true)
  const playback = useRef<{ stop: () => void } | null>(null)
  const [lift, setLift] = useState(0)
  const [jumps, setJumps] = useState(0)
  const [phase, setPhase] = useState<"ground" | "air">("ground")
  const hop = Math.round(clamp(height, 48, 180))
  const weight = clamp(gravity, 0.5, 2)
  const peak = clamp(0.48 / Math.sqrt(weight), 0.22, 0.62)
  const visualLift = reduced ? 0 : lift
  const state = reduced ? "shown" : phase

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      playback.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (!reduced) return
    playback.current?.stop()
  }, [reduced])

  function jump() {
    playback.current?.stop()
    setJumps((count) => count + 1)
    onJump?.()
    if (reduced) return
    setPhase("air")
    playback.current = animate(0, 1, {
      duration: 0.68 / rateOf(pace),
      ease: "linear",
      onUpdate(progress) {
        if (!alive.current) return
        setLift(jumpLift(progress, hop, peak))
      },
      onComplete() {
        if (!alive.current) return
        setLift(0)
        setPhase("ground")
      },
    })
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.repeat) return
    if (event.key !== " " && event.key !== "Enter") return
    if (event.target !== event.currentTarget) return
    event.preventDefault()
    jump()
  }

  const shadow = Math.max(0.28, 1 - Math.abs(visualLift) / Math.max(hop, 1))
  const status = state === "air" ? "正在跳起" : jumps > 0 ? "已经落地" : "站在地面上"

  return (
    <section
      tabIndex={0}
      data-slot="space-jump-hero"
      data-pace={pace}
      data-height={hop}
      data-gravity={weight}
      data-motion={reduced ? "off" : "on"}
      data-state={state}
      data-jumps={jumps}
      data-lift={Math.round(visualLift)}
      aria-label="空格跳跃。聚焦后按空格或回车，也可以点按钮。"
      onKeyDown={onKeyDown}
      className={cn(
        "relative flex min-h-80 flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative flex-1 bg-muted/40">
        <div
          className="absolute bottom-8 left-1/2 w-16 -translate-x-1/2"
          style={{ transform: `translateX(-50%) translateY(${visualLift}px)` }}
        >
          <div className="mx-auto size-8 rounded-full bg-primary" />
          <div className="mx-auto mt-1 h-10 w-7 rounded-t-2xl bg-foreground" />
          <div className="mt-1 flex justify-center gap-1.5">
            <span className="h-6 w-2 rounded-full bg-foreground" />
            <span className="h-6 w-2 rounded-full bg-foreground" />
          </div>
        </div>
        <div
          className="absolute bottom-6 left-1/2 h-2 w-14 -translate-x-1/2 rounded-full bg-foreground/25"
          style={{ transform: `translateX(-50%) scaleX(${shadow})` }}
        />
        <div className="absolute inset-x-0 bottom-0 h-6 bg-foreground/10" />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">聚焦这块区域，按空格。</p>
        <button
          type="button"
          onClick={jump}
          className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {label}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </section>
  )
}
