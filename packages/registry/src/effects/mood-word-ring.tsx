"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface MoodWordRingProps {
  pace?: number
  intensity?: number
  auto?: boolean
  echo?: boolean
  className?: string
  onValueChange?: (state: { index: number; word: string }) => void
}

export const MOOD_WORDS = ["Calm", "Focus", "Bright", "Steady", "Soft", "Clear", "Bold", "Quiet"] as const

type MoodPhase = "idle" | "spinning" | "snapped"

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function wrap(angle: number) {
  return ((angle % 360) + 360) % 360
}

export function moodIndexFromAngle(angle: number, count: number = MOOD_WORDS.length) {
  const size = Math.max(1, count)
  const step = 360 / size
  return Math.round(wrap(angle) / step) % size
}

export function moodSnapAngle(angle: number, count: number = MOOD_WORDS.length) {
  const size = Math.max(1, count)
  return moodIndexFromAngle(angle, size) * (360 / size)
}

export function angleFromPointer(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
) {
  const width = rect.width > 0 ? rect.width : 240
  const height = rect.height > 0 ? rect.height : 240
  const cx = rect.width > 0 ? rect.left + width / 2 : width / 2
  const cy = rect.height > 0 ? rect.top + height / 2 : height / 2
  const deg = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI
  return wrap(deg + 90)
}

function capture(event: PointerEvent<HTMLElement>) {
  if (typeof event.currentTarget.setPointerCapture !== "function") return
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // jsdom 不一定能捕获指针。
  }
}

export function MoodWordRing({
  pace = 1,
  intensity = 0.7,
  auto = false,
  echo = true,
  className,
  onValueChange,
}: MoodWordRingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const onValueRef = useRef(onValueChange)
  const angleRef = useRef(0)
  const indexRef = useRef(0)
  const dragRef = useRef<{ pointer: number; angle: number } | null>(null)
  const gain = clamp(intensity, 0, 1)
  const paceRate = rateOf(pace)
  const ms = reduced ? 0 : Math.round(260 / paceRate)
  const [index, setIndex] = useState(0)
  const [angle, setAngle] = useState(0)
  const [phase, setPhase] = useState<MoodPhase>("idle")
  const [dragging, setDragging] = useState(false)
  const [confirmed, setConfirmed] = useState("")
  const playing = auto && live && !reduced && !dragging
  const step = 360 / MOOD_WORDS.length
  const word = MOOD_WORDS[index] ?? MOOD_WORDS[0]

  useEffect(() => {
    onValueRef.current = onValueChange
  }, [onValueChange])

  function apply(next: number, snap: boolean) {
    const resolved = snap || reduced ? moodSnapAngle(next) : wrap(next)
    const nextIndex = moodIndexFromAngle(resolved)
    const changed = nextIndex !== indexRef.current
    angleRef.current = resolved
    indexRef.current = nextIndex
    setAngle(resolved)
    setIndex(nextIndex)
    setPhase(reduced || snap ? "snapped" : "spinning")
    if (changed) onValueRef.current?.({ index: nextIndex, word: MOOD_WORDS[nextIndex] ?? MOOD_WORDS[0] })
  }

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let stopped = false
    let last = 0
    const tick = (now: number) => {
      if (stopped) return
      const dt = now > last ? Math.min(0.05, (now - last) / 1000) : 1 / 12
      if (now > 0) last = now
      const resolved = wrap(angleRef.current + dt * 28 * paceRate)
      const nextIndex = moodIndexFromAngle(resolved)
      angleRef.current = resolved
      setAngle(resolved)
      setPhase("spinning")
      if (nextIndex !== indexRef.current) {
        indexRef.current = nextIndex
        setIndex(nextIndex)
        onValueRef.current?.({ index: nextIndex, word: MOOD_WORDS[nextIndex] ?? MOOD_WORDS[0] })
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
    }
  }, [playing, paceRate])

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== undefined && event.button !== 0) return
    const pointer = angleFromPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
    dragRef.current = { pointer, angle: angleRef.current }
    setDragging(true)
    setPhase(reduced ? "snapped" : "spinning")
    capture(event)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return
    const pointer = angleFromPointer(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect())
    let delta = pointer - dragRef.current.pointer
    if (delta > 180) delta -= 360
    if (delta < -180) delta += 360
    apply(dragRef.current.angle + delta, false)
  }

  function onPointerUp() {
    if (!dragRef.current) return
    dragRef.current = null
    setDragging(false)
    apply(angleRef.current, true)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const atRoot = event.target === event.currentTarget
    if (event.key === "ArrowRight" || event.key === "ArrowDown") apply(index * step + step, true)
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") apply(index * step - step, true)
    else if (event.key === "Enter" && atRoot) setConfirmed(word)
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={ref}
      data-slot="mood-word-ring"
      data-ritual="mood-ring"
      data-pace={paceRate}
      data-intensity={gain}
      data-index={index}
      data-word={word}
      data-angle={angle.toFixed(1)}
      data-phase={phase}
      data-auto={auto ? "on" : "off"}
      data-playing={playing ? "on" : "off"}
      data-echo={echo ? "on" : "off"}
      data-confirmed={confirmed}
      data-ease={ms}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full max-w-md rounded-3xl border border-border bg-card p-4 text-card-foreground outline-none select-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        className,
      )}
    >
      <p className="mb-2 text-sm font-medium text-foreground">Mood</p>
      <div
        data-part="ring"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mx-auto h-64 w-64 touch-none"
      >
        <motion.div
          className="absolute inset-0 motion-reduce:transition-none"
          style={{
            transform: `rotate(${-angle}deg)`,
            transition: reduced || dragging ? "none" : `transform ${ms}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {MOOD_WORDS.map((item, itemIndex) => {
            const selected = itemIndex === index
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => apply(itemIndex * step, true)}
                onPointerDown={(event) => {
                  event.stopPropagation()
                  apply(itemIndex * step, true)
                }}
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
                style={{
                  transform: `rotate(${itemIndex * step}deg) translateY(-104px) rotate(${angle - itemIndex * step}deg) scale(${selected ? 1 + gain * 0.28 : 1})`,
                  opacity: selected ? 1 : 0.38 + (1 - gain) * 0.2,
                }}
              >
                {item}
              </button>
            )
          })}
        </motion.div>
        {echo ? (
          <p data-part="echo" className="pointer-events-none absolute inset-0 grid place-items-center text-xl font-semibold text-foreground">
            {word}
          </p>
        ) : null}
      </div>
    </div>
  )
}
