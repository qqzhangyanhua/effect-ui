"use client"

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by MagicPath, Slite, Synthesia, Rive, and Mural (via Mobbin), original implementation.
 * https://mobbin.com/flows/2fee0d48-7ed1-42b4-b908-13af59bf561a
 * https://mobbin.com/flows/2487e42e-4285-4a02-89c7-3a7fb482cd8a
 * https://mobbin.com/flows/ea0c9ad8-847e-4348-aa56-452fd55567e7
 * https://mobbin.com/screens/e00c2c9a-3a91-47ba-b92b-6fc2b9129517
 * https://mobbin.com/screens/344e8f25-1f0e-425f-8b0d-c37fd173c2fb
 */

export interface BrimFlickInkProps {
  pace?: number
  intensity?: number
  edge?: BrimEdge
  oncePerEnter?: boolean
  className?: string
  onValueChange?: (state: { card: string; flick: boolean }) => void
}

export type BrimEdge = "top" | "start" | "perimeter"

export interface InkBox {
  x: number
  y: number
  w: number
  h: number
}

export interface Flick {
  card: string
  phase: number
}

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function flickStep(pace: number) {
  return Math.round(clamp(0.1 * rateOf(pace), 0.04, 0.28) * 1000) / 1000
}

export function inkAlpha(intensity: number, phase: number) {
  return Math.round((1 - clamp(phase, 0, 1)) * (0.14 + clamp(intensity, 0, 1) * 0.3) * 1000) / 1000
}

export function inkBox(edge: BrimEdge, phase: number, intensity: number): InkBox {
  const t = clamp(phase, 0, 1)
  const thick = Math.round((2 + clamp(intensity, 0, 1) * 2) * 10) / 10
  if (edge === "top") return { x: Math.round(t * 78 * 10) / 10, y: 0, w: 22, h: thick }
  if (edge === "start") return { x: 0, y: Math.round(t * 78 * 10) / 10, w: thick, h: 22 }
  const side = Math.min(3, Math.floor(t * 4))
  const local = (t * 4) % 1
  if (side === 0) return { x: Math.round(local * 82 * 10) / 10, y: 0, w: 18, h: thick }
  if (side === 1) return { x: 100 - thick, y: Math.round(local * 78 * 10) / 10, w: thick, h: 18 }
  if (side === 2) return { x: Math.round((1 - local) * 82 * 10) / 10, y: 100 - thick, w: 18, h: thick }
  return { x: 0, y: Math.round((1 - local) * 78 * 10) / 10, w: thick, h: 18 }
}

function stillBox(edge: BrimEdge): InkBox {
  if (edge === "start") return { x: 0, y: 18, w: 2, h: 28 }
  if (edge === "perimeter") return { x: 0, y: 0, w: 28, h: 2 }
  return { x: 12, y: 0, w: 28, h: 2 }
}

