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
 * Inspired by Telegram, Circle, Dribbble, Cake Equity, and Reddit (via Mobbin), original implementation.
 * https://mobbin.com/screens/04b1a115-b892-4831-a1fd-a1385cb5d141
 * https://mobbin.com/screens/d6f2369c-6122-407a-a0c2-3cf7b8190a32
 * https://mobbin.com/screens/e93c2c22-99d1-425f-9586-1435839ea959
 * https://mobbin.com/screens/0ff3be18-8e6f-400c-9d12-d8fc5565a5ec
 * https://mobbin.com/screens/2b8982f4-eec2-404d-88ff-c65e6075428a
 */

export interface WhooshDartSendProps {
  pace?: number
  intensity?: number
  style?: DartStyle
  direction?: DartDirection
  muted?: boolean
  className?: string
  onValueChange?: (state: { sent: number; dart: boolean; muted: boolean }) => void
}

export type DartStyle = "dart" | "fleck"
export type DartDirection = "end" | "up"

interface Dart {
  x: number
  y: number
  progress: number
}

export function dartShift(progress: number, direction: DartDirection, intensity: number) {
  const distance = 24 + clamp(intensity, 0, 1) * 32
  const t = clamp(progress, 0, 1)
  if (direction === "up") return { x: 0, y: Math.round(-distance * t) }
  return { x: Math.round(distance * t), y: Math.round(-3 * t) }
}

export function WhooshDartSend({
  pace = 1,
  intensity = 0.24,
  style = "dart",
  direction = "end",
  muted = true,
  className,
  onValueChange,
}: WhooshDartSendProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dartRef = useRef<Dart | null>(null)
  const fromPointer = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [soundOn, setSoundOn] = useSoundOn(muted)
  const { audio, frameRef } = useToneGate(live, reduced, soundOn)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const soundRef = useRef(soundOn)
  const paceRef = useRef(pace)
  const [note, setNote] = useState("")
  const [sent, setSent] = useState(0)
  const [probes, setProbes] = useState(0)
  const [dart, setDart] = useState<Dart | null>(null)
  const [plays, setPlays] = useState(0)
  if ((!live || reduced) && dart) setDart(null)

  function send(origin: { x: number; y: number }) {
    setSent((count) => count + 1)
    setNote("")
    const volume = toneGain(intensity)
    const allowed = toneAllowed({
      muted: !soundRef.current,
      volume,
      reduced: reducedRef.current,
      live: liveRef.current,
    })
    if (allowed) {
      audio.resume()
      if (audio.playWhoosh(pulseMs(200, pace, 80, 250), volume)) setPlays((count) => count + 1)
    }
    if (!liveRef.current || reducedRef.current) {
      dartRef.current = null
      setDart(null)
      return
    }
    const next = { x: origin.x, y: origin.y, progress: 0 }
    dartRef.current = next
    setDart(next)
    runFrames(frameRef, () => {
      const current = dartRef.current
      if (!current || !liveRef.current || reducedRef.current) {
        dartRef.current = null
        setDart(null)
        return false
      }
      const progress = Math.round((current.progress + frameStep(paceRef.current)) * 1000) / 1000
      if (progress >= 1) {
        dartRef.current = null
        setDart(null)
        return false
      }
      const stepped = { ...current, progress }
      dartRef.current = stepped
      setDart(stepped)
      return true
    })
  }

  function originOf(node: HTMLElement, event: PointerEvent<HTMLElement> | null) {
    return stagePoint(rootRef.current, node, event, { x: 36, y: 32 })
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    fromPointer.current = true
    send(originOf(event.currentTarget, event))
  }

  function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (fromPointer.current) {
      fromPointer.current = false
      return
    }
    send(originOf(event.currentTarget, null))
  }

  function onFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    send(originOf(event.currentTarget, null))
  }

  function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    fromPointer.current = true
    send(originOf(event.currentTarget, null))
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    soundRef.current = soundOn
    paceRef.current = pace
  }, [live, reduced, soundOn, pace])

  useEffect(() => {
    onValueChange?.({ sent, dart: dart !== null, muted: !soundOn })
  }, [sent, dart, soundOn, onValueChange])

  const shown = dart && live && !reduced ? dart : null
  const marks = style === "fleck" ? [0, 0.16] : [0]

  return (
    <div
      ref={rootRef}
      data-slot="whoosh-dart-send"
      data-ritual="whoosh-dart"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-muted={soundOn ? "off" : "on"}
      data-held={!live || reduced || !soundOn ? "on" : "off"}
      data-style={style}
      data-direction={direction}
      data-sent={sent}
      data-probes={probes}
      data-dart={shown ? "on" : "off"}
      data-marks={shown ? marks.length : 0}
      data-plays={plays}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <SoundHeader soundOn={soundOn} onToggle={() => setSoundOn((current) => !current)} />
      <div className="relative z-10 flex gap-2">
        <input
          value={note}
          aria-label="Note"
          placeholder="Write a note"
          autoComplete="off"
          onChange={(event) => setNote(event.target.value)}
          onKeyDown={onFieldKeyDown}
          className={cn(
            "min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground",
            focusRing,
          )}
        />
        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={onClick}
          onKeyDown={onButtonKeyDown}
          className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", focusRing)}
        >
          Send
        </button>
      </div>
      <div className="relative z-10 mt-3 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Sent {sent}</p>
        <button
          type="button"
          onClick={() => setProbes((count) => count + 1)}
          className={cn("rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground", focusRing)}
        >
          Probe
        </button>
      </div>
      <div
        data-dart-layer=""
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
        className="pointer-events-none absolute inset-0 z-20"
      >
        {shown
          ? marks.map((offset) => {
              const progress = shown.progress - offset
              if (progress < 0) return null
              const shift = dartShift(progress, direction, intensity)
              return (
                <motion.span
                  key={offset}
                  data-dart-mark=""
                  style={{
                    left: shown.x + shift.x,
                    top: shown.y + shift.y,
                    opacity: Math.round((1 - Math.min(1, progress)) * (0.35 + clamp(intensity, 0, 1) * 0.45) * 1000) / 1000,
                    pointerEvents: "none",
                  }}
                  className={cn(
                    "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 bg-primary motion-reduce:transition-none",
                    style === "dart" ? "h-1.5 w-4 rounded-full" : "h-1.5 w-1.5 rounded-full",
                  )}
                />
              )
            })
          : null}
      </div>
    </div>
  )
}
