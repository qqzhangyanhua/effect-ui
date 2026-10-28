"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export type ScrambleCharset = "digits" | "alpha" | "symbols" | "mixed"

export interface KineticScrambleTextProps {
  pace?: number
  intensity?: number
  charset?: ScrambleCharset
  text?: string
  className?: string
  onSettle?: () => void
}

const pools: Record<ScrambleCharset, string> = {
  digits: "0123456789",
  alpha: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  symbols: "#$%&*+?=/",
  mixed: "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%*",
}

const fallback = "落定这句文案"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function randomGlyph(pool: string) {
  const index = Math.floor(Math.random() * pool.length)
  return pool[index] ?? "A"
}

function subscribeCoarse(onStoreChange: () => void) {
  const media = window.matchMedia("(pointer: coarse)")
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function coarseNow() {
  return window.matchMedia("(pointer: coarse)").matches
}

export function KineticScrambleText({
  pace = 1,
  intensity = 0.7,
  charset = "mixed",
  text = fallback,
  className,
  onSettle,
}: KineticScrambleTextProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduced = usePrefersReducedMotion()
  const coarse = useSyncExternalStore(subscribeCoarse, coarseNow, () => false)
  const live = useAnimationActive(ref)
  const source = text.length > 0 ? text : fallback
  const glyphs = useMemo(() => Array.from(source), [source])
  const pool = pools[charset] ?? pools.mixed
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const [shown, setShown] = useState<string[]>(glyphs)
  const [tracked, setTracked] = useState(source)
  const [phase, setPhase] = useState<"idle" | "scrambling" | "settled">("idle")
  const [run, setRun] = useState(0)
  const onSettleRef = useRef(onSettle)

  if (tracked !== source) {
    setTracked(source)
    setShown(glyphs)
    setPhase("idle")
  }

  useEffect(() => {
    onSettleRef.current = onSettle
  }, [onSettle])

  useEffect(() => {
    if (phase !== "scrambling" || reduced || !live) return
    let frame = 0
    let step = 0
    let stopped = false
    const total = Math.max(12, Math.round((18 + gain * 16) / rate))
    const tick = () => {
      if (stopped) return
      step += 1
      const progress = step / total
      if (step >= total) {
        setShown(glyphs)
        setPhase("settled")
        onSettleRef.current?.()
        return
      }
      setShown(
        glyphs.map((char, index) => {
          if (char === " ") return " "
          if (progress >= (index + 1) / glyphs.length) return char
          return randomGlyph(pool)
        }),
      )
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [phase, reduced, live, run, rate, gain, glyphs, pool])

  function trigger() {
    if (reduced || !live) return
    setShown(glyphs.map((char) => (char === " " ? char : randomGlyph(pool))))
    setRun((value) => value + 1)
    setPhase("scrambling")
  }

  function onPointerEnter(event: PointerEvent<HTMLButtonElement>) {
    if (coarse || event.pointerType === "touch") return
    trigger()
  }

  const reading = glyphs.join("")

  return (
      <button
        ref={ref}
        type="button"
        data-slot="kinetic-scramble-text"
        data-ritual="kinetic-scramble"
        data-pace={Number.isFinite(pace) ? pace : 1}
        data-intensity={gain}
        data-charset={charset in pools ? charset : "mixed"}
        data-motion={reduced ? "off" : "on"}
        data-pointer={coarse ? "coarse" : "fine"}
        data-live={live ? "on" : "off"}
        data-state={reduced ? "idle" : phase}
        data-text={reading}
        aria-label={reading}
        onPointerEnter={onPointerEnter}
        onFocus={trigger}
        onClick={trigger}
        className={cn(
          "block w-full max-w-xl rounded-3xl border border-border bg-card px-6 py-8 text-left text-card-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          className,
        )}
      >
        <span aria-hidden className="block font-mono text-3xl tracking-wide text-foreground">
          {shown.map((char, index) => (
            <span key={`${source}-${index}`} data-glyph="" className="inline-block min-w-[0.55em]">
              {char === " " ? "\u00a0" : char}
            </span>
          ))}
        </span>
        <span className="mt-3 block text-sm text-muted-foreground">{reduced ? "已显示终稿" : "悬停、聚焦或点按后乱码，再落定"}</span>
      </button>
  )
}
