"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"
import {
  clamp,
  focusRing,
  pulseMs,
  SoundHeader,
  toneAllowed,
  toneGain,
  useLevel,
  useSoundOn,
  useToneGate,
} from "./tone/feedback-tone"

/**
 * Inspired by Zoom, Google Meet, Discord, Cal.com, and Slack (via Mobbin), original implementation.
 * https://mobbin.com/screens/b7f94844-0c48-4ddf-9b31-a25850bf5636
 * https://mobbin.com/screens/c548e855-0a9e-4c6e-93fb-ffa488d0b505
 * https://mobbin.com/screens/dbb26083-0d44-4d90-9498-c07ee9df7a21
 * https://mobbin.com/screens/ff7b5bdb-b91c-4a3b-8290-4e4a9100026b
 * https://mobbin.com/screens/5d5e51d0-7032-4faa-b8df-c6cd650aa73c
 */

export interface MuteConeMorphProps {
  pace?: number
  intensity?: number
  volume?: number
  style?: ConeStyle
  muted?: boolean
  className?: string
  onValueChange?: (state: { muted: boolean; volume: number; testing: boolean }) => void
}

export type ConeStyle = "cone" | "bars-pip"

export function pipSteps(volume: number) {
  const level = clamp(volume, 0, 1)
  if (level <= 0) return 0
  if (level < 0.34) return 1
  if (level < 0.67) return 2
  return 3
}

export function MuteConeMorph({
  pace = 1,
  intensity = 0.3,
  volume = 0.45,
  style = "cone",
  muted = true,
  className,
  onValueChange,
}: MuteConeMorphProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [soundOn, setSoundOn] = useSoundOn(muted)
  const [level, setLevel] = useLevel(volume)
  const { audio } = useToneGate(live, reduced, soundOn)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const soundRef = useRef(soundOn)
  const levelRef = useRef(level)
  const [plays, setPlays] = useState(0)
  const [testing, setTesting] = useState(false)
  const [blocked, setBlocked] = useState(false)
  function toggle() {
    const next = !soundRef.current
    setSoundOn(next)
    setTesting(false)
    if (!next) {
      audio.stopAll()
      setBlocked(false)
      return
    }
    const peak = toneGain(intensity) * clamp(levelRef.current, 0, 1)
    if (!toneAllowed({ muted: false, volume: peak, reduced: reducedRef.current, live: liveRef.current })) return
    audio.resume()
    if (audio.playLatch(460, pulseMs(70, pace, 40, 100), peak)) setPlays((count) => count + 1)
  }

  function testTone() {
    const peak = toneGain(intensity) * clamp(levelRef.current, 0, 1)
    const allowed = toneAllowed({
      muted: !soundRef.current,
      volume: peak,
      reduced: reducedRef.current,
      live: liveRef.current,
    })
    if (!allowed) {
      setBlocked(true)
      setTesting(false)
      audio.stopAll()
      return
    }
    setBlocked(false)
    setTesting(true)
    audio.resume()
    if (audio.playCone(pulseMs(160, pace, 80, 280), peak)) setPlays((count) => count + 1)
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    soundRef.current = soundOn
    levelRef.current = level
  }, [live, reduced, soundOn, level])

  useEffect(() => {
    onValueChange?.({ muted: !soundOn, volume: level, testing })
  }, [soundOn, level, testing, onValueChange])

  const steps = pipSteps(soundOn ? level : 0)
  const pipHeight = style === "bars-pip" ? 8 : 5

  return (
    <div
      ref={rootRef}
      data-slot="mute-cone-morph"
      data-ritual="mute-cone"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-muted={soundOn ? "off" : "on"}
      data-held={!live || reduced || !soundOn ? "on" : "off"}
      data-style={style}
      data-spectrum="off"
      data-steps={steps}
      data-testing={testing ? "on" : "off"}
      data-blocked={blocked ? "on" : "off"}
      data-plays={plays}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <SoundHeader soundOn={soundOn} hideToggle />
      <div className="relative z-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          aria-pressed={soundOn}
          onClick={toggle}
          className={cn(
            "inline-flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2 text-sm text-foreground",
            focusRing,
          )}
        >
          <svg viewBox="0 0 48 48" className={cn("text-foreground", style === "bars-pip" ? "h-6 w-6" : "h-8 w-8")} aria-hidden="true">
            <path d="M8 18 h8 l10 -8 v28 l-10 -8 h-8 z" fill="currentColor" />
            {soundOn ? (
              <motion.path
                d="M32 16 q8 8 0 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                data-cone-wave=""
              />
            ) : (
              <motion.path
                d="M30 16 L42 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                data-cone-slash=""
              />
            )}
          </svg>
          <span>{soundOn ? "Mute" : "Unmute"}</span>
        </button>
        <button
          type="button"
          onClick={testTone}
          className={cn("rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", focusRing)}
        >
          Test
        </button>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Volume
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={level}
            onChange={(event) => setLevel(Number(event.target.value))}
            className={cn("accent-primary", focusRing)}
          />
        </label>
        <div
          data-pip-layer=""
          aria-hidden="true"
          style={{ pointerEvents: "none" }}
          className="pointer-events-none flex items-end gap-1"
        >
          {[0, 1, 2].map((index) => {
            const lit = index < steps
            return (
              <span
                key={index}
                data-volume-pip=""
                data-on={lit ? "on" : "off"}
                style={{
                  height: pipHeight + index * (style === "bars-pip" ? 6 : 3),
                  opacity: lit ? 0.4 + clamp(intensity, 0, 1) * 0.5 : 0.18,
                  pointerEvents: "none",
                }}
                className="pointer-events-none w-1.5 rounded-full bg-primary motion-reduce:transition-none"
              />
            )
          })}
        </div>
      </div>
      <p className="relative z-10 mt-3 text-xs text-muted-foreground">
        {soundOn ? "Sound on. Test plays one short tone." : "Sound off."} Output level only.
      </p>
    </div>
  )
}
