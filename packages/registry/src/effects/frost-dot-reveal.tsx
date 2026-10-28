"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface FrostDotRevealProps {
  pace?: number
  intensity?: number
  span?: number
  persist?: boolean
  className?: string
  onValueChange?: (value: number) => void
}

const MIN = 18
const FROST = 0.22

const GLYPHS: Record<string, readonly string[]> = {
  "0": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["01110", "10000", "11110", "10001", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
}

type Phase = "frosted" | "revealing" | "held"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function spanOf(span: number) {
  return clamp(Math.round(span), 12, 60)
}

function drawFrost(canvas: HTMLCanvasElement | null, now: number, value: number, clarityNow: number, gainNow: number) {
  if (!canvas || (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom"))) return
  const context = canvas.getContext("2d")
  if (!context) return
  const text = String(value)
  const shake = (1 - clarityNow) * (2 + gainNow * 4)
  const ink = getComputedStyle(canvas).color || "rgb(20, 20, 20)"
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = ink
  context.globalAlpha = 0.28 + clarityNow * 0.72
  const cell = 7
  const glyphWidth = 5 * cell
  const total = text.length * (glyphWidth + cell * 2)
  let cursor = (canvas.width - total) / 2
  for (const char of text) {
    const rows = GLYPHS[char]
    if (!rows) continue
    rows.forEach((row, rowIndex) => {
      for (let col = 0; col < row.length; col += 1) {
        if (row[col] !== "1") continue
        const density = 1 + Math.round(clarityNow * gainNow * 2)
        for (let dot = 0; dot < density; dot += 1) {
          const jx = Math.sin(now / 180 + rowIndex * 2 + col + dot) * shake
          const jy = Math.cos(now / 210 + col * 3 + dot) * shake
          context.beginPath()
          context.arc(cursor + col * cell + cell / 2 + jx, 28 + rowIndex * cell + jy, 1.2 + clarityNow * 1.3, 0, Math.PI * 2)
          context.fill()
        }
      }
    })
    cursor += glyphWidth + cell * 2
  }
}

export function FrostDotReveal({
  pace = 1,
  intensity = 0.7,
  span = 47,
  persist = false,
  className,
  onValueChange,
}: FrostDotRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const clarityFrame = useRef(0)
  const jitterFrame = useRef(0)
  const valueRef = useRef(32)
  const clarityRef = useRef(FROST)
  const holding = useRef(false)
  const liveRef = useRef(false)
  const reducedRef = useRef(false)
  const persistRef = useRef(persist)
  const rateRef = useRef(1)
  const gainRef = useRef(0.7)
  const onValueRef = useRef(onValueChange)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const width = spanOf(span)
  const max = MIN + width
  const [value, setValue] = useState(32)
  const [clarity, setClarity] = useState(FROST)
  const [phase, setPhase] = useState<Phase>("frosted")
  const safe = clamp(value, MIN, max)
  const shownClarity = reduced ? 1 : clarity
  const jitterOn = !reduced && live && shownClarity < 0.98

  if (value !== safe) setValue(safe)

  useEffect(() => {
    valueRef.current = safe
    clarityRef.current = shownClarity
    reducedRef.current = reduced
    liveRef.current = live
    persistRef.current = persist
    rateRef.current = rate
    gainRef.current = gain
    onValueRef.current = onValueChange
  }, [gain, live, onValueChange, persist, rate, reduced, safe, shownClarity])

  useEffect(() => {
    if (!jitterOn) return
    let stopped = false
    const tick = (now: number) => {
      if (stopped || !liveRef.current || clarityRef.current >= 0.98) return
      drawFrost(canvasRef.current, now, valueRef.current, clarityRef.current, gainRef.current)
      jitterFrame.current = window.requestAnimationFrame(tick)
    }
    jitterFrame.current = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(jitterFrame.current)
      jitterFrame.current = 0
    }
  }, [jitterOn])

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(clarityFrame.current)
      window.cancelAnimationFrame(jitterFrame.current)
    }
  }, [])

  function stopClarity() {
    window.cancelAnimationFrame(clarityFrame.current)
    clarityFrame.current = 0
  }

  function publishValue(next: number) {
    const clamped = clamp(Math.round(next), MIN, max)
    if (clamped === valueRef.current) return
    valueRef.current = clamped
    setValue(clamped)
    onValueRef.current?.(clamped)
  }

  function runClarity(target: number, after?: () => void) {
    stopClarity()
    if (reducedRef.current || !liveRef.current) {
      const next = reducedRef.current ? 1 : target
      clarityRef.current = next
      setClarity(next)
      after?.()
      return
    }
    const from = clarityRef.current
    const steps = Math.max(4, Math.round(8 / rateRef.current))
    let step = 0
    const tick = () => {
      if (!liveRef.current) {
        clarityRef.current = target
        setClarity(target)
        clarityFrame.current = 0
        return
      }
      step += 1
      const progress = Math.min(1, step / steps)
      const next = Math.round((from + (target - from) * progress) * 100) / 100
      clarityRef.current = next
      setClarity(next)
      if (progress >= 1) {
        clarityFrame.current = 0
        after?.()
        return
      }
      clarityFrame.current = window.requestAnimationFrame(tick)
    }
    clarityFrame.current = window.requestAnimationFrame(tick)
  }

  function reveal() {
    holding.current = true
    if (reducedRef.current) return
    setPhase("revealing")
    runClarity(1)
  }

  function release() {
    holding.current = false
    if (reducedRef.current) return
    if (persistRef.current) {
      setPhase("held")
      runClarity(1)
      return
    }
    runClarity(FROST, () => setPhase("frosted"))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const dir = event.key === "ArrowUp" || event.key === "ArrowRight" ? 1 : event.key === "ArrowDown" || event.key === "ArrowLeft" ? -1 : 0
    if (dir === 0) return
    event.preventDefault()
    publishValue(valueRef.current + dir)
    if (reducedRef.current) return
    setPhase("revealing")
    runClarity(1, () => {
      if (holding.current || persistRef.current) {
        setPhase(persistRef.current ? "held" : "revealing")
        return
      }
      runClarity(FROST, () => setPhase("frosted"))
    })
  }

  function onPointerDown(event: PointerEvent<HTMLInputElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    reveal()
  }

  return (
    <div
      ref={ref}
      data-slot="frost-dot-reveal"
      data-ritual="frost-dot"
      data-fog="off"
      data-pace={rate}
      data-intensity={gain}
      data-span={width}
      data-min={MIN}
      data-max={max}
      data-persist={persist ? "on" : "off"}
      data-value={safe}
      data-clarity={shownClarity.toFixed(2)}
      data-state={reduced ? "solid" : phase}
      data-render={reduced ? "solid" : "dots"}
      data-jitter={jitterOn ? "on" : "off"}
      data-label="Value"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-sm rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">Value</p>
      <div className="relative mt-2 grid h-36 place-items-center overflow-hidden rounded-2xl bg-muted/40">
        {reduced ? (
          <p data-solid className="text-6xl font-semibold tabular-nums text-foreground">
            {safe}
          </p>
        ) : (
          <canvas ref={canvasRef} data-canvas="frost" width={280} height={140} className="h-36 w-full" />
        )}
      </div>
      <label className="mt-3 block text-xs text-muted-foreground">
        Value
        <input
          aria-label="Value"
          type="range"
          min={MIN}
          max={max}
          step={1}
          value={safe}
          onPointerDown={onPointerDown}
          onPointerUp={release}
          onPointerCancel={release}
          onChange={(event) => publishValue(Number(event.currentTarget.value))}
          className="mt-1 w-full touch-none"
        />
      </label>
      <p className="sr-only" aria-live="polite">
        {`Value ${safe}`}
      </p>
    </div>
  )
}
