"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** Inspired by Obsidian and Freeform (via Mobbin), original implementation. */
export interface NodeLinkPulseProps {
  pace?: number
  intensity?: number
  pulse?: boolean
  className?: string
  onValueChange?: (state: { activeId: string | null }) => void
}

export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
}

export interface GraphLink {
  id: string
  from: string
  to: string
}

export const GRAPH_NODES: readonly GraphNode[] = [
  { id: "note-a", label: "Note A", x: 78, y: 64 },
  { id: "note-b", label: "Note B", x: 214, y: 52 },
  { id: "tag-1", label: "Tag 1", x: 150, y: 118 },
  { id: "tag-2", label: "Tag 2", x: 72, y: 176 },
  { id: "note-c", label: "Note C", x: 214, y: 174 },
]

export const GRAPH_LINKS: readonly GraphLink[] = [
  { id: "a-tag1", from: "note-a", to: "tag-1" },
  { id: "b-tag1", from: "note-b", to: "tag-1" },
  { id: "a-tag2", from: "note-a", to: "tag-2" },
  { id: "c-tag1", from: "note-c", to: "tag-1" },
  { id: "b-c", from: "note-b", to: "note-c" },
]

const BOARD_W = 280
const BOARD_H = 220

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function neighborLinkIds(activeId: string | null) {
  if (!activeId) return []
  return GRAPH_LINKS.filter((link) => link.from === activeId || link.to === activeId).map((link) => link.id)
}

export function linkedNodes(activeId: string | null) {
  if (!activeId) return []
  const ids = new Set<string>()
  for (const link of GRAPH_LINKS) {
    if (link.from === activeId) ids.add(link.to)
    else if (link.to === activeId) ids.add(link.from)
  }
  return GRAPH_NODES.filter((node) => ids.has(node.id))
}

function nodeById(id: string) {
  return GRAPH_NODES.find((node) => node.id === id)
}

export function NodeLinkPulse({
  pace = 1,
  intensity = 0.7,
  pulse = true,
  className,
  onValueChange,
}: NodeLinkPulseProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [wave, setWave] = useState(0)
  const activeRef = useRef<string | null>(null)
  const onValueRef = useRef(onValueChange)
  const hot = new Set(neighborLinkIds(activeId))
  const pulsing = pulse && live && !reduced && activeId !== null
  const linked = linkedNodes(activeId)

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    if (!pulsing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      setWave((value) => (value + dt * 0.8 * paceRate) % 1)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [pulsing, paceRate])

  function select(id: string | null, lock: boolean) {
    activeRef.current = id
    setActiveId(id)
    setLocked(lock && id !== null)
    if (id) {
      const index = GRAPH_NODES.findIndex((node) => node.id === id)
      buttonRefs.current[index]?.focus()
    }
    onValueRef.current?.({ activeId: id })
  }

  function step(direction: number) {
    const count = GRAPH_NODES.length
    const current = activeRef.current === null ? -1 : GRAPH_NODES.findIndex((node) => node.id === activeRef.current)
    const next = current < 0 ? (direction > 0 ? 0 : count - 1) : (current + direction + count) % count
    const node = GRAPH_NODES[next]
    if (!node) return
    select(node.id, false)
  }

  function focusedNode(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target
    if (!(target instanceof Element)) return activeRef.current
    return target.closest("[data-node]")?.getAttribute("data-node") ?? activeRef.current
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = focusedNode(event)
    if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowUp") {
      if (current) activeRef.current = current
      step(event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1)
    } else if (event.key === "Home") select(GRAPH_NODES[0]?.id ?? null, false)
    else if (event.key === "End") select(GRAPH_NODES[GRAPH_NODES.length - 1]?.id ?? null, false)
    else if (event.key === "Enter") {
      const id = current ?? activeRef.current
      if (id) select(id, true)
    } else return
    event.preventDefault()
  }

  const glow = pulsing ? 0.45 + 0.55 * Math.abs(Math.sin(wave * Math.PI * 2)) : 1

  return (
    <div
      ref={ref}
      data-slot="node-link-pulse"
      data-ritual="node-pulse"
      data-pace={paceRate}
      data-intensity={gain}
      data-pulse={wave.toFixed(2)}
      data-pulse-on={pulse ? "on" : "off"}
      data-active={activeId ?? "none"}
      data-locked={locked ? "on" : "off"}
      data-hot={hot.size}
      data-playing={pulsing ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      role="group"
      aria-label="Note links"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Notes</p>
        <p className="text-xs text-muted-foreground">{activeId ? `${hot.size} links` : "None selected"}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9.5rem]">
        <div className="relative h-64 rounded-2xl border border-border bg-background">
          <svg viewBox={`0 0 ${BOARD_W} ${BOARD_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            {GRAPH_LINKS.map((link) => {
              const from = nodeById(link.from)
              const to = nodeById(link.to)
              if (!from || !to) return null
              const on = hot.has(link.id)
              return (
                <line
                  key={link.id}
                  data-link={link.id}
                  data-hot={on ? "on" : "off"}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={on ? "var(--primary)" : "var(--border)"}
                  strokeWidth={on ? 1.6 + gain * 2.4 : 1.25}
                  strokeOpacity={on ? glow : 0.9}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>
          {GRAPH_NODES.map((node, index) => {
            const current = node.id === activeId
            return (
              <button
                key={node.id}
                ref={(element) => {
                  buttonRefs.current[index] = element
                }}
                type="button"
                data-node={node.id}
                aria-pressed={current}
                onClick={() => select(node.id, true)}
                className={cn(
                  "absolute z-10 min-h-11 -translate-x-1/2 -translate-y-1/2 rounded-full px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  current ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground",
                )}
                style={{ left: `${(node.x / BOARD_W) * 100}%`, top: `${(node.y / BOARD_H) * 100}%` }}
              >
                {node.label}
              </button>
            )
          })}
        </div>
        <aside className="rounded-2xl border border-border bg-background p-3">
          <p className="text-xs font-medium text-muted-foreground">Linked</p>
          {linked.length === 0 ? (
            <p className="mt-2 text-sm text-foreground">Select a note</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {linked.map((node) => (
                <li key={node.id} data-linked={node.id} className="text-sm text-foreground">
                  {node.label}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Choose a note. Arrows move. Enter locks.</p>
      <p className="sr-only" aria-live="polite">
        {activeId ? (GRAPH_NODES.find((node) => node.id === activeId)?.label ?? "") : "No note selected"}
      </p>
    </div>
  )
}