export function BrimFlickInk({
  pace = 1,
  intensity = 0.16,
  edge = "top",
  oncePerEnter = true,
  className,
  onValueChange,
}: BrimFlickInkProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const flickRef = useRef<Flick | null>(null)
  const frameRef = useRef(0)
  const playedRef = useRef<Record<string, boolean>>({})
  const originRef = useRef({ x: 0, y: 0 })
  const replayRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const onceRef = useRef(true)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const [flick, setFlick] = useState<Flick | null>(null)
  const [cut, setCut] = useState("none")
  const [still, setStill] = useState("none")
  const [opens, setOpens] = useState(0)
  const [edits, setEdits] = useState(0)
  const [continues, setContinues] = useState(0)
  if ((!live || reduced) && flick) setFlick(null)

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      const current = flickRef.current
      if (!current || !liveRef.current || reducedRef.current) {
        flickRef.current = null
        setFlick(null)
        frameRef.current = 0
        return
      }
      const phase = Math.round((current.phase + flickStep(paceRef.current)) * 1000) / 1000
      if (phase >= 1) {
        flickRef.current = null
        setFlick(null)
        frameRef.current = 0
        if (!onceRef.current) replayRef.current = true
        return
      }
      const next = { card: current.card, phase }
      flickRef.current = next
      setFlick(next)
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function startFlick(card: string) {
    if (reducedRef.current || !liveRef.current) {
      stop()
      flickRef.current = null
      setFlick(null)
      setCut(card)
      return
    }
    setCut("none")
    playedRef.current[card] = true
    const next = { card, phase: 0 }
    flickRef.current = next
    setFlick(next)
    kick()
  }

  function onEnter(card: string, event: PointerEvent<HTMLElement>) {
    originRef.current = { x: event.clientX, y: event.clientY }
    replayRef.current = false
    if (onceRef.current && playedRef.current[card]) return
    startFlick(card)
  }

  function onLeave(card: string) {
    playedRef.current[card] = false
    replayRef.current = false
    setCut((value) => (value === card ? "none" : value))
  }

  function onMove(card: string, event: PointerEvent<HTMLElement>) {
    if (onceRef.current || !replayRef.current || flickRef.current) return
    const dx = event.clientX - originRef.current.x
    const dy = event.clientY - originRef.current.y
    if (dx * dx + dy * dy < 64 * 64) return
    originRef.current = { x: event.clientX, y: event.clientY }
    replayRef.current = false
    startFlick(card)
  }

  function onFocus(card: string) {
    setStill(card)
  }

  function onBlur(event: FocusEvent<HTMLElement>, card: string) {
    const next = event.relatedTarget
    const shell = event.currentTarget.closest("[data-card-shell]")
    if (next instanceof Node && shell?.contains(next)) return
    setStill((value) => (value === card ? "none" : value))
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = rateOf(pace)
    onceRef.current = oncePerEnter
    if (live && !reduced) return
    if (frameRef.current !== 0) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    flickRef.current = null
  }, [live, reduced, pace, oncePerEnter])

  useEffect(() => {
    onValueChange?.({ card: flick?.card ?? "none", flick: flick !== null })
  }, [flick, onValueChange])

  useEffect(() => () => stop(), [])

  const quiet = stillBox(edge)
  const playing = flick !== null
  const activeBox = flick ? inkBox(edge, flick.phase, gain) : quiet

  function mark(card: string) {
    if (!flick || flick.card !== card) return null
    return (
      <motion.span
        data-ink=""
        aria-hidden="true"
        style={{
          left: `${activeBox.x}%`,
          top: `${activeBox.y}%`,
          width: activeBox.w,
          height: activeBox.h,
          opacity: inkAlpha(gain, flick.phase),
          pointerEvents: "none",
        }}
        className="pointer-events-none absolute z-20 rounded-full bg-foreground motion-reduce:transition-none"
      />
    )
  }

  function stillMark(card: string) {
    const show = still === card && flick?.card !== card
    const hoverCut = cut === card
    if (!show && !hoverCut) return null
    return (
      <span
        data-still-edge=""
        aria-hidden="true"
        style={{
          left: `${quiet.x}%`,
          top: `${quiet.y}%`,
          width: quiet.w,
          height: quiet.h,
          opacity: 0.45,
          pointerEvents: "none",
        }}
        className="pointer-events-none absolute z-20 rounded-full bg-foreground"
      />
    )
  }

  return (
    <div
      ref={rootRef}
      data-slot="brim-flick-ink"
      data-ritual="brim-flick"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-edge={edge}
      data-once={oncePerEnter ? "on" : "off"}
      data-flick={playing ? "play" : "off"}
      data-card={flick?.card ?? "none"}
      data-phase={flick ? flick.phase.toFixed(3) : "0.000"}
      data-cut={cut}
      data-still={still}
      data-opens={opens}
      data-edits={edits}
      data-continues={continues}
      className={cn(
        "grid w-full gap-3 rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none sm:grid-cols-2",
        className,
      )}
    >
      <article
        data-card-shell="notes"
        onPointerEnter={(event) => onEnter("notes", event)}
        onPointerLeave={() => onLeave("notes")}
        onPointerMove={(event) => onMove("notes", event)}
        className="relative overflow-hidden rounded-2xl border border-border bg-background p-4"
      >
        {mark("notes")}
        {stillMark("notes")}
        <h3 className="text-sm font-semibold text-foreground">Field notes</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">A short page with room to mark.</p>
        <button
          type="button"
          onClick={() => setOpens((count) => count + 1)}
          onFocus={() => onFocus("notes")}
          onBlur={(event) => onBlur(event, "notes")}
          className={cn("relative z-10 mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", ring)}
        >
          Open note
        </button>
      </article>
      <article
        data-card-shell="draft"
        onPointerEnter={(event) => onEnter("draft", event)}
        onPointerLeave={() => onLeave("draft")}
        onPointerMove={(event) => onMove("draft", event)}
        className="relative overflow-hidden rounded-2xl border border-border bg-background p-4"
      >
        {mark("draft")}
        {stillMark("draft")}
        <h3 className="text-sm font-semibold text-foreground">Draft</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Neutral copy stays put while the edge flashes.</p>
        <button
          type="button"
          onClick={() => setEdits((count) => count + 1)}
          onFocus={() => onFocus("draft")}
          onBlur={(event) => onBlur(event, "draft")}
          className={cn("relative z-10 mt-4 rounded-full border border-border px-4 py-2 text-sm text-foreground", ring)}
        >
          Edit draft
        </button>
      </article>
      <button
        type="button"
        data-card-shell="continue"
        onClick={() => setContinues((count) => count + 1)}
        onFocus={() => onFocus("continue")}
        onBlur={(event) => onBlur(event, "continue")}
        onPointerEnter={(event) => onEnter("continue", event)}
        onPointerLeave={() => onLeave("continue")}
        onPointerMove={(event) => onMove("continue", event)}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-primary px-4 py-4 text-sm font-medium text-primary-foreground sm:col-span-2",
          ring,
        )}
      >
        {mark("continue")}
        {stillMark("continue")}
        <span className="relative z-10">Continue</span>
      </button>
    </div>
  )
}
