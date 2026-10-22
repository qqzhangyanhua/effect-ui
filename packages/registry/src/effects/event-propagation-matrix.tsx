"use client"

// Ported from Motiq (MIT, (c) 2026 Mahammad Rustamov) — https://github.com/RMahammad/motiq/blob/main/packages/registry/registry/backgrounds/event-propagation-matrix.tsx

import { useId, useMemo, useRef, type HTMLAttributes } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export type PropagationDirection = "forward" | "out" | "down"
export type EventSeverity = "info" | "warning" | "critical" | number

export interface MatrixCell {
  row: number
  col: number
}

export interface EventData {
  id: string
  origin?: MatrixCell
  category?: string
  severity?: EventSeverity
  direction?: PropagationDirection
  acknowledged?: boolean
  failed?: boolean
  history?: boolean
}

export interface EventPropagationMatrixProps extends HTMLAttributes<HTMLDivElement> {
  events?: EventData[]
  color?: string
  duration?: number
  intensity?: number
  count?: number
}

const ROWS = 6
const W = 1200
const H = 760

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function levelOf(severity: EventSeverity | undefined) {
  if (typeof severity === "number") return severity >= 0.66 ? "critical" : severity >= 0.33 ? "warning" : "info"
  return severity ?? "info"
}

const REACH = { info: 3, warning: 4, critical: 5 }

function reachOf(dir: PropagationDirection, dr: number, dc: number) {
  if (dir === "forward") return dc < 0 ? undefined : dc + Math.abs(dr) * 1.4
  if (dir === "down") return dr < 0 ? undefined : dr + Math.abs(dc) * 1.4
  return Math.abs(dr) + Math.abs(dc)
}

function defaultEvents(): EventData[] {
  return [
    { id: "evt-ingest", origin: { row: 1, col: 6 }, category: "webhook", severity: "info", direction: "forward" },
    { id: "evt-fanout", origin: { row: 0, col: 5 }, category: "audit", severity: "warning", direction: "out" },
    { id: "evt-relay", origin: { row: 3, col: 2 }, category: "audit", severity: "info", direction: "out" },
    { id: "evt-deadletter", origin: { row: 2, col: 8 }, category: "delivery", severity: "critical", direction: "out", failed: true },
    { id: "evt-ack", origin: { row: 4, col: 7 }, category: "audit", severity: "warning", direction: "down", acknowledged: true },
    { id: "evt-old", severity: "info", history: true },
  ]
}

const CARDS: Record<string, { title: string; status: string }> = {
  "evt-ingest": { title: "webhook.received", status: "202 accepted" },
  "evt-deadletter": { title: "dead-letter", status: "halted" },
  "evt-ack": { title: "delivered", status: "3 subs" },
}

interface WaveCell {
  row: number
  col: number
  reach: number
}

interface Wave {
  id: string
  failed: boolean
  acknowledged: boolean
  level: "info" | "warning" | "critical"
  origin: MatrixCell
  cells: WaveCell[]
}

function resolveEvent(event: EventData, rows: number, cols: number): Wave | undefined {
  if (event.history || !event.origin) return undefined
  const row = clamp(Math.round(event.origin.row), 0, rows - 1)
  const col = clamp(Math.round(event.origin.col), 0, cols - 1)
  const level = levelOf(event.severity)
  const dir = event.direction ?? "out"
  const maxReach = event.failed ? 1.6 : REACH[level]
  const cells: WaveCell[] = []
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const reach = reachOf(dir, r - row, c - col)
      if (reach === undefined || reach > maxReach) continue
      cells.push({ row: r, col: c, reach })
    }
  }
  return { id: event.id, failed: event.failed === true, acknowledged: event.acknowledged === true, level, origin: { row, col }, cells }
}

