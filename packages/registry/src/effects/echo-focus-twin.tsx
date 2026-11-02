"use client"

import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/**
 * Inspired by Fabric, Cal.com, Figma, Uxcel, and Canva (via Mobbin), original implementation.
 * https://mobbin.com/screens/e6e503a5-4b54-4f8a-b85b-7f1cf36373f1
 * https://mobbin.com/screens/f561880a-1845-4179-904d-3c3aa8941090
 * https://mobbin.com/screens/73f92eb7-2729-4dbc-8a30-500172da42d5
 * https://mobbin.com/screens/55d35782-1f23-4609-a59d-6c0fce819924
 * https://mobbin.com/screens/8318e946-f529-4c38-909b-1b2e5a502bcd
 */

export interface EchoFocusTwinProps {
  pace?: number
  intensity?: number
  style?: TwinStyle
  keyboardOnly?: boolean
  className?: string
  onValueChange?: (state: { target: string; twin: "on" | "off" | "soft" }) => void
}

export type TwinStyle = "ring" | "corners"

export interface TwinBox {
  x: number
  y: number
  w: number
  h: number
}

const CARDS = [
  { id: "first", label: "First card", body: "A quiet option with a visible focus ring." },
  { id: "second", label: "Second card", body: "The twin stays decorative and cannot be focused." },
  { id: "third", label: "Third card", body: "Keyboard order stays on the cards themselves." },
] as const

type CardId = (typeof CARDS)[number]["id"]
type Arm = "keyboard" | "pointer"

const ring =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const emptyBox: TwinBox = { x: 0, y: 0, w: 0, h: 0 }

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function twinAlpha(intensity: number, soft: boolean) {
  const base = 0.14 + clamp(intensity, 0, 1) * 0.32
  return Math.round((soft ? base * 0.45 : base) * 1000) / 1000
}

export function twinStep(pace: number) {
  return Math.round(clamp(0.18 * rateOf(pace), 0.06, 0.4) * 1000) / 1000
}

export function readTwinBox(node: HTMLElement, stage: HTMLElement): TwinBox {
  const stageRect = stage.getBoundingClientRect()
  const rect = node.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    return { x: rect.left - stageRect.left, y: rect.top - stageRect.top, w: rect.width, h: rect.height }
  }
  return {
    x: Number(node.dataset.nx ?? 0),
    y: Number(node.dataset.ny ?? 0),
    w: Number(node.dataset.nw ?? 220),
    h: Number(node.dataset.nh ?? 72),
  }
}

