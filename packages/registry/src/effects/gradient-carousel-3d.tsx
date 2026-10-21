"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface GradientCard {
  title: string
  detail: string
}

export interface GradientCarousel3dProps {
  items?: GradientCard[]
  className?: string
  /** 拖拽灵敏度倍率。不传或 1 时仍除以 180。 */
  speed?: number
  /** 侧向转角。不传或 42 仍是 42°。 */
  angle?: number
  /** 卡片缩放倍率。不传或 1 时中心仍是 1.18。 */
  scale?: number
  /** 色相跟随倍率。不传或 1 时仍是位移乘 8。 */
  intensity?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const DEFAULTS: GradientCard[] = [
  { title: "晨光", detail: "从暖色走到冷色" },
  { title: "海岸", detail: "中心的卡片会放大" },
  { title: "林地", detail: "松手后还带着惯性" },
  { title: "夜市", detail: "渐变跟着位置走" },
  { title: "雪线", detail: "沿弧线一直排下去" },
  { title: "剧场", detail: "拖拽可以绕回来" },
]

function mod(value: number, length: number) {
  return ((value % length) + length) % length
}

function GradientCarousel3d({ items = DEFAULTS, className, speed, angle, scale, intensity }: GradientCarousel3dProps) {
  const rate = pace(speed)
  const turn = angle === undefined || angle === 42 ? 42 : angle
  const gain = scale === undefined || scale === 1 ? 1 : scale
  const hueGain = intensity === undefined || intensity === 1 ? 1 : intensity
  const divisor = rate === 1 ? 180 : 180 / rate
  const reduced = usePrefersReducedMotion()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const offsetRef = React.useRef(0)
  const velocityRef = React.useRef(0)
  const visibleRef = React.useRef(true)
  const dragRef = React.useRef<{ x: number; offset: number; last: number } | null>(null)
  const [offset, setOffset] = React.useState(0)
  const frameRef = React.useRef(0)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host || reduced) return
    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries.some((entry) => entry.isIntersecting)
      if (!visibleRef.current) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
      }
    })
    observer.observe(host)
    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [reduced])

  const settle = React.useCallback(() => {
    if (frameRef.current || reduced) return
    const tick = () => {
      if (!visibleRef.current) {
        frameRef.current = 0
        return
      }
      offsetRef.current += velocityRef.current
      velocityRef.current *= 0.94
      setOffset(offsetRef.current)
      if (Math.abs(velocityRef.current) > 0.0012) frameRef.current = window.requestAnimationFrame(tick)
      else frameRef.current = 0
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }, [reduced])

  if (reduced) {
    return (
      <div data-slot="gradient-carousel-3d" className={cn("flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 py-6", className)}>
        {items.map((item, index) => (
          <article key={item.title} className="w-56 shrink-0 snap-center rounded-2xl p-4 text-slate-950" style={{ backgroundImage: `linear-gradient(145deg, hsl(${index * 48} 80% 68%), hsl(${index * 48 + 40} 70% 42%))` }}>
            <h3 className="text-lg font-medium">{item.title}</h3>
            <p className="mt-2 text-sm">{item.detail}</p>
          </article>
        ))}
      </div>
    )
  }

  const length = Math.max(items.length, 1)
  const base = Math.round(offset)
  const slots = [-2, -1, 0, 1, 2]

  return (
    <div
      data-slot="gradient-carousel-3d"
      className={cn("relative h-96 overflow-hidden rounded-xl border bg-slate-950", className)}
    >
    <div
      ref={hostRef}
      className="absolute inset-0 [perspective:1200px]"
      onPointerDown={(event) => {
        dragRef.current = { x: event.clientX, offset: offsetRef.current, last: event.clientX }
        velocityRef.current = 0
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag) return
        const next = drag.offset - (event.clientX - drag.x) / divisor
        velocityRef.current = (drag.last - event.clientX) / divisor
        drag.last = event.clientX
        offsetRef.current = next
        setOffset(next)
      }}
      onPointerUp={() => {
        dragRef.current = null
        settle()
      }}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        {slots.map((slot) => {
          const index = mod(base + slot, length)
          const item = items[index]
          if (!item) return null
          const delta = base + slot - offset
          const cardScale = (1.18 - Math.min(Math.abs(delta), 3) * 0.12) * (gain === 1 ? 1 : gain)
          const hue = (index * 46 + offset * (hueGain === 1 ? 8 : 8 * hueGain)) % 360
          return (
            <article
              key={`${item.title}-${slot}`}
              className="absolute top-1/2 left-1/2 h-44 w-56 rounded-2xl p-4 text-slate-950 shadow-xl"
              style={{
                transform: `translate(-50%, -50%) rotateY(${delta * -turn}deg) translateZ(280px) scale(${cardScale})`,
                backgroundImage: `linear-gradient(160deg, hsl(${hue} 86% 70%), hsl(${(hue + 36) % 360} 72% 42%))`,
              }}
            >
              <h3 className="text-xl font-medium">{item.title}</h3>
              <p className="mt-2 text-sm">{item.detail}</p>
            </article>
          )
        })}
      </div>
      <p className="pointer-events-none absolute bottom-3 left-3 text-xs text-white/70">左右拖拽，松手后会滑一段。</p>
    </div>
    </div>
  )
}

export { GradientCarousel3d }
