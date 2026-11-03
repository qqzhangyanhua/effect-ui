"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
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
  toneAllowed,
  toneGain,
  useSoundOn,
  useToneGate,
} from "./tone/feedback-tone"

/**
 * Inspired by Maze, Stripe, Square, Pipedrive, and Tines (via Mobbin), original implementation.
 * https://mobbin.com/screens/30545233-1c08-436f-959b-253654674e61
 * https://mobbin.com/flows/7177ba32-60f7-4f26-ad96-3947972b9ad3
 * https://mobbin.com/flows/53486e6a-eb5a-48a0-b4cb-f0c599ef1fab
 * https://mobbin.com/flows/c77f9668-552e-4da7-88a7-c7f2c10332ed
 * https://mobbin.com/flows/906d952d-78cd-4412-a071-7344f7dbf2f8
 */

export interface ChimeCheckBloomProps {
  pace?: number
  intensity?: number
  style?: BloomStyle
  chime?: ChimeKind
  muted?: boolean
  className?: string
  onValueChange?: (state: { phase: "idle" | "done"; muted: boolean }) => void
}

export type BloomStyle = "check" | "ring"
export type ChimeKind = "soft" | "bright"

interface Bloom {
  progress: number
}

export function bloomSpan(progress: number, intensity: number) {
  return Math.round(36 + clamp(progress, 0, 1) * (10 + clamp(intensity, 0, 1) * 22))
}

export function ChimeCheckBloom({
  pace = 1,
  intensity = 0.3,
  style = "check",
  chime = "soft",
  muted = true,
  className,
  onValueChange,
}: ChimeCheckBloomProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const bloomRef = useRef<Bloom | null>(null)
  const fromPointer = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [soundOn, setSoundOn] = useSoundOn(muted)
  const { audio, frameRef } = useToneGate(live, reduced, soundOn)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const soundRef = useRef(soundOn)
  const paceRef = useRef(pace)
  const [phase, setPhase] = useState<"idle" | "done">("idle")
  const [bloom, setBloom] = useState<Bloom | null>(null)
  const [plays, setPlays] = useState(0)
  if ((!live || reduced) && bloom) setBloom(null)

  function finish() {
    bloomRef.current = null
    setBloom(null)
    setPhase("done")
  }

  function confirm() {
    if (phase === "done") return
    const volume = toneGain(intensity)
    const allowed = toneAllowed({
      muted: !soundRef.current,
      volume,
      reduced: reducedRef.current,
      live: liveRef.current,
    })
    if (allowed) {
      audio.resume()
      if (audio.playChime(chime, pulseMs(280, pace, 120, 400), volume)) setPlays((count) => count + 1)
    }
    if (!liveRef.current || reducedRef.current) {
      finish()
      return
    }
    const next = { progress: 0 }
    bloomRef.current = next
    setBloom(next)
    setPhase("done")
    runFrames(frameRef, () => {
      const current = bloomRef.current
      if (!current || !liveRef.current || reducedRef.current) {
        bloomRef.current = null
        setBloom(null)
        return false
      }
      const progress = Math.round((current.progress + frameStep(paceRef.current)) * 1000) / 1000
      if (progress >= 1) {
        bloomRef.current = null
        setBloom(null)
        return false
      }
      const stepped = { progress }
      bloomRef.current = stepped
      setBloom(stepped)
      return true
    })
  }

  function reset() {
    bloomRef.current = null
    setBloom(null)
    setPhase("idle")
    audio.stopAll()
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    fromPointer.current = true
    confirm()
  }

  function onClick() {
    if (fromPointer.current) {
      fromPointer.current = false
      return
    }
    confirm()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    fromPointer.current = true
    confirm()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    soundRef.current = soundOn
    paceRef.current = pace
  }, [live, reduced, soundOn, pace])

  useEffect(() => {
    onValueChange?.({ phase, muted: !soundOn })
  }, [phase, soundOn, onValueChange])

  const shown = bloom && live && !reduced ? bloom : null
  const size = shown ? bloomSpan(shown.progress, intensity) : 0

  return (
    <div
      ref={rootRef}
      data-slot="chime-check-bloom"
      data-ritual="chime-bloom"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-muted={soundOn ? "off" : "on"}
      data-held={!live || reduced || !soundOn ? "on" : "off"}
      data-style={style}
      data-chime={chime}
      data-phase={phase}
      data-bloom={shown ? "on" : "off"}
      data-plays={plays}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <SoundHeader soundOn={soundOn} onToggle={() => setSoundOn((current) => !current)} />
      <div className="relative z-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={onClick}
          onKeyDown={onKeyDown}
          className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", focusRing)}
        >
          Confirm
        </button>
        {phase === "done" ? (
          <div data-success="" className="relative flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <span className="relative grid h-12 w-12 place-items-center text-primary">
              <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
                <path d="M10 25 l9 9 19-20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Saved</p>
              <button type="button" onClick={reset} className={cn("text-xs text-muted-foreground", focusRing)}>
                Reset
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Ready when you are.</p>
        )}
      </div>
      <div
        data-bloom-layer=""
        aria-hidden="true"
        style={{ pointerEvents: "none" }}
        className="pointer-events-none absolute inset-0 z-20"
      >
        {shown ? (
          <motion.span
            data-bloom-mark=""
            style={{
              width: size,
              height: size,
              opacity: Math.round((1 - shown.progress) * (0.2 + clamp(intensity, 0, 1) * 0.35) * 1000) / 1000,
              pointerEvents: "none",
            }}
            className={cn(
              "pointer-events-none absolute top-1/2 left-36 -translate-x-1/2 -translate-y-1/2 rounded-full motion-reduce:transition-none",
              style === "ring" ? "border border-primary bg-transparent" : "bg-primary/40",
            )}
          />
        ) : null}
      </div>
    </div>
  )
}
