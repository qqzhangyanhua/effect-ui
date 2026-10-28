"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type KeystoneCorner = "nw" | "ne" | "se" | "sw"
export type KeystoneHandle = KeystoneCorner | "n" | "e" | "s" | "w"

export interface KeystonePoint {
  x: number
  y: number
}

export interface KeystoneQuad {
  nw: KeystonePoint
  ne: KeystonePoint
  se: KeystonePoint
  sw: KeystonePoint
}

export interface KeystoneCornerDragProps {
  pace?: number
  intensity?: number
  loupe?: boolean
  midpoints?: boolean
  className?: string
  onQuadChange?: (quad: KeystoneQuad) => void
}

interface Box {
  left: number
  top: number
  width: number
  height: number
}

type KeystonePhase = "idle" | "dragging" | "settle"

const STAGE_W = 280
const STAGE_H = 200

export const KEYSTONE_REST: KeystoneQuad = {
  nw: { x: 18, y: 16 },
  ne: { x: 82, y: 16 },
  se: { x: 82, y: 84 },
  sw: { x: 18, y: 84 },
}

const START_QUAD: KeystoneQuad = {
  nw: { x: 24, y: 22 },
  ne: { x: 78, y: 14 },
  se: { x: 86, y: 80 },
  sw: { x: 16, y: 76 },
}

const CORNERS = ["nw", "ne", "se", "sw"] as const
const EDGES = ["n", "e", "s", "w"] as const

