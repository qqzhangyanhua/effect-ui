"use client"

import { useState, useSyncExternalStore, type CSSProperties, type FocusEvent, type PointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface GlassFeature {
  id: string
  title: string
  body: string
}

export interface GlassFeatureTrioProps {
  blur?: number
  intensity?: number
  pace?: number
  features?: readonly GlassFeature[]
  className?: string
}

const builtIn: readonly GlassFeature[] = [
  { id: "mesh", title: "网格底", body: "每张卡片底下有自己的色块，不跟旁边共用一张图。" },
  { id: "glass", title: "磨砂面", body: "半透明边和背景模糊叠在色块上，字仍然可读。" },
  { id: "lift", title: "轻抬", body: "细指针或键盘聚焦时卡片抬起。触屏只留下焦点环。" },
]

const hues = [200, 300, 150]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function subscribeCoarse(onStoreChange: () => void) {
  const media = window.matchMedia("(pointer: coarse)")
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function coarseNow() {
  return window.matchMedia("(pointer: coarse)").matches
}

export function GlassFeatureTrio({
  blur = 16,
  intensity = 0.7,
  pace = 1,
  features = builtIn,
  className,
}: GlassFeatureTrioProps) {
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const quiet = reduced || coarse
  const items = (features.length > 0 ? features : builtIn).slice(0, 3)
  const frost = clamp(blur, 0, 40)
  const gain = clamp(intensity, 0, 1)
  const ms = Math.round(320 / rateOf(pace))
  const [active, setActive] = useState<number | null>(null)
  const [phase, setPhase] = useState<"idle" | "hovering" | "resting" | "focus">("idle")
  const [spot, setSpot] = useState({ x: 50, y: 40 })

  function onPointerMove(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (quiet || event.pointerType === "touch") return
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 1
    const height = rect.height > 0 ? rect.height : 1
    const x = clamp(((event.clientX - rect.left) / width) * 100, 0, 100)
    const y = clamp(((event.clientY - rect.top) / height) * 100, 0, 100)
    setSpot({ x, y })
    setActive(index)
    setPhase("hovering")
  }

  function onPointerLeave() {
    setPhase((current) => {
      if (current !== "hovering") return current
      return "resting"
    })
    setActive((current) => (phase === "hovering" ? null : current))
  }

  function focusCard(index: number) {
    setActive(index)
    setPhase("focus")
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return
    setActive(null)
    setPhase("idle")
  }

  return (
    <div
      data-slot="glass-feature-trio"
      data-blur={frost}
      data-intensity={gain}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-motion={reduced ? "off" : "on"}
      data-pointer={coarse ? "coarse" : "fine"}
      data-drift={quiet ? "off" : "pointer"}
      data-columns="3"
      data-state={phase}
      data-index={active ?? ""}
      data-count={items.length}
      onBlur={onBlur}
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-3 motion-reduce:transition-none", className)}
    >
      {items.map((feature, index) => {
        const lifted = !quiet && active === index && (phase === "hovering" || phase === "focus")
        const hue = hues[index] ?? 220
        const chroma = 0.04 + gain * 0.12
        const originX = !quiet && active === index && phase === "hovering" ? spot.x : 28 + index * 18
        const originY = !quiet && active === index && phase === "hovering" ? spot.y : 36
        const mesh: CSSProperties = {
          background: `radial-gradient(circle at ${originX}% ${originY}%, oklch(0.82 ${chroma} ${hue}), transparent 58%), radial-gradient(circle at ${80 - index * 16}% 78%, var(--primary), transparent 46%)`,
          opacity: 0.45 + gain * 0.5,
          transition: quiet ? "none" : `opacity ${ms}ms ease`,
        }
        return (
          <button
            key={feature.id}
            type="button"
            data-feature={feature.id}
            data-lift={lifted ? "on" : "off"}
            aria-label={feature.title}
            onPointerMove={(event) => onPointerMove(event, index)}
            onPointerLeave={onPointerLeave}
            onFocus={() => focusCard(index)}
            style={{
              transform: lifted ? `translateY(-${(6 + gain * 10).toFixed(1)}px)` : "none",
              transition: quiet ? "none" : `transform ${ms}ms ease`,
            }}
            className="relative overflow-hidden rounded-3xl border border-border text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span aria-hidden data-mesh="" className="absolute inset-0 motion-reduce:transition-none" style={mesh} />
            <span
              className="relative block px-5 py-6 text-card-foreground"
              style={{
                backgroundColor: "color-mix(in oklch, var(--card) 62%, transparent)",
                borderColor: "color-mix(in oklch, var(--foreground) 16%, transparent)",
                backdropFilter: `blur(${frost}px)`,
                WebkitBackdropFilter: `blur(${frost}px)`,
              }}
            >
              <span className="block text-base font-medium">{feature.title}</span>
              <span className="mt-2 block text-sm text-muted-foreground">{feature.body}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
