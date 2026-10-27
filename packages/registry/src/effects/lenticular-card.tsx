"use client"

import * as React from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface LenticularFrame {
  label: string
  from: string
  to: string
  image?: string
}

export interface LenticularCardProps {
  frames?: LenticularFrame[]
  className?: string
}

const DEFAULTS: LenticularFrame[] = [
  { label: "晨雾", from: "#fb7185", to: "#f59e0b" },
  { label: "海湾", from: "#38bdf8", to: "#1d4ed8" },
  { label: "林地", from: "#86efac", to: "#166534" },
]

function LenticularCard({ frames = DEFAULTS, className }: LenticularCardProps) {
  const reduced = usePrefersReducedMotion()
  const count = Math.min(3, Math.max(2, frames.length))
  const shown = frames.slice(0, count)
  const [index, setIndex] = React.useState(0)
  const [angle, setAngle] = React.useState(0)
  const dominant = Math.round(((angle + 1) / 2) * (count - 1))
  const active = reduced ? index : dominant

  React.useEffect(() => {
    const onOrient = (event: DeviceOrientationEvent) => {
      const gamma = event.gamma ?? 0
      setAngle(Math.max(-1, Math.min(1, gamma / 28)))
    }
    window.addEventListener("deviceorientation", onOrient)
    return () => window.removeEventListener("deviceorientation", onOrient)
  }, [])

  return (
    <div data-slot="lenticular-card" className={cn("w-full max-w-md", className)}>
      <button
        type="button"
        aria-label={`光栅卡，当前 ${shown[active]?.label ?? ""}`}
        className="relative block h-72 w-full overflow-hidden rounded-2xl border text-left [perspective:900px]"
        onClick={() => {
          if (reduced) setIndex((value) => (value + 1) % count)
        }}
        onPointerMove={(event) => {
          if (reduced) return
          const rect = event.currentTarget.getBoundingClientRect()
          const next = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1
          setAngle(Math.max(-1, Math.min(1, next)))
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: reduced ? undefined : `rotateY(${angle * 14}deg) rotateX(6deg)`, transformStyle: "preserve-3d" }}
        >
          {shown.map((frame, layer) => {
            const place = ((angle + 1) / 2) * (count - 1)
            const weight = reduced ? (layer === index ? 1 : 0) : Math.max(0, 1 - Math.abs(place - layer))
            const stripe = 2
            return (
              <div
                key={frame.label}
                className="absolute inset-0"
                style={{
                  opacity: weight,
                  backgroundImage: frame.image ? `url(${frame.image})` : `linear-gradient(145deg, ${frame.from}, ${frame.to})`,
                  backgroundSize: "cover",
                  WebkitMaskImage: reduced ? undefined : `repeating-linear-gradient(90deg, #000 0 ${stripe}px, transparent ${stripe}px ${stripe * count}px)`,
                  maskImage: reduced ? undefined : `repeating-linear-gradient(90deg, #000 0 ${stripe}px, transparent ${stripe}px ${stripe * count}px)`,
                  WebkitMaskPosition: `${layer * stripe}px 0`,
                  maskPosition: `${layer * stripe}px 0`,
                }}
              />
            )
          })}
          <span className="absolute bottom-4 left-4 z-10 rounded-md bg-slate-950/45 px-2 py-1 text-sm text-white">{shown[active]?.label}</span>
          {reduced ? null : (
            <div
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 1px, transparent 1px 5px)" }}
            />
          )}
        </div>
      </button>
      <p className="mt-2 text-xs text-muted-foreground">{reduced ? "点击切换画面。" : "倾斜或移动指针，光栅会换到另一张图。"}</p>
    </div>
  )
}

export { LenticularCard }
