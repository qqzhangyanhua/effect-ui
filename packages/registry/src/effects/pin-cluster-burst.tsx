"use client"

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface PinClusterBurstProps {
  pace?: number
  intensity?: number
  drift?: boolean
  labels?: boolean
  className?: string
  onValueChange?: (state: { clusterId: string | null; expanded: boolean }) => void
}

export interface BurstCluster {
  id: string
  label: string
  x: number
  y: number
  pins: readonly string[]
}

export const BURST_CLUSTERS: readonly BurstCluster[] = [
  { id: "a", label: "Cluster A", x: 78, y: 64, pins: ["A1", "A2", "A3", "A4", "A5", "A6", "A7"] },
  { id: "b", label: "Cluster B", x: 220, y: 92, pins: ["B1", "B2", "B3", "B4"] },
  { id: "c", label: "Cluster C", x: 146, y: 168, pins: ["C1", "C2", "C3", "C4", "C5"] },
]

const MAP_W = 320
const MAP_H = 220

type BurstPhase = "idle" | "bursting" | "expanded" | "collapsing"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function burstCluster(id: string | null) {
  return BURST_CLUSTERS.find((cluster) => cluster.id === id) ?? null
}

export function burstPins(id: string | null, intensity: number) {
  const cluster = burstCluster(id)
  if (!cluster) return []
  const gain = clamp(intensity, 0, 1)
  const radius = 26 + gain * 34
  return cluster.pins.map((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / cluster.pins.length
    return {
      label,
      x: Math.round((cluster.x + Math.cos(angle) * radius) * 10) / 10,
      y: Math.round((cluster.y + Math.sin(angle) * radius) * 10) / 10,
    }
  })
}

function spot(x: number, y: number, wobble = 0): CSSProperties {
  return {
    left: `${(x / MAP_W) * 100}%`,
    top: `calc(${(y / MAP_H) * 100}% + ${wobble}px)`,
  }
}

export function PinClusterBurst({
  pace = 1,
  intensity = 0.7,
  drift = true,
  labels = true,
  className,
  onValueChange,
}: PinClusterBurstProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const [openId, setOpenId] = useState<string | null>(null)
  const [phase, setPhase] = useState<BurstPhase>("idle")
  const [clock, setClock] = useState(0)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(280 / rate)
  const open = burstCluster(openId)
  const pins = burstPins(openId, gain)
  const drifting = drift && phase === "expanded" && openId !== null && live && !reduced

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (reduced || (phase !== "bursting" && phase !== "collapsing")) return
    const leaving = phase === "collapsing"
    const frame = window.requestAnimationFrame(() => {
      if (leaving) {
        setOpenId(null)
        setPhase("idle")
        return
      }
      setPhase("expanded")
    })
    return () => window.cancelAnimationFrame(frame)
  }, [phase, reduced])

  useEffect(() => {
    if (!drifting) return
    let frame = 0
    let stopped = false
    const tick = () => {
      if (stopped) return
      setClock((value) => value + 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [drifting])

  function emit(clusterId: string | null, expanded: boolean) {
    onValueRef.current?.({ clusterId, expanded })
  }

  function expand(id: string) {
    setOpenId(id)
    setPhase(reduced ? "expanded" : "bursting")
    emit(id, true)
  }

  function collapse() {
    if (openId === null || phase === "collapsing") return
    if (reduced) {
      setOpenId(null)
      setPhase("idle")
      emit(null, false)
      return
    }
    setPhase("collapsing")
    emit(null, false)
  }

  function toggle(id: string) {
    if (openId === id && phase !== "collapsing") collapse()
    else expand(id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape") return
    event.preventDefault()
    collapse()
  }

  function onClusterKey(event: KeyboardEvent<HTMLDivElement>, id: string) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    toggle(id)
  }

  function onSurfaceClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (target.closest("[data-cluster-pin], [data-pin]")) return
    collapse()
  }

  return (
    <div
      ref={ref}
      data-slot="pin-cluster-burst"
      data-ritual="pin-burst"
      data-pace={rate}
      data-intensity={gain}
      data-drift={drift ? "on" : "off"}
      data-drifting={drifting ? "on" : "off"}
      data-labels={labels ? "on" : "off"}
      data-cluster={openId ?? ""}
      data-open={openId ? "on" : "off"}
      data-pins={pins.length}
      data-state={phase}
      data-clock={clock}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Map</p>
        <p className="text-sm font-medium text-foreground">{open ? `${open.label} · ${pins.length}` : "3 clusters"}</p>
      </div>
      <div data-part="map" className="relative aspect-[320/220] w-full overflow-hidden rounded-2xl bg-muted" onClick={onSurfaceClick}>
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden>
          <rect x="18" y="56" width="40" height="44" rx="4" fill="var(--background)" />
          <rect x="188" y="48" width="52" height="36" rx="4" fill="var(--background)" />
          <rect x="96" y="132" width="48" height="40" rx="4" fill="var(--background)" />
          {["M 12 46 H 308", "M 12 118 H 308", "M 12 184 H 308", "M 64 12 V 208", "M 164 12 V 208", "M 248 12 V 208"].map((d) => (
            <path key={d} d={d} fill="none" stroke="var(--muted-foreground)" strokeWidth="6" strokeLinecap="round" opacity="0.45" />
          ))}
        </svg>
        {BURST_CLUSTERS.map((cluster) => {
          const expanded = openId === cluster.id && phase !== "idle"
          return (
            <div
              key={cluster.id}
              role="button"
              tabIndex={0}
              data-cluster-pin={cluster.id}
              aria-expanded={expanded}
              aria-label={`${cluster.label}, ${cluster.pins.length}`}
              onClick={() => toggle(cluster.id)}
              onKeyDown={(event) => onClusterKey(event, cluster.id)}
              className="absolute z-10 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              style={{
                ...spot(cluster.x, cluster.y),
                boxShadow: expanded
                  ? `0 0 ${8 + gain * 16}px color-mix(in srgb, var(--primary) ${Math.round(35 + gain * 45)}%, transparent)`
                  : undefined,
                transition: reduced ? "none" : `box-shadow ${ms}ms ease`,
              }}
            >
              {cluster.pins.length}
            </div>
          )
        })}
        {pins.map((pin, index) => {
          const wobble = drifting ? Math.sin(clock * 0.7 + index) * (1.2 + gain * 3) : 0
          return (
            <motion.span
              key={pin.label}
              data-pin={pin.label}
              data-x={pin.x}
              data-y={pin.y}
              className="absolute z-20 grid -translate-x-1/2 -translate-y-1/2 place-items-center motion-reduce:transition-none"
              style={{
                ...spot(pin.x, pin.y, wobble),
                opacity: phase === "collapsing" ? 0 : 1,
                transform: `translate(-50%, -50%) scale(${phase === "collapsing" ? 0.55 : 1})`,
                transition: reduced ? "none" : `opacity ${ms}ms ease, transform ${ms}ms cubic-bezier(0.2, 1.4, 0.4, 1)`,
              }}
            >
              <span
                className="size-3 rounded-full border border-primary-foreground bg-primary"
                style={{ boxShadow: `0 0 ${4 + gain * 8}px color-mix(in srgb, var(--primary) 55%, transparent)` }}
              />
              {labels ? <span className="mt-4 text-[10px] font-medium text-foreground">{pin.label}</span> : null}
            </motion.span>
          )
        })}
      </div>
      <p role="status" className="sr-only">
        {open ? `${open.label} expanded into ${pins.length} pins` : "All clusters collapsed"}
      </p>
    </div>
  )
}
