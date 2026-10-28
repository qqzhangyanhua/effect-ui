"use client"

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HexZone {
  id: string
  title: string
  distance: string
  summary: string
  cx: number
  cy: number
}

export interface HexZoneHotspotsProps {
  intensity?: number
  pulse?: number
  pace?: number
  zones?: readonly HexZone[]
  className?: string
  onSelect?: (id: string | null) => void
}

const builtIn: readonly HexZone[] = [
  { id: "north", title: "北岸", distance: "1.2 km", summary: "热区较密，适合短途停留。", cx: 28, cy: 32 },
  { id: "harbor", title: "港湾", distance: "3.4 km", summary: "簇点集中在码头一带。", cx: 62, cy: 40 },
  { id: "ridge", title: "山脊", distance: "6.1 km", summary: "点比较疏，路线更长。", cx: 74, cy: 68 },
  { id: "field", title: "田野", distance: "4.8 km", summary: "开阔地带，标记更分散。", cx: 36, cy: 70 },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function hexPath(cx: number, cy: number, radius: number) {
  const points: string[] = []
  for (let i = 0; i < 6; i += 1) {
    const angle = ((Math.PI * 2) / 6) * i - Math.PI / 6
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`)
  }
  return `M ${points.join(" L ")} Z`
}

export function HexZoneHotspots({
  intensity = 0.45,
  pulse = 0.6,
  pace = 1,
  zones = builtIn,
  className,
  onSelect,
}: HexZoneHotspotsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const baseId = useId()
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const items = zones.length > 0 ? zones : builtIn
  const ink = clamp(intensity, 0, 1)
  const beat = clamp(pulse, 0, 1)
  const ms = Math.round(280 / rateOf(pace))
  const [cursor, setCursor] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [phase, setPhase] = useState<"idle" | "selected" | "dismissed">("idle")
  const [wave, setWave] = useState(0)
  const selectedRef = useRef<string | null>(null)
  const onSelectRef = useRef(onSelect)
  const current = items.find((zone) => zone.id === selected) ?? null
  const pulsing = !reduced && live && selected !== null && beat > 0

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!pulsing) return
    let frame = 0
    let stopped = false
    const origin = performance.now()
    const tick = (now: number) => {
      if (stopped) return
      const turns = (now - origin) / 1000 * (1.2 + beat * 2.4)
      setWave(0.5 + 0.5 * Math.sin(turns * Math.PI * 2))
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [pulsing, beat])

  function choose(id: string) {
    const nextCursor = items.findIndex((zone) => zone.id === id)
    if (nextCursor >= 0) setCursor(nextCursor)
    setSelected(id)
    setPhase("selected")
    if (selectedRef.current === id) return
    selectedRef.current = id
    onSelectRef.current?.(id)
  }

  function dismiss() {
    if (selectedRef.current === null) {
      setPhase((currentPhase) => (currentPhase === "idle" ? currentPhase : "dismissed"))
      return
    }
    selectedRef.current = null
    setSelected(null)
    setPhase("dismissed")
    onSelectRef.current?.(null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      dismiss()
      return
    }
    if (items.length === 0) return
    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault()
      const forward = event.key === "ArrowRight" || event.key === "ArrowDown"
      const next = (cursor + (forward ? 1 : -1) + items.length) % items.length
      setCursor(next)
      const id = items[next]?.id
      ref.current?.querySelector<HTMLButtonElement>(`[data-zone="${id}"]`)?.focus()
      return
    }
    if (event.key === "Enter") {
      const fromTarget = (event.target as HTMLElement).getAttribute("data-zone")
      const id = fromTarget || items[cursor]?.id
      if (!id) return
      event.preventDefault()
      choose(id)
    }
  }

  const detailStyle: CSSProperties = reduced
    ? { transition: "none" }
    : { transition: `opacity ${ms}ms ease, transform ${ms}ms ease` }

  return (
    <div
      ref={ref}
      data-slot="hex-zone-hotspots"
      data-map="abstract"
      data-intensity={ink}
      data-pulse={beat}
      data-pace={Number.isFinite(pace) ? pace : 1}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-pulsing={pulsing ? "on" : "off"}
      data-state={phase}
      data-selected={selected ?? ""}
      data-count={items.length}
      className={cn("w-full text-foreground motion-reduce:transition-none", className)}
    >
      <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-border bg-card">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full text-muted-foreground" aria-hidden>
          {Array.from({ length: 5 }, (_, line) => (
            <g key={line}>
              <line x1={line * 25} y1="0" x2={line * 25} y2="100" stroke="currentColor" strokeOpacity="0.18" />
              <line x1="0" y1={line * 25} x2="100" y2={line * 25} stroke="currentColor" strokeOpacity="0.18" />
            </g>
          ))}
          {items.map((zone) => (
            <g key={zone.id}>
              <path
                d={hexPath(zone.cx, zone.cy, 12)}
                fill="var(--primary)"
                opacity={selected === zone.id ? Math.min(1, ink + 0.25) : ink}
              />
              <circle cx={zone.cx + 7} cy={zone.cy - 6} r="1.3" fill="currentColor" />
              <circle cx={zone.cx - 6} cy={zone.cy + 5} r="1.1" fill="currentColor" />
              {selected === zone.id && pulsing ? (
                <circle
                  data-pulse-ring=""
                  cx={zone.cx}
                  cy={zone.cy}
                  r={3.2 + wave * (1.6 + beat * 4)}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="0.6"
                  opacity={0.35 + beat * 0.45}
                />
              ) : null}
              <circle cx={zone.cx} cy={zone.cy} r="1.6" fill="var(--foreground)" />
            </g>
          ))}
        </svg>
        <div
          role="listbox"
          aria-label="地图热区"
          aria-activedescendant={items[cursor] ? `${baseId}-${items[cursor].id}` : undefined}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {items.map((zone) => (
            <button
              key={zone.id}
              id={`${baseId}-${zone.id}`}
              type="button"
              role="option"
              data-zone={zone.id}
              aria-selected={selected === zone.id}
              aria-label={zone.title}
              onClick={() => choose(zone.id)}
              style={{ left: `${zone.cx}%`, top: `${zone.cy}%` }}
              className="absolute size-11 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="sr-only">{zone.title}</span>
            </button>
          ))}
        </div>
      </div>
      {current ? (
        <div
          role="status"
          data-detail=""
          style={detailStyle}
          className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 motion-reduce:transition-none"
        >
          <p className="text-sm font-medium">{current.title}</p>
          <p className="text-xs text-muted-foreground">{current.distance}</p>
          <p className="mt-1 text-sm text-muted-foreground">{current.summary}</p>
        </div>
      ) : null}
    </div>
  )
}