export function EventPropagationMatrix({
  events,
  color = "var(--primary)",
  duration = 1800,
  intensity = 1,
  count = 10,
  className,
  children,
  ...props
}: EventPropagationMatrixProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const animation = `epm-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const cols = clamp(Math.round(count), 4, 14)
  const model = useMemo(() => {
    const src = events && events.length > 0 ? events : defaultEvents()
    const waves = src.flatMap((event) => {
      const wave = resolveEvent(event, ROWS, cols)
      return wave ? [wave] : []
    })
    return { waves, history: src.filter((event) => event.history).length }
  }, [events, cols])
  const moving = live && !reduced
  const glow = clamp(intensity, 0.3, 1.6)
  const stepX = cols > 1 ? (W - 160) / (cols - 1) : 0
  const stepY = (H - 180) / (ROWS - 1)
  const center = (row: number, col: number) => ({ x: 80 + col * stepX, y: 90 + row * stepY })
  const cards = (events && events.length > 0 ? events : defaultEvents()).flatMap((event) => {
    const card = CARDS[event.id]
    return card && event.origin ? [{ ...card, ...center(clamp(event.origin.row, 0, ROWS - 1), clamp(event.origin.col, 0, cols - 1)) }] : []
  })

  return (
    <div
      ref={rootRef}
      data-motion={moving ? "on" : "off"}
      className={cn("relative isolate min-h-72 overflow-hidden rounded-xl border border-border bg-background", className)}
      {...props}
    >
      <style>{`@keyframes ${animation}{0%,100%{opacity:.18}45%{opacity:1}}@media (prefers-reduced-motion:reduce){.${animation}{animation:none!important;opacity:.85}}`}</style>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: ROWS }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const point = center(row, col)
            return <circle key={`${row}-${col}`} cx={point.x} cy={point.y} r={3.2} fill="var(--muted-foreground)" opacity={0.35} />
          }),
        )}
        {model.waves.map((wave) => {
          const tone = wave.failed ? "var(--destructive)" : wave.level === "warning" ? "var(--ring)" : color
          const origin = center(wave.origin.row, wave.origin.col)
          return (
            <g key={wave.id}>
              {wave.cells.map((cell) => {
                const point = center(cell.row, cell.col)
                const parent = cell.row === wave.origin.row && cell.col === wave.origin.col ? undefined : origin
                return (
                  <g key={`${cell.row}-${cell.col}`}>
                    {parent && cell.reach > 0 && (cell.row === wave.origin.row || cell.col === wave.origin.col) ? (
                      <line x1={origin.x} y1={origin.y} x2={point.x} y2={point.y} stroke={tone} strokeOpacity={0.28 * glow} strokeWidth={1.5} />
                    ) : null}
                    <circle
                      className={cn(animation, "motion-reduce:animate-none")}
                      cx={point.x}
                      cy={point.y}
                      r={cell.reach === 0 ? 8 : 5.5}
                      fill={tone}
                      style={{
                        animation: moving ? `${animation} ${duration}ms ease-out ${cell.reach * (duration / 8)}ms infinite` : "none",
                        animationPlayState: moving ? "running" : "paused",
                        opacity: reduced ? 0.85 : undefined,
                      }}
                    />
                  </g>
                )
              })}
              <text x={origin.x + 12} y={origin.y + 5} fill={tone} fontSize={20} fontFamily="ui-monospace, monospace">
                {wave.failed ? "×" : wave.acknowledged ? "✓" : ""}
              </text>
            </g>
          )
        })}
        <text x={80} y={720} fill="var(--muted-foreground)" fontSize={16} fontFamily="ui-monospace, monospace">
          {`history ${model.history}`}
        </text>
      </svg>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {cards.map((card) => (
          <div
            key={card.title}
            className="absolute rounded-md border border-border bg-card/90 px-2 py-1 text-[11px] text-foreground shadow-sm"
            style={{ left: `${(card.x / W) * 100}%`, top: `${(card.y / H) * 100}%` }}
          >
            <div className="font-medium">{card.title}</div>
            <div className="text-muted-foreground">{card.status}</div>
          </div>
        ))}
      </div>
      <p className="sr-only">
        {(events && events.length > 0 ? events : defaultEvents())
          .map((event) => CARDS[event.id]?.title ?? event.category ?? event.id)
          .join(". ")}
        . Event waves travel across a cell grid.
      </p>
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  )
}
