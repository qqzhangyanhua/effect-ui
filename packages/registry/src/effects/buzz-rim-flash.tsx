"use client"

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
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
 * Inspired by Melio, ClassDojo, Instacart, Pinterest, and 15Five (via Mobbin), original implementation.
 * https://mobbin.com/screens/b542daad-cc71-4d22-8622-ffe080d82e31
 * https://mobbin.com/screens/7f5da153-b053-455b-ae14-f38a41c2cc69
 * https://mobbin.com/screens/aead5e2a-a300-4cb1-87a5-2745db13064c
 * https://mobbin.com/screens/907430cd-e903-44e4-aa5e-8790065c21d5
 * https://mobbin.com/screens/0ef7e463-0fb3-4fbe-b21d-65f8ffdfc2a1
 */

export interface BuzzRimFlashProps {
  pace?: number
  intensity?: number
  nudge?: NudgeStyle
  tone?: BuzzTone
  muted?: boolean
  className?: string
  onValueChange?: (state: { error: boolean; muted: boolean }) => void
}

export type NudgeStyle = "none" | "rim" | "soft"
export type BuzzTone = "low" | "mid"

interface Flash {
  progress: number
  still: boolean
}

export function rimShift(progress: number, nudge: NudgeStyle, still: boolean) {
  if (nudge !== "soft" || still) return 0
  return progress < 0.5 ? 2 : 0
}

export function BuzzRimFlash({
  pace = 1,
  intensity = 0.16,
  nudge = "rim",
  tone = "low",
  muted = true,
  className,
  onValueChange,
}: BuzzRimFlashProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldId = useId()
  const flashRef = useRef<Flash | null>(null)
  const nudgeRef = useRef(nudge)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [soundOn, setSoundOn] = useSoundOn(muted)
  const { audio, frameRef } = useToneGate(live, reduced, soundOn)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const soundRef = useRef(soundOn)
  const paceRef = useRef(pace)
  const [value, setValue] = useState("")
  const [error, setError] = useState("")
  const [flash, setFlash] = useState<Flash | null>(null)
  const [plays, setPlays] = useState(0)
  if (!live && flash) setFlash(null)
  if (reduced && flash && !flash.still) setFlash({ progress: 1, still: true })

  function fail() {
    setError("That code does not match.")
    inputRef.current?.focus()
    const volume = toneGain(intensity)
    const allowed = toneAllowed({
      muted: !soundRef.current,
      volume,
      reduced: reducedRef.current,
      live: liveRef.current,
    })
    if (allowed) {
      audio.resume()
      if (audio.playBuzz(tone, pulseMs(160, pace, 80, 200), volume)) setPlays((count) => count + 1)
    }
    if (!liveRef.current || nudgeRef.current === "none") {
      flashRef.current = null
      setFlash(null)
      return
    }
    if (reducedRef.current) {
      const still = { progress: 1, still: true }
      flashRef.current = still
      setFlash(still)
      return
    }
    const next = { progress: 0, still: false }
    flashRef.current = next
    setFlash(next)
    runFrames(frameRef, () => {
      const current = flashRef.current
      if (!current || current.still || !liveRef.current || reducedRef.current) {
        if (!liveRef.current) {
          flashRef.current = null
          setFlash(null)
        }
        return false
      }
      const progress = Math.round((current.progress + frameStep(paceRef.current)) * 1000) / 1000
      if (progress >= 1) {
        const settled = { progress: 1, still: true }
        flashRef.current = settled
        setFlash(settled)
        return false
      }
      const stepped = { ...current, progress }
      flashRef.current = stepped
      setFlash(stepped)
      return true
    })
  }

  function runCheck() {
    if (value.trim() === "ready") {
      setError("")
      flashRef.current = null
      setFlash(null)
      return
    }
    fail()
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    runCheck()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return
    event.preventDefault()
    runCheck()
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    soundRef.current = soundOn
    paceRef.current = pace
    nudgeRef.current = nudge
  }, [live, reduced, soundOn, pace, nudge])

  useEffect(() => {
    onValueChange?.({ error: error.length > 0, muted: !soundOn })
  }, [error, soundOn, onValueChange])

  const shown = flash && live && nudge !== "none" ? flash : null
  const shift = shown ? rimShift(shown.progress, nudge, shown.still || reduced) : 0

  return (
    <div
      ref={rootRef}
      data-slot="buzz-rim-flash"
      data-ritual="buzz-rim"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-muted={soundOn ? "off" : "on"}
      data-held={!live || reduced || !soundOn ? "on" : "off"}
      data-nudge={nudge}
      data-tone={tone}
      data-error={error ? "on" : "off"}
      data-rim={shown ? (shown.still || reduced ? "still" : "on") : "off"}
      data-shift={shift}
      data-plays={plays}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <SoundHeader soundOn={soundOn} onToggle={() => setSoundOn((current) => !current)} />
      <form className="relative z-10 space-y-3" onSubmit={onSubmit}>
        <label className="block text-sm text-foreground" htmlFor={fieldId}>
          Code
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id={fieldId}
            value={value}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "relative z-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground",
              focusRing,
            )}
          />
          <motion.span
            data-rim-layer=""
            aria-hidden="true"
            style={{
              pointerEvents: "none",
              opacity: shown ? (shown.still ? 0.85 : 0.35 + (1 - shown.progress) * (0.2 + clamp(intensity, 0, 1) * 0.45)) : 0,
              transform: shift === 0 ? "none" : `translateX(${shift}px)`,
            }}
            className="pointer-events-none absolute inset-0 z-20 rounded-xl border border-destructive motion-reduce:transition-none"
          />
        </div>
        <button type="submit" className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", focusRing)}>
          Check
        </button>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Enter the code, then check it.</p>
        )}
      </form>
    </div>
  )
}
