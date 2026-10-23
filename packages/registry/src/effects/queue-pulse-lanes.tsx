"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/backgrounds/queue-pulse-lanes.tsx

import { useId, useMemo, useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface LaneData {
  id: string
  label?: string
  queued: number
  active: number
  completed: number
  delayed?: boolean
  blocked?: boolean
  throughput?: number
  capacity?: number
}

export interface QueuePulseLanesProps extends HTMLAttributes<HTMLDivElement> {
  lanes?: LaneData[]
  color?: string
  duration?: number
  intensity?: number
  speed?: number
  count?: number
}

const VW = 1200
const VH = 760

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function defaultLanes(): LaneData[] {
  return [
    { id: "webhooks", label: "webhooks", queued: 4, active: 3, completed: 46, capacity: 14, throughput: 9 },
    { id: "image-resize", label: "image-resize", queued: 23, active: 6, completed: 31, capacity: 24, throughput: 5 },
    { id: "email-digest", label: "email-digest", queued: 9, active: 0, completed: 17, capacity: 12, blocked: true },
    { id: "csv-import", label: "csv-import", queued: 6, active: 2, completed: 20, capacity: 11, delayed: true, throughput: 3 },
    { id: "thumbnails", label: "thumbnails", queued: 1, active: 1, completed: 88, capacity: 10, throughput: 7 },
  ]
}

type Status = "flowing" | "congested" | "delayed" | "blocked" | "settling"

interface BuiltLane {
  id: string
  label: string
  status: Status
  stat: string
  cy: number
  band: number
  fill: number
  pulses: { y: number; w: number; h: number; delay: number; dur: number }[]
}

function statOf(status: Status, queued: number, active: number, completed: number) {
  if (status === "blocked") return "blocked"
  if (status === "delayed") return "delayed"
  if (status === "congested") return `${queued} queued`
  if (status === "settling") return `${completed} done`
  return queued > 0 ? `${queued} queued` : `${active} active`
}

function buildLanes(src: LaneData[], count: number, duration: number, speed: number): BuiltLane[] {
  const slot = (VH * 0.8) / Math.max(1, src.length)
  const travel = VW * 0.74
  return src.map((lane, index) => {
    const queued = Math.max(0, lane.queued)
    const active = Math.max(0, lane.active)
    const completed = Math.max(0, lane.completed)
    const cap = Math.max(1, lane.capacity ?? queued + active + 1)
    const occ = clamp((queued + active) / cap, 0, 1.25)
    const done = completed / (queued + active + completed + 1)
    const status: Status = lane.blocked
      ? "blocked"
      : lane.delayed
        ? "delayed"
        : occ >= 0.68
          ? "congested"
          : done >= 0.8 && occ < 0.35
            ? "settling"
            : "flowing"
    const cy = VH * 0.1 + slot * (index + 0.5)
    const band = clamp(slot * 0.42, 28, 72)
    const pulses =
      status === "blocked"
        ? []
        : Array.from({ length: clamp(Math.round(count * (0.55 + occ)), 1, count) }, (_, pulse) => {
            const dur = ((duration / 1000) * (lane.delayed ? 1.7 : 1) * (1 + occ * 0.8)) / Math.max(0.2, speed)
            return {
              y: cy - band * 0.22,
              w: clamp(46 - occ * 12, 24, 48),
              h: band * 0.44,
              delay: -((dur * pulse) / Math.max(1, count)),
              dur,
            }
          })
    return {
      id: lane.id,
      label: lane.label ?? lane.id,
      status,
      stat: statOf(status, queued, active, completed),
      cy,
      band,
      fill: travel * clamp(0.16 + occ * 0.6, 0.12, 0.86),
      pulses,
    }
  })
}

export function QueuePulseLanes({
  lanes,
  color = "var(--primary)",
  duration = 5200,
  intensity = 1,
  speed = 1,
  count = 4,
  className,
  children,
  ...props
}: QueuePulseLanesProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const animation = `qpl-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const model = useMemo(
    () => buildLanes(lanes && lanes.length > 0 ? lanes : defaultLanes(), clamp(Math.round(count), 1, 9), duration, speed),
    [lanes, count, duration, speed],
  )
  const moving = live && !reduced && speed > 0
  const glow = clamp(intensity, 0.2, 1.6)
  const travel = VW * 0.74

  return (
    <div
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      className={cn("relative isolate aspect-[1200/760] w-full overflow-hidden rounded-xl border border-border bg-background", className)}
      {...props}
    >
      <style>{`@keyframes ${animation}{0%{transform:translateX(0);opacity:0}8%{opacity:var(--po,.85)}90%{opacity:var(--po,.85)}100%{transform:translateX(var(--travel,${travel}px));opacity:0}}@media (prefers-reduced-motion:reduce){.${animation}{animation:none!important;display:none!important}}`}</style>
      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
        {model.map((lane) => {
          const tone = lane.status === "blocked" ? "var(--destructive)" : lane.status === "delayed" ? "var(--ring)" : color
          const x0 = VW * 0.14
          return (
            <g key={lane.id}>
              <rect x={x0} y={lane.cy - lane.band / 2} width={travel} height={lane.band} rx={lane.band / 2} fill="var(--muted)" opacity={0.45 * glow} />
              <rect x={x0} y={lane.cy - lane.band / 2} width={lane.fill} height={lane.band} rx={lane.band / 2} fill={tone} opacity={0.18 * glow} />
              {lane.status === "blocked" ? (
                <g>
                  <rect x={x0 + lane.fill - 6} y={lane.cy - lane.band / 2} width={8} height={lane.band} rx={2} fill="var(--destructive)" />
                  <text x={x0 + lane.fill + 18} y={lane.cy + 6} fill="var(--destructive)" fontSize={22} fontFamily="ui-monospace, monospace">
                    ×
                  </text>
                </g>
              ) : null}
              {lane.status === "delayed"
                ? lane.pulses.map((pulse, index) => (
                    <rect
                      key={index}
                      className={cn(animation, "motion-reduce:hidden")}
                      x={x0}
                      y={pulse.y}
                      width={pulse.w}
                      height={pulse.h}
                      rx={pulse.h / 2}
                      fill="none"
                      stroke={tone}
                      strokeWidth={3}
                      strokeDasharray="5 6"
                      style={{
                        ["--po" as string]: String(0.9 * glow),
                        ["--travel" as string]: `${travel}px`,
                        animation: `${animation} ${pulse.dur}s linear ${pulse.delay}s infinite`,
                        animationPlayState: moving ? "running" : "paused",
                      }}
                    />
                  ))
                : lane.pulses.map((pulse, index) => (
                    <rect
                      key={index}
                      className={cn(animation, "motion-reduce:hidden")}
                      x={x0}
                      y={pulse.y}
                      width={pulse.w}
                      height={pulse.h}
                      rx={pulse.h / 2}
                      fill={tone}
                      opacity={glow}
                      style={{
                        ["--po" as string]: String(0.9 * glow),
                        ["--travel" as string]: `${travel}px`,
                        animation: `${animation} ${pulse.dur}s linear ${pulse.delay}s infinite`,
                        animationPlayState: moving ? "running" : "paused",
                      }}
                    />
                  ))}
              <text x={28} y={lane.cy + 6} fill="var(--foreground)" fontSize={18} fontFamily="ui-sans-serif, system-ui, sans-serif">
                {lane.label}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="sr-only">{model.map((lane) => `${lane.label} ${lane.stat}`).join(". ")}</p>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}
