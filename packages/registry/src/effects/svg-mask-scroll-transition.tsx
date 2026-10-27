"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type MaskPreset = "circle" | "blob" | "stripes" | "text"

export interface SvgMaskScrollTransitionProps {
  className?: string
  intensity?: number
  speed?: number
  count?: number
}

function pace(speed: number | undefined) {
  return speed === undefined || !Number.isFinite(speed) || speed <= 0 ? 1 : speed
}

const PRESETS: readonly { id: MaskPreset; label: string }[] = [
  { id: "circle", label: "圆形" },
  { id: "blob", label: "色块" },
  { id: "stripes", label: "条纹" },
  { id: "text", label: "文字" },
]

function SvgMaskScrollTransition({ className, intensity, speed, count }: SvgMaskScrollTransitionProps) {
  const reduced = usePrefersReducedMotion()
  const reactId = React.useId().replace(/:/g, "")
  const maskId = `effect-ui-mask-${reactId}`
  const [progress, setProgress] = React.useState(reduced ? 1 : 0)
  const [preset, setPreset] = React.useState<MaskPreset>("circle")
  const rate = pace(speed)
  const gain = intensity === undefined || intensity === 1 ? 1 : intensity
  const stripes = count === undefined || count === 7 ? 7 : Math.max(1, Math.round(count))

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (reduced) return
    const element = event.currentTarget
    const max = element.scrollHeight - element.clientHeight
    const next = max <= 0 ? 1 : element.scrollTop / max
    setProgress(next)
  }

  const shaped = rate === 1 ? progress : Math.min(1, Math.pow(Math.max(progress, 0), rate))
  const amount = reduced ? 1 : shaped

  return (
    <div data-slot="svg-mask-scroll-transition" className={cn("w-full space-y-3", className)}>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="遮罩形状">
        {PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={preset === item.id}
            className={cn("rounded-md border px-3 py-1.5 text-sm", preset === item.id && "bg-primary text-primary-foreground")}
            onClick={() => setPreset(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        tabIndex={0}
        aria-label="滚动切换场景。下一幕从 SVG 遮罩里显出。"
        className="h-80 overflow-auto rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onScroll={onScroll}
      >
        <div className="relative h-[180vh]">
          <div className="sticky top-0 h-80 overflow-hidden">
            <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(145deg,#1e1b4b,#0f766e)] text-3xl font-medium text-white">
              上一幕
            </div>
            <div
              className="absolute inset-0 grid place-items-center bg-[linear-gradient(160deg,#9a3412,#f59e0b)] text-3xl font-medium text-white"
              style={{ mask: `url(#${maskId})`, WebkitMask: `url(#${maskId})` }}
            >
              下一幕
            </div>
            <svg className="pointer-events-none absolute h-0 w-0" aria-hidden>
              <mask id={maskId} maskContentUnits="objectBoundingBox">
                {preset === "circle" ? (
                  <circle cx="0.5" cy="0.5" r={gain === 1 ? 0.04 + amount * 0.72 : 0.04 + amount * 0.72 * gain} fill="white" />
                ) : null}
                {preset === "blob" ? (
                  <>
                    <ellipse cx="0.46" cy="0.48" rx={gain === 1 ? 0.08 + amount * 0.42 : 0.08 + amount * 0.42 * gain} ry={gain === 1 ? 0.06 + amount * 0.34 : 0.06 + amount * 0.34 * gain} fill="white" />
                    <ellipse cx="0.62" cy="0.58" rx={gain === 1 ? 0.05 + amount * 0.24 : 0.05 + amount * 0.24 * gain} ry={gain === 1 ? 0.08 + amount * 0.22 : 0.08 + amount * 0.22 * gain} fill="white" />
                  </>
                ) : null}
                {preset === "stripes"
                  ? Array.from({ length: stripes }, (_, index) => (
                      <rect
                        key={index}
                        x={index / stripes + 0.008}
                        y={1 - (gain === 1 ? amount : amount * gain)}
                        width={1 / stripes - 0.016}
                        height={gain === 1 ? amount : amount * gain}
                        fill="white"
                      />
                    ))
                  : null}
                {preset === "text" ? (
                  <text
                    x="0.5"
                    y="0.58"
                    textAnchor="middle"
                    fill="white"
                    fontSize={gain === 1 ? 0.05 + amount * 0.42 : 0.05 + amount * 0.42 * gain}
                    fontFamily="sans-serif"
                  >
                    OPEN
                  </text>
                ) : null}
              </mask>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export { SvgMaskScrollTransition }