export function EchoFocusTwin({
  pace = 1,
  intensity = 0.24,
  style = "corners",
  keyboardOnly = true,
  className,
  onValueChange,
}: EchoFocusTwinProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef(0)
  const phaseRef = useRef(1)
  const armRef = useRef<Arm>("keyboard")
  const softRef = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const paceRef = useRef(1)
  const keyboardOnlyRef = useRef(true)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const gain = clamp(intensity, 0, 1)
  const [target, setTarget] = useState<CardId | "none">("none")
  const [soft, setSoft] = useState(false)
  const [box, setBox] = useState<TwinBox>(emptyBox)
  const [phase, setPhase] = useState(1)
  const [chosen, setChosen] = useState<CardId | "none">("none")
  if ((!live || reduced) && phase !== 1) setPhase(1)

  function stop() {
    if (frameRef.current === 0) return
    window.cancelAnimationFrame(frameRef.current)
    frameRef.current = 0
  }

  function kick() {
    if (frameRef.current !== 0) return
    const tick = () => {
      if (!liveRef.current || reducedRef.current) {
        phaseRef.current = 1
        setPhase(1)
        frameRef.current = 0
        return
      }
      const next = Math.min(1, Math.round((phaseRef.current + twinStep(paceRef.current)) * 1000) / 1000)
      phaseRef.current = next
      setPhase(next)
      if (next >= 1) {
        frameRef.current = 0
        return
      }
      frameRef.current = window.requestAnimationFrame(tick)
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }

  function hideTwin() {
    stop()
    softRef.current = false
    phaseRef.current = 1
    setPhase(1)
    setSoft(false)
    setTarget("none")
  }

  function showTwin(id: CardId, node: HTMLElement, gentle: boolean) {
    const stage = stageRef.current
    if (!stage) return
    setBox(readTwinBox(node, stage))
    softRef.current = gentle
    setSoft(gentle)
    setTarget(id)
    if (reducedRef.current || !liveRef.current) {
      stop()
      phaseRef.current = 1
      setPhase(1)
      return
    }
    phaseRef.current = 0
    setPhase(0)
    kick()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Tab" || event.key.startsWith("Arrow")) armRef.current = "keyboard"
  }

  function onPointerDown() {
    armRef.current = "pointer"
  }

  function onPointerEnter(id: CardId, event: PointerEvent<HTMLButtonElement>) {
    if (keyboardOnlyRef.current) return
    showTwin(id, event.currentTarget, true)
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (!softRef.current) return
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    hideTwin()
  }

  function onFocus(id: CardId, event: FocusEvent<HTMLButtonElement>) {
    if (keyboardOnlyRef.current && armRef.current === "pointer") {
      hideTwin()
      return
    }
    showTwin(id, event.currentTarget, false)
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (softRef.current) return
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    hideTwin()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    paceRef.current = rateOf(pace)
    keyboardOnlyRef.current = keyboardOnly
    softRef.current = soft
    if (live && !reduced) return
    if (frameRef.current !== 0) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    phaseRef.current = 1
  }, [live, reduced, pace, keyboardOnly, soft])

  useEffect(() => {
    const mode = target === "none" ? "off" : soft ? "soft" : "on"
    onValueChange?.({ target, twin: mode })
  }, [target, soft, onValueChange])

  useEffect(() => () => stop(), [])

  const mode = target === "none" ? "off" : soft ? "soft" : "on"
  const alpha = twinAlpha(gain, soft) * phase

  return (
    <div
      ref={rootRef}
      data-slot="echo-focus-twin"
      data-ritual="echo-focus"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-style={style}
      data-keyboard={keyboardOnly ? "on" : "off"}
      data-twin={mode}
      data-target={target}
      data-phase={phase.toFixed(3)}
      data-chosen={chosen}
      className={cn(
        "w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        ref={stageRef}
        className="relative flex flex-col gap-2"
        onKeyDown={onKeyDown}
        onPointerLeave={onPointerLeave}
        onBlur={onBlur}
      >
        {CARDS.map((card, index) => (
          <button
            key={card.id}
            type="button"
            data-nx={index * 16}
            data-ny={index * 64}
            data-nw={240}
            data-nh={68}
            onPointerDown={onPointerDown}
            onPointerEnter={(event) => onPointerEnter(card.id, event)}
            onFocus={(event) => onFocus(card.id, event)}
            onClick={() => setChosen(card.id)}
            className={cn("rounded-2xl border border-border bg-background px-4 py-3 text-left", ring)}
          >
            <span className="block text-sm font-medium text-foreground">{card.label}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{card.body}</span>
          </button>
        ))}
        {target !== "none" ? (
          <motion.div
            data-twin-layer=""
            aria-hidden="true"
            style={{
              left: box.x - 4,
              top: box.y - 4,
              width: box.w + 8,
              height: box.h + 8,
              opacity: alpha,
              pointerEvents: "none",
            }}
            className="pointer-events-none absolute z-20 motion-reduce:transition-none"
          >
            {style === "ring" ? (
              <span className="pointer-events-none absolute inset-0 rounded-2xl border border-primary" />
            ) : (
              ["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map(
                (place) => (
                  <span
                    key={place}
                    data-twin-corner=""
                    className={cn("pointer-events-none absolute h-2.5 w-2.5 border-primary", place)}
                  />
                ),
              )
            )}
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
