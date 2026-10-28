"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface HotspotPulseMapProps {
  pace?: number
  intensity?: number
  pulse?: boolean
  oneOpen?: boolean
  className?: string
  onValueChange?: (state: { activeIndex: number | null; open: boolean }) => void
}

export interface ProductHotspot {
  id: string
  x: number
  y: number
  title: string
  detail: string
}

export const HOTSPOTS: readonly ProductHotspot[] = [
  { id: "lens", x: 32, y: 34, title: "Lens ring", detail: "A circular mark on the face." },
  { id: "seam", x: 70, y: 46, title: "Side seam", detail: "A quiet line along the body." },
  { id: "foot", x: 48, y: 76, title: "Foot notch", detail: "A small step at the base." },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function HotspotPulseMap({
  pace = 1,
  intensity = 0.7,
  pulse = true,
  oneOpen = true,
  className,
  onValueChange,
}: HotspotPulseMapProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(220 / paceRate)
  const [active, setActive] = useState<number | null>(null)
  const [openIds, setOpenIds] = useState<number[]>([])
  const [breath, setBreath] = useState(0)
  const [seenOne, setSeenOne] = useState(oneOpen)
  const openRef = useRef<number[]>([])
  const onValueRef = useRef(onValueChange)
  const pulsing = pulse && live && !reduced
  const activeOpen = active !== null && openIds.includes(active)

  if (seenOne !== oneOpen) {
    setSeenOne(oneOpen)
    if (oneOpen && openIds.length > 1) {
      const keep = active !== null && openIds.includes(active) ? active : openIds[openIds.length - 1]
      setOpenIds(keep === undefined ? [] : [keep])
    }
  }

  useEffect(() => {
    openRef.current = openIds
    onValueRef.current = onValueChange
  }, [openIds, onValueChange])

  useEffect(() => {
    if (!pulsing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setBreath((value) => (value + dt * 0.55 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [pulsing, paceRate])

  function emit(index: number | null, ids: readonly number[]) {
    onValueRef.current?.({ activeIndex: index, open: index !== null && ids.includes(index) })
  }

  function toggle(index: number) {
    const has = openRef.current.includes(index)
    const next = has ? openRef.current.filter((item) => item !== index) : oneOpen ? [index] : [...openRef.current, index]
    openRef.current = next
    setActive(index)
    setOpenIds(next)
    emit(index, next)
  }

  function move(index: number) {
    const count = HOTSPOTS.length
    const next = ((index % count) + count) % count
    setActive(next)
    buttonRefs.current[next]?.focus()
    emit(next, openRef.current)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") move((active ?? -1) + 1)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") move((active ?? 0) - 1)
    else if (event.key === "Enter") toggle(active ?? 0)
    else if (event.key === "Home") move(0)
    else if (event.key === "End") move(HOTSPOTS.length - 1)
    else return
    event.preventDefault()
  }

  const wave = pulsing ? 0.5 + 0.5 * Math.sin(breath * Math.PI * 2) : 0

  return (
    <div
      ref={ref}
      data-slot="hotspot-pulse-map"
      data-ritual="hotspot-pulse"
      data-pace={paceRate}
      data-intensity={gain}
      data-active={active === null ? "none" : String(active)}
      data-open={activeOpen ? "on" : "off"}
      data-count={openIds.length}
      data-pulse={breath.toFixed(2)}
      data-playing={pulsing ? "on" : "off"}
      data-one={oneOpen ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Field unit</p>
        <p className="text-xs text-muted-foreground">{openIds.length} open</p>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border bg-background">
        <svg viewBox="0 0 320 220" className="h-56 w-full text-foreground" aria-hidden="true">
          <rect x="86" y="28" width="148" height="168" rx="36" fill="var(--muted)" stroke="var(--border)" />
          <circle cx="160" cy="96" r="30" fill="none" stroke="var(--foreground)" strokeWidth="3" />
          <circle cx="160" cy="96" r="10" fill="var(--primary)" opacity="0.85" />
          <rect x="118" y="146" width="84" height="8" rx="4" fill="var(--border)" />
          <rect x="142" y="164" width="36" height="14" rx="4" fill="var(--accent)" />
        </svg>
        {HOTSPOTS.map((spot, index) => {
          const expanded = openIds.includes(index)
          const scale = expanded ? 1 : 1 + wave * (0.2 + gain * 0.55)
          return (
            <button
              key={spot.id}
              ref={(node) => {
                buttonRefs.current[index] = node
              }}
              type="button"
              aria-label={spot.title}
              aria-expanded={expanded}
              data-hotspot={spot.id}
              onFocus={() => setActive(index)}
              onClick={() => toggle(index)}
              className="absolute z-10 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-1 rounded-full border border-primary motion-reduce:transition-none"
                style={{
                  transform: `scale(${scale})`,
                  opacity: expanded ? 0.95 : 0.45 + wave * 0.5,
                  boxShadow: `0 0 ${4 + gain * (expanded ? 6 : 14)}px color-mix(in srgb, var(--primary) ${Math.round(30 + gain * 40)}%, transparent)`,
                }}
              />
              <span aria-hidden="true" className="absolute inset-4 rounded-full bg-primary" />
            </button>
          )
        })}
        {HOTSPOTS.map((spot, index) =>
          openIds.includes(index) ? (
            <motion.div
              key={spot.id}
              data-callout={spot.id}
              role="note"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.18 / paceRate }}
              className="absolute z-20 w-40 rounded-xl border border-border bg-popover px-3 py-2 text-popover-foreground shadow-sm motion-reduce:transition-none"
              style={{ left: `${Math.min(spot.x, 58)}%`, top: `${Math.min(spot.y + 10, 68)}%` }}
            >
              <p className="text-sm font-medium">{spot.title}</p>
              <p className="text-xs text-muted-foreground">{spot.detail}</p>
            </motion.div>
          ) : null,
        )}
      </div>
      <motion.span className="sr-only" aria-live="polite">
        {active === null ? "Ready" : HOTSPOTS[active]?.title}
      </motion.span>
    </div>
  )
}
