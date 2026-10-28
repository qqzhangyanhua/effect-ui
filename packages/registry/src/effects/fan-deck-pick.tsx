"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FanDeckPickProps {
  pace?: number
  intensity?: number
  count?: number
  spread?: number
  className?: string
  onReveal?: (index: number | null) => void
}

const DECK = [
  { title: "North", copy: "A quiet heading with open sky." },
  { title: "Begin", copy: "The first step stays unmarked." },
  { title: "Harbor", copy: "Still water beside a low wall." },
  { title: "Quiet", copy: "A room with one window." },
  { title: "Field", copy: "Pale grass under a flat light." },
  { title: "Lantern", copy: "A small glow on the path." },
  { title: "Cedar", copy: "Tall shade and a narrow trail." },
  { title: "Drift", copy: "Slow movement across open ground." },
  { title: "Meadow", copy: "Low color and a long edge." },
  { title: "Stone", copy: "A cool surface, cut square." },
  { title: "Echo", copy: "A sound that returns once." },
  { title: "Vale", copy: "A shallow fold in the land." },
] as const

type Phase = "fanning" | "focused" | "revealed"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function countOf(count: number) {
  return clamp(Math.round(count), 8, 12)
}

function spreadOf(spread: number) {
  return clamp(spread, 36, 96)
}

function middleOf(count: number) {
  return Math.floor((countOf(count) - 1) / 2)
}

export function FanDeckPick({
  pace = 1,
  intensity = 0.6,
  count = 10,
  spread = 64,
  className,
  onReveal,
}: FanDeckPickProps) {
  const ref = useRef<HTMLDivElement>(null)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const origin = useRef<{ x: number; focus: number } | null>(null)
  const moved = useRef(false)
  const onRevealRef = useRef(onReveal)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const total = countOf(count)
  const fan = spreadOf(spread)
  const lift = Math.round(10 + gain * 34)
  const ease = reduced ? 0 : Math.round(280 / rate)
  const cards = DECK.slice(0, total)
  const [focus, setFocus] = useState(() => middleOf(count))
  const [reveal, setReveal] = useState<number | null>(null)
  const [phase, setPhase] = useState<Phase>("fanning")
  const safeFocus = clamp(focus, 0, total - 1)
  const open = reveal !== null && reveal < total ? reveal : null
  const step = total <= 1 ? 0 : fan / (total - 1)

  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  function labelFor(index: number, revealed: boolean) {
    return `Card ${index + 1} of ${total}${revealed ? ", revealed" : ""}`
  }

  function openCard(index: number) {
    const next = open === index ? null : index
    setFocus(index)
    setReveal(next)
    setPhase(next === null ? "fanning" : "revealed")
    onRevealRef.current?.(next)
  }

  function move(direction: number) {
    const next = clamp(safeFocus + direction, 0, total - 1)
    setFocus(next)
    setReveal(null)
    setPhase("focused")
    onRevealRef.current?.(null)
    queueMicrotask(() => buttons.current[next]?.focus())
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      move(1)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      move(-1)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openCard(safeFocus)
    } else if (event.key === "Escape") {
      event.preventDefault()
      setReveal(null)
      setPhase("fanning")
      onRevealRef.current?.(null)
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    moved.current = false
    origin.current = { x: event.clientX, focus: safeFocus }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = origin.current
    if (!start) return
    const delta = event.clientX - start.x
    if (Math.abs(delta) > 8) moved.current = true
    const shift = Math.round(delta / 36)
    const next = clamp(start.focus + shift, 0, total - 1)
    if (next !== safeFocus) {
      setFocus(next)
      setReveal(null)
      setPhase("focused")
    }
  }

  function onPointerUp() {
    origin.current = null
  }

  function onPick(index: number) {
    if (moved.current) {
      moved.current = false
      return
    }
    openCard(index)
  }

  return (
    <div
      ref={ref}
      data-slot="fan-deck-pick"
      data-ritual="fan-pick"
      data-pace={rate}
      data-intensity={gain}
      data-count={total}
      data-spread={fan}
      data-lift={lift}
      data-focus={safeFocus}
      data-revealed={open === null ? "none" : String(open)}
      data-state={open !== null ? "revealed" : phase}
      data-ease={ease}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-3 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div
        role="group"
        aria-label="牌扇"
        data-part="fan"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-64 touch-none overflow-hidden rounded-2xl bg-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {cards.map((card, index) => {
          const delta = index - safeFocus
          const revealed = open === index
          const angle = revealed ? 0 : delta * step
          const y = revealed ? -(lift + 28) : index === safeFocus ? -lift : Math.min(16, Math.abs(delta) * 3)
          const scale = revealed ? 1.08 : index === safeFocus ? 1.04 : 0.94
          return (
            <button
              key={card.title}
              ref={(node) => {
                buttons.current[index] = node
              }}
              type="button"
              aria-label={labelFor(index, revealed)}
              tabIndex={index === safeFocus ? 0 : -1}
              data-card={index}
              data-title={card.title}
              data-focus={index === safeFocus ? "on" : "off"}
              data-face={revealed ? "front" : "back"}
              data-angle={angle.toFixed(1)}
              onClick={() => onPick(index)}
              className="absolute bottom-3 left-1/2 h-36 w-24 rounded-xl border border-border bg-background text-left shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              style={{
                zIndex: revealed ? 30 : 12 - Math.abs(delta),
                transform: `translateX(-50%) translateY(${y}px) rotate(${angle}deg) scale(${scale})`,
                transformOrigin: "bottom center",
                transition: reduced ? "none" : `transform ${ease}ms ease`,
              }}
            >
              <motion.span
                className="relative block h-full w-full motion-reduce:transition-none"
                style={{
                  transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
                  transformStyle: "preserve-3d",
                  transition: reduced ? "none" : `transform ${ease}ms ease`,
                }}
              >
                <span
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-background"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="size-8 rotate-45 border border-chart-2 bg-chart-4/40" />
                  <span className="h-1 w-10 rounded-full bg-muted" />
                </span>
                <span
                  className="absolute inset-0 flex flex-col justify-end rounded-xl bg-card p-2"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="font-serif text-base text-foreground">{card.title}</span>
                  <span className="mt-1 text-[10px] leading-snug text-muted-foreground">{card.copy}</span>
                </span>
              </motion.span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
