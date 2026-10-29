"use client"

import { useEffect, useRef, useState, type KeyboardEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** Inspired by LinkedIn, monday.com, and Airtasker (via Mobbin), original implementation. */
export interface StatusRailHopProps {
  pace?: number
  intensity?: number
  enforceEdges?: boolean
  className?: string
  onValueChange?: (state: { active: string }) => void
}

export interface StatusState {
  id: string
  label: string
}

export const STATUS_STATES: readonly StatusState[] = [
  { id: "saved", label: "Saved" },
  { id: "progress", label: "In progress" },
  { id: "done", label: "Done" },
  { id: "archived", label: "Archived" },
]

export const STATUS_EDGES: readonly (readonly [string, string])[] = [
  ["saved", "progress"],
  ["progress", "saved"],
  ["progress", "done"],
  ["done", "progress"],
  ["done", "archived"],
  ["archived", "done"],
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function legalStatusTargets(active: string, enforceEdges: boolean) {
  if (!enforceEdges) return STATUS_STATES.map((state) => state.id).filter((id) => id !== active)
  return STATUS_EDGES.filter(([from]) => from === active).map(([, to]) => to)
}

export function neighborStatus(active: string, focus: string, direction: -1 | 1, enforceEdges: boolean) {
  const ids = STATUS_STATES.map((state) => state.id)
  const allowed = new Set(legalStatusTargets(active, enforceEdges))
  allowed.add(active)
  const focusIndex = Math.max(0, ids.indexOf(focus))
  for (let step = 1; step < ids.length; step += 1) {
    const index = focusIndex + direction * step
    if (index < 0 || index >= ids.length) return focus
    const id = ids[index]
    if (id && allowed.has(id)) return id
  }
  return focus
}

function labelOf(id: string) {
  return STATUS_STATES.find((state) => state.id === id)?.label ?? id
}

export function StatusRailHop({
  pace = 1,
  intensity = 0.7,
  enforceEdges = true,
  className,
  onValueChange,
}: StatusRailHopProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(260 / paceRate)
  const arc = Math.round(8 + gain * 20)
  const [activeId, setActiveId] = useState("saved")
  const [focusId, setFocusId] = useState("saved")
  const [phase, setPhase] = useState<"idle" | "hopping">("idle")
  const [hop, setHop] = useState(0)
  const [span, setSpan] = useState({ from: "saved", to: "saved" })
  const [reject, setReject] = useState<string | null>(null)
  const activeRef = useRef("saved")
  const focusRef = useRef("saved")
  const phaseRef = useRef<"idle" | "hopping">("idle")
  const hopRef = useRef(0)
  const targetRef = useRef("saved")
  const onValueRef = useRef(onValueChange)
  const playing = phase === "hopping" && live && !reduced
  const fromIndex = Math.max(0, STATUS_STATES.findIndex((state) => state.id === span.from))
  const toIndex = Math.max(0, STATUS_STATES.findIndex((state) => state.id === span.to))
  const restIndex = Math.max(0, STATUS_STATES.findIndex((state) => state.id === activeId))
  const visual = phase === "hopping" ? fromIndex + (toIndex - fromIndex) * hop : restIndex
  const lift = phase === "hopping" && !reduced ? Math.sin(Math.min(hop, 1) * Math.PI) * arc : 0

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const next = hopRef.current + dt * 1.25 * paceRate
      if (next >= 1) {
        const id = targetRef.current
        activeRef.current = id
        focusRef.current = id
        hopRef.current = 0
        phaseRef.current = "idle"
        setHop(0)
        setSpan({ from: id, to: id })
        setActiveId(id)
        setFocusId(id)
        setPhase("idle")
        onValueRef.current?.({ active: id })
        return
      }
      hopRef.current = next
      setHop(next)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function focusState(id: string) {
    focusRef.current = id
    setFocusId(id)
    const index = STATUS_STATES.findIndex((state) => state.id === id)
    if (index >= 0) buttonRefs.current[index]?.focus()
  }

  function beginHop(targetId: string) {
    if (phaseRef.current === "hopping") return
    const active = activeRef.current
    if (targetId === active) return
    if (!legalStatusTargets(active, enforceEdges).includes(targetId)) {
      setReject(active)
      return
    }
    setReject(null)
    focusState(targetId)
    if (reduced) {
      activeRef.current = targetId
      setSpan({ from: active, to: targetId })
      setActiveId(targetId)
      setHop(0)
      setPhase("idle")
      onValueRef.current?.({ active: targetId })
      return
    }
    targetRef.current = targetId
    hopRef.current = 0
    phaseRef.current = "hopping"
    setSpan({ from: active, to: targetId })
    setHop(0)
    setPhase("hopping")
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") focusState(neighborStatus(activeRef.current, focusRef.current, 1, enforceEdges))
    else if (event.key === "ArrowLeft") focusState(neighborStatus(activeRef.current, focusRef.current, -1, enforceEdges))
    else if (event.key === "Enter") beginHop(focusRef.current)
    else return
    event.preventDefault()
  }

  const message = reject ? `Kept on ${labelOf(reject)}` : `Now: ${labelOf(activeId)}`

  return (
    <div
      ref={ref}
      data-slot="status-rail-hop"
      data-ritual="status-hop"
      data-pace={paceRate}
      data-intensity={gain}
      data-edges={enforceEdges ? "on" : "off"}
      data-active={activeId}
      data-focus={focusId}
      data-phase={phase}
      data-hop={hop.toFixed(2)}
      data-lift={lift.toFixed(2)}
      data-arc={reduced ? "0" : String(arc)}
      data-from={phase === "hopping" ? span.from : activeId}
      data-to={phase === "hopping" ? span.to : activeId}
      data-reject={reject ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      role="group"
      aria-label="Status rail"
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground select-none motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Status</p>
        <p className="text-sm text-foreground" role="status">
          {message}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STATUS_STATES.map((state, index) => {
          const current = state.id === activeId
          return (
            <button
              key={state.id}
              ref={(node) => {
                buttonRefs.current[index] = node
              }}
              type="button"
              data-state={state.id}
              aria-current={current ? "step" : undefined}
              onFocus={() => {
                focusRef.current = state.id
                setFocusId(state.id)
              }}
              onClick={() => beginHop(state.id)}
              className={cn(
                "min-h-11 rounded-full px-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                current ? "bg-primary text-primary-foreground" : "border border-border bg-muted text-foreground",
                focusId === state.id && !current ? "ring-2 ring-ring" : "",
              )}
            >
              {state.label}
            </button>
          )
        })}
      </div>
      <div className="relative mt-4 h-8" aria-hidden="true">
        <div className="absolute top-3 right-4 left-4 h-px bg-border" />
        <span
          data-marker=""
          className="absolute top-1 size-4 rounded-full bg-primary motion-reduce:transition-none"
          style={{
            left: `${((visual + 0.5) / STATUS_STATES.length) * 100}%`,
            transform: `translateX(-50%) translateY(${-lift}px)`,
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">Choose a legal state. Arrows pick. Enter hops.</p>
    </div>
  )
}
