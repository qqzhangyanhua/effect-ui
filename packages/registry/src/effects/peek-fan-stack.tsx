"use client"

import { useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PeekFanStackProps {
  intensity?: number
  pace?: number
  gap?: number
  radius?: number
  className?: string
  onSelect?: (id: string) => void
}

interface FanCard {
  id: string
  title: string
  note: string
}

type FanState = "idle" | "fanned" | "resting"

const CARDS: readonly FanCard[] = [
  { id: "north", title: "北墙", note: "主图居中，两侧只露出一角。" },
  { id: "east", title: "东廊", note: "聚焦时扇角再张开一点。" },
  { id: "west", title: "西厅", note: "触屏点一下，而不是靠悬停。" },
]

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

function fanAngle(open: boolean, gain: number, reduced: boolean) {
  if (reduced) return 0
  const resting = 5 + gain * 7
  if (!open) return resting
  return resting + 9 + gain * 8
}

export function PeekFanStack({ intensity = 0.7, pace = 1, gap = 18, radius = 18, className, onSelect }: PeekFanStackProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const live = useAnimationActive(ref)
  const via = useRef<"pointer" | null>(null)
  const touch = useRef(false)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const spacing = clamp(gap, 0, 48)
  const corner = clamp(radius, 0, 40)
  const ms = Math.round(420 / rate)
  const motion = reduced ? "none" : `transform ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`
  const [modes, setModes] = useState<Record<string, FanState>>({})

  function modeOf(id: string) {
    return modes[id] ?? "idle"
  }

  function setMode(id: string, next: FanState) {
    setModes((prev) => (prev[id] === next ? prev : { ...prev, [id]: next }))
  }

  function toggle(id: string) {
    setModes((prev) => {
      const current = prev[id] ?? "idle"
      return { ...prev, [id]: current === "fanned" ? "resting" : "fanned" }
    })
  }

  return (
    <div
      ref={ref}
      data-slot="peek-fan-stack"
      data-ritual="peek-fan"
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-intensity={gain}
      data-gap={spacing}
      data-radius={corner}
      data-duration={ms}
      data-motion={reduced ? "off" : "on"}
      data-pointer={coarse ? "coarse" : "fine"}
      data-live={live ? "on" : "off"}
      className={cn("w-full max-w-3xl motion-reduce:transition-none", className)}
    >
      <div className="grid gap-8 sm:grid-cols-3">
        {CARDS.map((card) => {
          const mode = reduced ? "idle" : modeOf(card.id)
          const open = mode === "fanned"
          const angle = fanAngle(open, gain, reduced)
          const peek = reduced ? spacing * 0.45 : open ? spacing * (1.05 + gain * 0.35) : spacing * 0.7
          const layer = (side: -1 | 1): CSSProperties => ({
            transform: `translateX(${side * peek}px) rotate(${side * angle}deg) scale(0.86)`,
            transition: motion,
            borderRadius: corner,
          })
          return (
            <div
              key={card.id}
              role="group"
              tabIndex={0}
              aria-label={card.title}
              data-card={card.id}
              data-state={mode}
              data-fan={angle.toFixed(1)}
              data-peek={Math.round(peek)}
              onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
                via.current = "pointer"
                touch.current = event.pointerType === "touch"
              }}
              onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
                if (reduced || coarse || event.pointerType === "touch") return
                setMode(card.id, "fanned")
              }}
              onPointerLeave={() => {
                if (reduced || coarse) return
                setMode(card.id, "resting")
              }}
              onFocus={() => {
                if (reduced) return
                if (via.current === "pointer" && (coarse || touch.current)) return
                setMode(card.id, "fanned")
              }}
              onBlur={() => {
                via.current = null
                touch.current = false
                if (reduced) return
                setMode(card.id, "resting")
              }}
              onClick={() => {
                onSelect?.(card.id)
                if (reduced) return
                if (coarse || touch.current) toggle(card.id)
              }}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if (event.key !== "Enter" && event.key !== " ") return
                event.preventDefault()
                onSelect?.(card.id)
              }}
              className="relative h-64 outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              <div
                aria-hidden
                data-layer="back-left"
                className="absolute inset-y-8 inset-x-10 bg-muted motion-reduce:transition-none"
                style={layer(-1)}
              />
              <div
                aria-hidden
                data-layer="back-right"
                className="absolute inset-y-8 inset-x-10 motion-reduce:transition-none"
                style={{
                  ...layer(1),
                  background: "color-mix(in oklch, var(--accent) 72%, var(--card))",
                }}
              />
              <div
                data-layer="front"
                className="absolute inset-x-8 inset-y-6 z-10 grid content-end border border-border p-4 text-primary-foreground motion-reduce:transition-none"
                style={{
                  borderRadius: corner,
                  background: "color-mix(in oklch, var(--primary) 78%, var(--card))",
                  transform: open && !reduced ? "translateY(-10px)" : "translateY(0)",
                  transition: motion,
                }}
              >
                <p className="text-lg">{card.title}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">{card.note}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