const CORNER_LABEL: Record<KeystoneCorner, string> = {
  nw: "Northwest corner",
  ne: "Northeast corner",
  se: "Southeast corner",
  sw: "Southwest corner",
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function cloneQuad(quad: KeystoneQuad): KeystoneQuad {
  return { nw: { ...quad.nw }, ne: { ...quad.ne }, se: { ...quad.se }, sw: { ...quad.sw } }
}

export function keystonePair(quad: KeystoneQuad) {
  return {
    nw: `${quad.nw.x},${quad.nw.y}`,
    ne: `${quad.ne.x},${quad.ne.y}`,
    se: `${quad.se.x},${quad.se.y}`,
    sw: `${quad.sw.x},${quad.sw.y}`,
  }
}

export function keystoneFromPointer(clientX: number, clientY: number, rect: Box) {
  const width = rect.width > 0 ? rect.width : STAGE_W
  const height = rect.height > 0 ? rect.height : STAGE_H
  const left = rect.width > 0 ? rect.left : 0
  const top = rect.height > 0 ? rect.top : 0
  return {
    x: Math.round(clamp((clientX - left) / width, 0.04, 0.96) * 100),
    y: Math.round(clamp((clientY - top) / height, 0.04, 0.96) * 100),
  }
}

export function keystonePlace(quad: KeystoneQuad, handle: KeystoneHandle, point: KeystonePoint) {
  const next = cloneQuad(quad)
  const safe = {
    x: Math.round(clamp(point.x, 4, 96)),
    y: Math.round(clamp(point.y, 4, 96)),
  }
  if (handle === "n") {
    next.nw.y = safe.y
    next.ne.y = safe.y
  } else if (handle === "s") {
    next.sw.y = safe.y
    next.se.y = safe.y
  } else if (handle === "e") {
    next.ne.x = safe.x
    next.se.x = safe.x
  } else if (handle === "w") {
    next.nw.x = safe.x
    next.sw.x = safe.x
  } else {
    next[handle] = safe
  }
  return next
}

export function keystoneRelease(quad: KeystoneQuad, handle: KeystoneHandle) {
  if (handle === "n" || handle === "e" || handle === "s" || handle === "w") return quad
  const point = quad[handle]
  const rest = KEYSTONE_REST[handle]
  if (Math.hypot(point.x - rest.x, point.y - rest.y) > 3) return quad
  const next = cloneQuad(quad)
  next[handle] = { ...rest }
  return next
}

function edgePoint(quad: KeystoneQuad, edge: Exclude<KeystoneHandle, KeystoneCorner>) {
  if (edge === "n") return { x: (quad.nw.x + quad.ne.x) / 2, y: (quad.nw.y + quad.ne.y) / 2 }
  if (edge === "e") return { x: (quad.ne.x + quad.se.x) / 2, y: (quad.ne.y + quad.se.y) / 2 }
  if (edge === "s") return { x: (quad.sw.x + quad.se.x) / 2, y: (quad.sw.y + quad.se.y) / 2 }
  return { x: (quad.nw.x + quad.sw.x) / 2, y: (quad.nw.y + quad.sw.y) / 2 }
}

function lerpQuad(from: KeystoneQuad, to: KeystoneQuad, amount: number): KeystoneQuad {
  const mix = (a: KeystonePoint, b: KeystonePoint): KeystonePoint => ({
    x: Math.round(a.x + (b.x - a.x) * amount),
    y: Math.round(a.y + (b.y - a.y) * amount),
  })
  return { nw: mix(from.nw, to.nw), ne: mix(from.ne, to.ne), se: mix(from.se, to.se), sw: mix(from.sw, to.sw) }
}

function capture(event: PointerEvent<Element>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function KeystoneCornerDrag({
  pace = 1,
  intensity = 0.7,
  loupe = true,
  midpoints = false,
  className,
  onQuadChange,
}: KeystoneCornerDragProps) {
  const ref = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const dragRef = useRef<KeystoneHandle | null>(null)
  const quadRef = useRef(START_QUAD)
  const onQuadRef = useRef(onQuadChange)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const rateRef = useRef(1)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const ease = reduced ? 0 : Math.round(160 / rate)
  const [quad, setQuad] = useState(START_QUAD)
  const [drag, setDrag] = useState<KeystoneHandle | null>(null)
  const [phase, setPhase] = useState<KeystonePhase>("idle")
  const pairs = keystonePair(quad)
  const polygon = `${quad.nw.x},${quad.nw.y} ${quad.ne.x},${quad.ne.y} ${quad.se.x},${quad.se.y} ${quad.sw.x},${quad.sw.y}`
  const loupeOpen = Boolean(drag) && loupe
  const loupePoint = drag ? (drag === "n" || drag === "e" || drag === "s" || drag === "w" ? edgePoint(quad, drag) : quad[drag]) : quad.nw

  useEffect(() => {
    onQuadRef.current = onQuadChange
    liveRef.current = live
    reducedRef.current = reduced
    rateRef.current = rate
  }, [onQuadChange, live, reduced, rate])

  function stop() {
    window.cancelAnimationFrame(frame.current)
    frame.current = 0
  }

  function publish(next: KeystoneQuad, nextPhase: KeystonePhase) {
    quadRef.current = next
    setQuad(next)
    setPhase(nextPhase)
    onQuadRef.current?.(next)
  }

  function glideRest() {
    stop()
    dragRef.current = null
    setDrag(null)
    const from = quadRef.current
    if (reducedRef.current || !liveRef.current) {
      publish(KEYSTONE_REST, "idle")
      return
    }
    let step = 0
    const total = Math.max(4, Math.round(8 / rateRef.current))
    setPhase("settle")
    const tick = () => {
      if (!liveRef.current) {
        setPhase("idle")
        frame.current = 0
        return
      }
      step += 1
      if (step >= total) {
        publish(KEYSTONE_REST, "idle")
        frame.current = 0
        return
      }
      publish(lerpQuad(from, KEYSTONE_REST, step / total), "settle")
      frame.current = window.requestAnimationFrame(tick)
    }
    frame.current = window.requestAnimationFrame(tick)
  }

  useEffect(() => {
    if (live) return
    stop()
    queueMicrotask(() => {
      if (liveRef.current) return
      setPhase((current) => (current === "idle" ? current : "idle"))
      setDrag(null)
    })
  }, [live])

  useEffect(() => stop, [])

  function read(event: PointerEvent<HTMLElement>) {
    const rect = stageRef.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 }
    return keystoneFromPointer(event.clientX, event.clientY, rect)
  }

  function begin(handle: KeystoneHandle, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== undefined && event.button !== 0) return
    stop()
    dragRef.current = handle
    setDrag(handle)
    publish(keystonePlace(quadRef.current, handle, read(event)), reducedRef.current ? "idle" : "dragging")
    capture(event)
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current) return
    publish(keystonePlace(quadRef.current, dragRef.current, read(event)), reducedRef.current ? "idle" : "dragging")
  }

  function end(event: PointerEvent<HTMLButtonElement>) {
    if (!dragRef.current) return
    const handle = dragRef.current
    const placed = keystonePlace(quadRef.current, handle, read(event))
    dragRef.current = null
    setDrag(null)
    publish(keystoneRelease(placed, handle), reducedRef.current ? "idle" : "settle")
  }

  function nudge(handle: KeystoneCorner, event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.shiftKey ? 4 : 2
    const point = quadRef.current[handle]
    let x = point.x
    let y = point.y
    if (event.key === "ArrowRight") x += step
    else if (event.key === "ArrowLeft") x -= step
    else if (event.key === "ArrowDown") y += step
    else if (event.key === "ArrowUp") y -= step
    else return
    event.preventDefault()
    stop()
    dragRef.current = null
    setDrag(null)
    publish(keystonePlace(quadRef.current, handle, { x, y }), reducedRef.current ? "idle" : "settle")
  }

  const loupeSize = 48 + gain * 28

  return (
    <div
      ref={ref}
      data-slot="keystone-corner-drag"
      data-ritual="keystone-quad"
      data-pace={rate}
      data-intensity={gain}
      data-loupe={loupe ? "on" : "off"}
      data-midpoints={midpoints ? "on" : "off"}
      data-nw={pairs.nw}
      data-ne={pairs.ne}
      data-se={pairs.se}
      data-sw={pairs.sw}
      data-corner={drag ?? "none"}
      data-state={phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-2 flex items-end justify-between">
        <p className="text-sm text-muted-foreground">Frame</p>
        <p role="status" className="text-xs text-muted-foreground">{pairs.nw} · {pairs.ne}</p>
      </div>
      <motion.div ref={stageRef} data-part="stage" className="relative h-56 touch-none rounded-2xl border border-border bg-background motion-reduce:transition-none">
        <div
          data-part="sheet"
          className="absolute inset-0"
          style={{
            clipPath: `polygon(${quad.nw.x}% ${quad.nw.y}%, ${quad.ne.x}% ${quad.ne.y}%, ${quad.se.x}% ${quad.se.y}%, ${quad.sw.x}% ${quad.sw.y}%)`,
            backgroundColor: "var(--muted)",
            backgroundImage:
              "linear-gradient(90deg, color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px), linear-gradient(color-mix(in oklab, var(--foreground) 16%, transparent) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
          <polygon data-part="quad" points={polygon} fill="none" stroke="var(--foreground)" strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
        </svg>
        {CORNERS.map((corner) => (
          <button
            key={corner}
            type="button"
            aria-label={CORNER_LABEL[corner]}
            data-handle={corner}
            onPointerDown={(event) => begin(corner, event)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onKeyDown={(event) => nudge(corner, event)}
            className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ left: `${quad[corner].x}%`, top: `${quad[corner].y}%` }}
          />
        ))}
        {midpoints
          ? EDGES.map((edge) => {
              const point = edgePoint(quad, edge)
              return (
                <button
                  key={edge}
                  type="button"
                  aria-label={`${edge === "n" ? "North" : edge === "e" ? "East" : edge === "s" ? "South" : "West"} edge`}
                  data-handle={edge}
                  onPointerDown={(event) => begin(edge, event)}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                  className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                />
              )
            })
          : null}
        {loupeOpen ? (
          <div
            data-loupe="open"
            className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-2 border-foreground bg-card motion-reduce:transition-none"
            style={{ width: loupeSize, height: loupeSize, left: `calc(${loupePoint.x}% + 14px)`, top: `calc(${loupePoint.y}% - 18px)` }}
          >
            <div
              data-part="loupe-zoom"
              className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, var(--foreground) 1px, transparent 1px), linear-gradient(var(--foreground) 1px, transparent 1px)",
                backgroundSize: "8px 8px",
                transform: "translate(-50%, -50%) scale(2.2)",
              }}
            />
          </div>
        ) : null}
      </motion.div>
      <button type="button" onClick={glideRest} className="mt-3 rounded-full border border-border px-3 py-1.5 text-sm text-foreground">
        Reset
      </button>
    </div>
  )
}
