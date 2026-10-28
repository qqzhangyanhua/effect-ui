"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface WavePinAnchorProps {
  pace?: number
  intensity?: number
  autoPlay?: boolean
  showPins?: boolean
  className?: string
  onValueChange?: (state: { t: number; activePin: number | null }) => void
}

export interface WavePin {
  id: string
  at: number
  label: string
  body: string
}

export const WAVE_BARS = 36
export const WAVE_LANE = 320

export const WAVE_PINS: readonly WavePin[] = [
  { id: "a", at: 0.18, label: "Note A", body: "A quiet mark on the first rise." },
  { id: "b", at: 0.46, label: "Note B", body: "The middle crest holds one line." },
  { id: "c", at: 0.74, label: "Note C", body: "The last crest is a short note." },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function quantize(value: number) {
  if (!Number.isFinite(value)) return 0
  return clamp(Math.round(value * 100) / 100, 0, 1)
}

export function waveAmp(index: number) {
  const t = index / (WAVE_BARS - 1)
  const amp = 0.2 + 0.8 * Math.abs(Math.sin(t * Math.PI * 3.4) * (0.5 + 0.5 * Math.cos(t * 13)))
  return Math.round(amp * 100) / 100
}

const AMPS = Array.from({ length: WAVE_BARS }, (_, index) => waveAmp(index))

export function waveFromPointer(clientX: number, rect: { left: number; width: number }) {
  const width = rect.width > 1 ? rect.width : WAVE_LANE
  const left = rect.width > 1 ? rect.left : 0
  return quantize((clientX - left) / width)
}

export function nextWavePin(current: number | null) {
  if (current === null || current < 0) return 0
  return (current + 1) % WAVE_PINS.length
}

function nudge(value: number, deltaCents: number) {
  return quantize((Math.round(quantize(value) * 100) + deltaCents) / 100)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function WavePinAnchor({
  pace = 1,
  intensity = 0.7,
  autoPlay = false,
  showPins = true,
  className,
  onValueChange,
}: WavePinAnchorProps) {
  const ref = useRef<HTMLDivElement>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(180 / paceRate)
  const [t, setT] = useState(0)
  const [activePin, setActivePin] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [drag, setDrag] = useState(false)
  const [running, setRunning] = useState(autoPlay)
  const [seenAuto, setSeenAuto] = useState(autoPlay)
  const tRef = useRef(0)
  const pinRef = useRef<number | null>(null)
  const openRef = useRef(false)
  const dragRef = useRef(false)
  const onValueRef = useRef(onValueChange)
  const playing = running && live && !reduced && !drag
  const phase = drag ? (reduced ? "idle" : "scrubbing") : playing ? "playing" : open ? (reduced ? "idle" : "pinned") : "idle"
  const note = activePin === null ? null : WAVE_PINS[activePin]

  if (seenAuto !== autoPlay) {
    setSeenAuto(autoPlay)
    setRunning(autoPlay)
  }

  useEffect(() => {
    tRef.current = t
    pinRef.current = activePin
    openRef.current = open
    onValueRef.current = onValueChange
  }, [t, activePin, open, onValueChange])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      let next = tRef.current + dt * 0.42 * paceRate
      if (next >= 1) next -= 1
      tRef.current = next
      setT(next)
      onValueRef.current?.({ t: next, activePin: pinRef.current })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function emit(nextT: number, pin: number | null) {
    onValueRef.current?.({ t: nextT, activePin: pin })
  }

  function commitT(value: number) {
    const next = quantize(value)
    tRef.current = next
    setT(next)
    emit(next, pinRef.current)
  }

  function focusPin(index: number) {
    const pin = WAVE_PINS[index]
    if (!pin) return
    tRef.current = pin.at
    pinRef.current = index
    openRef.current = true
    setT(pin.at)
    setActivePin(index)
    setOpen(true)
    emit(pin.at, index)
  }

  function toggleOpen() {
    if (!showPins) return
    if (pinRef.current === null) {
      focusPin(nextWavePin(null))
      return
    }
    const next = !openRef.current
    openRef.current = next
    setOpen(next)
    emit(tRef.current, pinRef.current)
  }

  function box() {
    const rect = laneRef.current?.getBoundingClientRect()
    if (rect && rect.width > 1) return { left: rect.left, width: rect.width }
    return { left: 0, width: WAVE_LANE }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    dragRef.current = true
    setDrag(true)
    commitT(waveFromPointer(event.clientX, box()))
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commitT(waveFromPointer(event.clientX, box()))
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    commitT(waveFromPointer(event.clientX, box()))
    dragRef.current = false
    setDrag(false)
  }

  function togglePlay() {
    if (reduced) {
      setRunning(false)
      return
    }
    setRunning((value) => !value)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") commitT(nudge(tRef.current, 2))
    else if (event.key === "ArrowLeft") commitT(nudge(tRef.current, -2))
    else if (event.key === "p" || event.key === "P") {
      if (showPins) focusPin(nextWavePin(pinRef.current))
      else return
    } else if (event.key === "Enter") toggleOpen()
    else if (event.key === " " && event.target === event.currentTarget) togglePlay()
    else if (event.key === "Home") commitT(0)
    else if (event.key === "End") commitT(1)
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="wave-pin-anchor"
      data-ritual="wave-pin"
      data-pace={paceRate}
      data-intensity={gain}
      data-t={t.toFixed(2)}
      data-pin={activePin === null ? "none" : String(activePin)}
      data-open={open ? "on" : "off"}
      data-phase={phase}
      data-playing={playing ? "on" : "off"}
      data-pins={showPins ? "on" : "off"}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Wave notes</p>
        <p className="text-xs text-muted-foreground">{Math.round(t * 100)}%</p>
      </div>
      <div className="relative">
        <div
          ref={laneRef}
          role="slider"
          aria-label="Wave position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          data-lane
          className="relative h-24 touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end gap-px">
            {AMPS.map((amp, index) => {
              const at = index / (WAVE_BARS - 1)
              const played = at <= t
              return (
                <span
                  key={index}
                  data-bar={played ? "played" : "rest"}
                  className="flex-1 rounded-full motion-reduce:transition-none"
                  style={{
                    height: `${18 + amp * 82}%`,
                    background: played ? "var(--primary)" : "var(--muted-foreground)",
                    opacity: played ? 0.45 + gain * 0.55 : 0.28 + (1 - gain) * 0.15,
                  }}
                />
              )
            })}
          </div>
          <span
            data-playhead
            className="pointer-events-none absolute top-0 bottom-4 w-0.5 -translate-x-1/2 bg-primary"
            style={{ left: `${t * 100}%` }}
          />
        </div>
        {showPins
          ? WAVE_PINS.map((pin, index) => {
              const selected = index === activePin
              return (
                <button
                  key={pin.id}
                  type="button"
                  aria-label={pin.label}
                  aria-pressed={selected}
                  aria-expanded={selected && open}
                  data-pin-id={pin.id}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => focusPin(index)}
                  className={cn(
                    "absolute top-0 z-10 grid size-8 -translate-x-1/2 place-items-center rounded-full border text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground",
                  )}
                  style={{
                    left: `${pin.at * 100}%`,
                    boxShadow: selected
                      ? `0 0 ${6 + gain * 14}px color-mix(in srgb, var(--primary) ${Math.round(30 + gain * 45)}%, transparent)`
                      : undefined,
                  }}
                >
                  {index + 1}
                </button>
              )
            })
          : null}
      </div>
      {showPins && open && note ? (
        <motion.div
          data-callout={note.id}
          role="note"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.18 / paceRate }}
          className="mt-3 rounded-2xl border border-border bg-popover px-3 py-2 text-popover-foreground motion-reduce:transition-none"
        >
          <p className="text-sm font-medium">{note.label}</p>
          <p className="text-xs text-muted-foreground">{note.body}</p>
        </motion.div>
      ) : null}
      <div className="mt-3">
        <button
          type="button"
          onClick={togglePlay}
          className="h-9 rounded-full bg-primary px-4 text-sm text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {running && !reduced ? "Pause" : "Play"}
        </button>
      </div>
      <motion.span className="sr-only" aria-live="polite">
        {note && open ? `Pinned ${note.label}` : "Wave"}
      </motion.span>
    </div>
  )
}
