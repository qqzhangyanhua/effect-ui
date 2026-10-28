"use client"

import { useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface IridescentEdgeCardProps {
  intensity?: number
  pace?: number
  thickness?: number
  className?: string
  children?: ReactNode
}

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

export function IridescentEdgeCard({
  intensity = 0.75,
  pace = 1,
  thickness = 3,
  className,
  children,
}: IridescentEdgeCardProps) {
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const chroma = 0.03 + clamp(intensity, 0, 1) * 0.18
  const edge = clamp(thickness, 1, 12)
  const ms = Math.round(520 / rateOf(pace))
  const [angle, setAngle] = useState(28)
  const [phase, setPhase] = useState<"idle" | "tracking" | "resting" | "focus">("idle")
  const quiet = reduced || coarse
  const spinning = phase === "focus" && !quiet
  const gradient = `conic-gradient(from 0deg, oklch(0.78 ${chroma} 25), oklch(0.74 ${chroma} 95), oklch(0.72 ${chroma} 175), var(--primary), oklch(0.76 ${chroma} 285), oklch(0.8 ${chroma} 330), oklch(0.78 ${chroma} 25))`

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (quiet || event.pointerType === "touch") return
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width > 0 ? rect.width : 0
    const height = rect.height > 0 ? rect.height : 0
    if (width <= 0 || height <= 0) return
    const dx = event.clientX - rect.left - width / 2
    const dy = event.clientY - rect.top - height / 2
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return
    setAngle(Math.atan2(dy, dx) * (180 / Math.PI))
    setPhase("tracking")
  }

  function onPointerLeave() {
    setPhase((current) => (current === "tracking" ? "resting" : current))
  }

  return (
    <div
      data-slot="iridescent-edge-card"
      data-intensity={clamp(intensity, 0, 1)}
      data-pace={pace}
      data-thickness={edge}
      data-motion={reduced ? "off" : "on"}
      data-edge={quiet ? "static" : "live"}
      data-state={phase}
      data-angle={Math.round(angle)}
      data-content="still"
      tabIndex={0}
      role="group"
      aria-label="虹彩边卡片"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onFocus={() => setPhase((current) => (current === "tracking" ? current : "focus"))}
      onBlur={() => setPhase((current) => (current === "focus" ? "idle" : current))}
      className={cn(
        "relative rounded-3xl bg-card text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
      style={{ padding: edge }}
    >
      <div
        aria-hidden
        data-edge-ring=""
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] motion-reduce:animate-none motion-reduce:transition-none",
          spinning && "animate-spin",
        )}
        style={{
          background: gradient,
          transform: spinning ? undefined : `rotate(${angle}deg)`,
          transition: quiet ? "none" : `transform ${ms}ms ease-out`,
          animationDuration: spinning ? `${Math.max(4, 14 / rateOf(pace))}s` : undefined,
          padding: edge,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div data-content="still" className="relative rounded-[inherit] bg-card px-5 py-6">
        {children ?? (
          <div className="space-y-1">
            <p className="font-display text-xl tracking-tight">虹彩留在边上</p>
            <p className="text-sm text-muted-foreground">卡面本身不动，颜色只绕着描边走。</p>
          </div>
        )}
      </div>
    </div>
  )
}
