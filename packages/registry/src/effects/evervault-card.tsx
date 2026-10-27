"use client"

import * as React from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

const EMERALD = "#34d399"

export interface EvervaultCardProps {
  className?: string
  text?: string
  /** 乱码刷新间隔，毫秒。不传或 90 仍是 90。 */
  interval?: number
  /** 字符颜色。不传或 #34d399 仍是 emerald-400。 */
  color?: string
  /** 揭开光斑半径，像素。不传或 90 仍是 90。 */
  size?: number
  /** 字符个数。不传或 240 仍是 240。 */
  count?: number
  /** 静止时文字的清晰度倍率。不传或 1 仍是 15% 不透明、模糊 4px。 */
  intensity?: number
}

const GLYPHS = "0123456789ABCDEF$#*%@!?<>[]{}"

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "#"
}

function glyphs(length: number) {
  return Array.from({ length }, randomGlyph)
}

function EvervaultCard({
  className,
  text = "SECURE",
  interval,
  color,
  size,
  count,
  intensity,
}: EvervaultCardProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const active = useAnimationActive(hostRef)
  const reduced = usePrefersReducedMotion()
  const total = count === undefined || count === 240 ? 240 : Math.max(1, Math.round(count))
  const [chars, setChars] = React.useState(() => glyphs(total))
  const [drawn, setDrawn] = React.useState(total)
  if (drawn !== total) {
    setDrawn(total)
    setChars(glyphs(total))
  }
  const [spot, setSpot] = React.useState({ x: 50, y: 50, active: false })
  const spotSize = size === undefined || size === 90 ? 90 : size
  const idle = intensity === undefined || intensity === 1 ? 0.15 : 0.15 * intensity
  const blur = intensity === undefined || intensity === 1 ? 4 : 4 * intensity
  const emerald = color === undefined || color.toLowerCase() === EMERALD
  const ms = interval === undefined || interval === 90 ? 90 : interval

  React.useEffect(() => {
    if (reduced || !active) return
    const id = window.setInterval(() => {
      setChars((current) => current.map((char, index) => (index % 7 === 0 ? randomGlyph() : char)))
    }, ms)
    return () => window.clearInterval(id)
  }, [reduced, active, ms])

  return (
    <div
      ref={hostRef}
      className={cn("relative overflow-hidden rounded-xl border bg-zinc-950 p-5 font-mono", className)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setSpot({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
          active: true,
        })
      }}
      onPointerLeave={() => setSpot((value) => ({ ...value, active: false }))}
    >
      <div
        className={cn(
          "absolute inset-0 grid grid-cols-20 gap-0 text-[10px] leading-4",
          emerald && "text-emerald-400/70",
        )}
        style={{
          color: emerald ? undefined : color,
          maskImage: spot.active
            ? `radial-gradient(${spotSize}px at ${spot.x}% ${spot.y}%, transparent 20%, black 70%)`
            : "none",
        }}
      >
        {chars.map((char, index) => (
          <span key={index}>{char}</span>
        ))}
      </div>
      <div
        className="relative z-10 grid min-h-40 place-items-center text-2xl font-semibold tracking-[0.35em] text-white transition-opacity"
        style={{
          opacity: reduced || spot.active ? 1 : idle,
          filter: reduced || spot.active ? "none" : `blur(${blur}px)`,
        }}
      >
        {text}
      </div>
    </div>
  )
}

export { EvervaultCard }
