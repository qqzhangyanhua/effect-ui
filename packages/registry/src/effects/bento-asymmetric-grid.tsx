"use client"

import { useRef, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface BentoCell {
  id: string
  title: string
  body: string
}

export interface BentoAsymmetricGridProps {
  gap?: number
  intensity?: number
  pace?: number
  radius?: number
  cells?: readonly BentoCell[]
  className?: string
}

const builtIn: readonly BentoCell[] = [
  { id: "overview", title: "总览", body: "这一格跨了两列，是网格里最大的一块。" },
  { id: "pace", title: "节奏", body: "指针对准或键盘聚焦时，它会略微放大。" },
  { id: "swatch", title: "色块", body: "旁边的格子会变暗，给当前这块让开。" },
  { id: "space", title: "留白", body: "触屏点一下就能选中，不靠悬停。" },
  { id: "note", title: "注释", body: "Tab 可以逐格走过去。" },
]

const layout = [
  { column: "1 / 3", row: "1 / 2", span: 2 },
  { column: "3 / 4", row: "1 / 2", span: 1 },
  { column: "1 / 2", row: "2 / 3", span: 1 },
  { column: "2 / 3", row: "2 / 3", span: 1 },
  { column: "3 / 4", row: "2 / 3", span: 1 },
] as const

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

export function BentoAsymmetricGrid({
  gap = 12,
  intensity = 0.65,
  pace = 1,
  radius = 20,
  cells = builtIn,
  className,
}: BentoAsymmetricGridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const live = useAnimationActive(ref)
  const items = (cells.length > 0 ? cells : builtIn).slice(0, layout.length)
  const gapPx = clamp(gap, 0, 80)
  const gain = clamp(intensity, 0, 1)
  const corner = clamp(radius, 0, 80)
  const ms = Math.round(320 / rateOf(pace))
  const [active, setActive] = useState<number | null>(null)
  const [phase, setPhase] = useState<"idle" | "focused" | "resting">("idle")
  const viaRef = useRef<"pointer" | "key" | "tap" | null>(null)
  const pointerFocus = useRef(false)

  function focusAt(index: number, via: "pointer" | "key" | "tap") {
    viaRef.current = via
    setActive(index)
    setPhase("focused")
  }

  function onGridBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    if (viaRef.current === "pointer") return
    viaRef.current = null
    setActive(null)
    setPhase((current) => (current === "focused" ? "resting" : current))
  }

  return (
    <div
      ref={ref}
      data-slot="bento-asymmetric-grid"
      data-layout="asymmetric"
      data-ritual="bento"
      data-gap={gapPx}
      data-intensity={gain}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-radius={corner}
      data-motion={reduced ? "off" : "on"}
      data-pointer={coarse ? "coarse" : "fine"}
      data-live={live ? "on" : "off"}
      data-state={phase}
      data-index={active ?? ""}
      data-count={items.length}
      onBlur={onGridBlur}
      className={cn("grid w-full max-w-3xl motion-reduce:transition-none", className)}
      style={{
        gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr)",
        gridTemplateRows: "9.5rem 8.5rem",
        gap: gapPx,
      }}
    >
      {items.map((cell, index) => {
        const place = layout[index] ?? layout[layout.length - 1]
        const emphasized = !reduced && phase === "focused" && active === index
        const dimmed = !reduced && phase === "focused" && active !== null && active !== index
        const lift = (1 + gain * 0.08).toFixed(3)
        const sink = (1 - gain * 0.05).toFixed(3)
        return (
          <button
            key={cell.id}
            type="button"
            data-cell={cell.id}
            data-span={place?.span ?? 1}
            data-emphasis={emphasized ? "on" : "off"}
            data-dim={dimmed ? "on" : "off"}
            aria-pressed={active === index && phase === "focused"}
            onPointerDown={() => {
              pointerFocus.current = true
            }}
            onPointerEnter={(event: PointerEvent<HTMLButtonElement>) => {
              if (reduced || coarse || event.pointerType === "touch") return
              focusAt(index, "pointer")
            }}
            onPointerLeave={() => {
              if (viaRef.current !== "pointer") return
              viaRef.current = null
              setActive(null)
              setPhase("resting")
            }}
            onFocus={() => {
              const fromPointer = pointerFocus.current
              pointerFocus.current = false
              if (fromPointer && coarse && !reduced) return
              focusAt(index, "key")
            }}
            onClick={() => {
              if (!coarse || reduced) return
              if (active === index && phase === "focused") {
                viaRef.current = null
                setActive(null)
                setPhase("resting")
                return
              }
              focusAt(index, "tap")
            }}
            style={{
              gridColumn: place?.column,
              gridRow: place?.row,
              borderRadius: corner,
              zIndex: emphasized ? 3 : 1,
              transform: emphasized ? `scale(${lift})` : dimmed ? `scale(${sink})` : "none",
              opacity: dimmed ? (1 - gain * 0.35).toFixed(3) : "1",
              transition: reduced ? "none" : `transform ${ms}ms ease, opacity ${ms}ms ease`,
              background: `linear-gradient(145deg, color-mix(in oklch, var(--primary) ${38 + (index % 3) * 16}%, var(--card)), color-mix(in oklch, var(--muted) 72%, var(--background)))`,
            }}
            className="relative overflow-hidden border border-border p-4 text-left text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="block text-base font-medium">{cell.title}</span>
            <span className="mt-2 block text-sm text-muted-foreground">{cell.body}</span>
          </button>
        )
      })}
    </div>
  )
}
