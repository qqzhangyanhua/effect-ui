"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type MaskPreset = "circle" | "blob" | "stripes" | "text"

export interface SvgMaskScrollTransitionProps {
  className?: string
}

const PRESETS: readonly { id: MaskPreset; label: string }[] = [
  { id: "circle", label: "圆形" },
  { id: "blob", label: "色块" },
  { id: "stripes", label: "条纹" },
  { id: "text", label: "文字" },
]

function SvgMaskScrollTransition({ className }: SvgMaskScrollTransitionProps) {
  const reduced = usePrefersReducedMotion()
  const reactId = React.useId().replace(/:/g, "")
  const maskId = `effect-ui-mask-${reactId}`
  const [progress, setProgress] = React.useState(reduced ? 1 : 0)
  const [preset, setPreset] = React.useState<MaskPreset>("circle")

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (reduced) return
    const element = event.currentTarget
    const max = element.scrollHeight - element.clientHeight
    const next = max <= 0 ? 1 : element.scrollTop / max
    setProgress(next)
  }

  const amount = reduced ? 1 : progress

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
                  <circle cx="0.5" cy="0.5" r={0.04 + amount * 0.72} fill="white" />
                ) : null}
                {preset === "blob" ? (
                  <>
                    <ellipse cx="0.46" cy="0.48" rx={0.08 + amount * 0.42} ry={0.06 + amount * 0.34} fill="white" />
                    <ellipse cx="0.62" cy="0.58" rx={0.05 + amount * 0.24} ry={0.08 + amount * 0.22} fill="white" />
                  </>
                ) : null}
                {preset === "stripes"
                  ? Array.from({ length: 7 }, (_, index) => (
                      <rect
                        key={index}
                        x={index / 7 + 0.008}
                        y={1 - amount}
                        width={1 / 7 - 0.016}
                        height={amount}
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
                    fontSize={0.05 + amount * 0.42}
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
