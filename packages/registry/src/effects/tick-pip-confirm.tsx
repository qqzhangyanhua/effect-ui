"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"
import {
  clamp,
  focusRing,
  frameStep,
  pulseMs,
  runFrames,
  SoundHeader,
  stagePoint,
  toneAllowed,
  toneGain,
  useSoundOn,
  useToneGate,
} from "./tone/feedback-tone"

/**
 * Inspired by Meetup, Asana, Substack, and Skiff (via Mobbin), original implementation.
 * https://mobbin.com/screens/7003027d-4d3c-45f6-b19f-6ff1ec36984a
 * https://mobbin.com/screens/8ebf3ef1-0d7f-4dc9-89b7-2667b95d12b0
 * https://mobbin.com/screens/4b56e134-c4fd-4e6b-b868-cdd33b1b39a7
 * https://mobbin.com/screens/baf594d6-2899-495f-a1bf-b8fe67356e45
 */

export interface TickPipConfirmProps {
  pace?: number
  intensity?: number
  pitch?: number
  style?: PipStyle
  muted?: boolean
  className?: string
  onValueChange?: (state: { pressed: string; pip: boolean; muted: boolean }) => void
}

export type PipStyle = "pip" | "dot"
type ActionId = "note" | "copy" | "share" | "pin"

interface Pip {
  x: number
  y: number
  progress: number
  still: boolean
}

const ACTIONS: readonly { id: ActionId; label: string }[] = [
  { id: "note", label: "Note" },
  { id: "copy", label: "Copy" },
  { id: "share", label: "Share" },
  { id: "pin", label: "Pin" },
]

export function pipSize(intensity: number, style: PipStyle) {
  const base = style === "dot" ? 4 : 7
  return Math.round((base + clamp(intensity, 0, 1) * 3) * 10) / 10
}

export function pipOpacity(progress: number, intensity: number) {
  const fade = 1 - clamp(progress, 0, 1)
  return Math.round(fade * (0.28 + clamp(intensity, 0, 1) * 0.5) * 1000) / 1000
}

export function TickPipConfirm({
  pace = 1,
  intensity = 0.28,
  pitch = 880,
  style = "pip",
  muted = true,
  className,
  onValueChange,
}: TickPipConfirmProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pipRef = useRef<Pip | null>(null)
  const fromPointer = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [soundOn, setSoundOn] = useSoundOn(muted)
  const { audio, frameRef } = useToneGate(live, reduced, soundOn)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const soundRef = useRef(soundOn)
  const paceRef = useRef(pace)
  const [pressed, setPressed] = useState<ActionId | "none">("none")
  const [pip, setPip] = useState<Pip | null>(null)
  const [plays, setPlays] = useState(0)
  if (!live && pip) setPip(null)
  if (reduced && pip && !pip.still) setPip({ ...pip, still: true })

  function press(id: ActionId, point: { x: number; y: number }) {
    setPressed(id)
    if (!liveRef.current) return
    const volume = toneGain(intensity)
    const allowed = toneAllowed({ muted: !soundRef.current, volume, reduced: reducedRef.current, live: true })
    if (allowed) {
      audio.resume()
      if (audio.playTick(pitch, pulseMs(90, pace, 50, 120), volume)) setPlays((count) => count + 1)
    }
    if (reducedRef.current) {
      const still = { x: point.x, y: point.y, progress: 0, still: true }
      pipRef.current = still
      setPip(still)
      return
    }
    const next = { x: point.x, y: point.y, progress: 0, still: false }
    pipRef.current = next
    setPip(next)
    runFrames(frameRef, () => {
      const current = pipRef.current
      if (!current || current.still || !liveRef.current || reducedRef.current) {
        if (!liveRef.current) {
          pipRef.current = null
          setPip(null)
        }
        return false
      }
      const progress = Math.round((current.progress + frameStep(paceRef.current)) * 1000) / 1000
      if (progress >= 1) {
        pipRef.current = null
        setPip(null)
        return false
      }
      const stepped = { ...current, progress }
      pipRef.current = stepped
      setPip(stepped)
      return true
    })
  }

  function pointFor(node: HTMLButtonElement, event: PointerEvent<HTMLButtonElement> | null) {
    return stagePoint(rootRef.current, node, event, { x: 48, y: 36 })
  }

  function onPointerDown(id: ActionId, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    fromPointer.current = true
    press(id, pointFor(event.currentTarget, event))
  }

  function onClick(id: ActionId, event: MouseEvent<HTMLButtonElement>) {
    if (fromPointer.current) {
      fromPointer.current = false
      return
    }
    press(id, pointFor(event.currentTarget, null))
  }

  function onKeyDown(id: ActionId, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    fromPointer.current = true
    press(id, pointFor(event.currentTarget, null))
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    soundRef.current = soundOn
    paceRef.current = pace
  }, [live, reduced, soundOn, pace])

  useEffect(() => {
    onValueChange?.({ pressed, pip: pip !== null, muted: !soundOn })
  }, [pressed, pip, soundOn, onValueChange])

  const shown = pip && live ? pip : null

  return (
    <div
      ref={rootRef}
      data-slot="tick-pip-confirm"
      data-ritual="tick-pip"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-muted={soundOn ? "off" : "on"}
      data-held={!live || reduced || !soundOn ? "on" : "off"}
      data-style={style}
      data-pressed={pressed}
      data-pip={shown ? (shown.still ? "still" : "on") : "off"}
      data-plays={plays}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <SoundHeader soundOn={soundOn} onToggle={() => setSoundOn((current) => !current)} />
      <div className="relative z-10 grid grid-cols-2 gap-3">
        {ACTIONS.map((item) => {
          const selected = pressed === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onPointerDown={(event) => onPointerDown(item.id, event)}
              onClick={(event) => onClick(item.id, event)}
              onKeyDown={(event) => onKeyDown(item.id, event)}
              className={cn(
                "rounded-2xl border px-4 py-6 text-sm font-medium",
                selected ? "border-primary bg-muted text-foreground" : "border-border bg-background text-foreground",
                focusRing,
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        data-pip-layer=""
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
        className="pointer-events-none absolute inset-0 z-20"
      >
        {shown ? (
          <motion.span
            data-pip-mark=""
            style={{
              left: shown.x,
              top: shown.y,
              width: pipSize(intensity, style),
              height: pipSize(intensity, style),
              opacity: shown.still ? pipOpacity(0, intensity) : pipOpacity(shown.progress, intensity),
              pointerEvents: "none",
            }}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary motion-reduce:transition-none"
          />
        ) : null}
      </div>
    </div>
  )
}
