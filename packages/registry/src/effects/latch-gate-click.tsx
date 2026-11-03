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
 * Inspired by beehiiv, Buffer, Quicken, Telegram, and Asana (via Mobbin), original implementation.
 * https://mobbin.com/screens/317c4244-a1e6-4cd1-80f2-db3303cfcd36
 * https://mobbin.com/screens/f01206e2-93f4-48f7-84a2-1d6701dcf953
 * https://mobbin.com/screens/f5107531-79c3-4ef1-b54b-4b7e12b90329
 * https://mobbin.com/screens/6e673605-09a9-4893-b0e3-0046589cc26f
 * https://mobbin.com/screens/426ad7e9-6572-4ad4-afbd-e4f4ee052ae2
 */

export interface LatchGateClickProps {
  pace?: number
  intensity?: number
  style?: LatchStyle
  onPitch?: number
  offPitch?: number
  muted?: boolean
  className?: string
  onValueChange?: (state: { id: string; on: boolean; muted: boolean }) => void
}

export type LatchStyle = "thumb" | "gate"
type LatchId = "mail" | "mentions" | "digest"

interface Slide {
  id: LatchId
  from: number
  to: number
  progress: number
}

const ROWS: readonly { id: LatchId; label: string }[] = [
  { id: "mail", label: "Mail" },
  { id: "mentions", label: "Mentions" },
  { id: "digest", label: "Digest" },
]

export function latchSlide(from: number, to: number, progress: number) {
  const t = clamp(progress, 0, 1)
  return from + (to - from) * t
}

export function LatchGateClick({
  pace = 1,
  intensity = 0.26,
  style = "thumb",
  onPitch = 520,
  offPitch = 340,
  muted = true,
  className,
  onValueChange,
}: LatchGateClickProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const slideRef = useRef<Slide | null>(null)
  const fromPointer = useRef(false)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  const [soundOn, setSoundOn] = useSoundOn(muted)
  const { audio, frameRef } = useToneGate(live, reduced, soundOn)
  const liveRef = useRef(live)
  const reducedRef = useRef(reduced)
  const soundRef = useRef(soundOn)
  const paceRef = useRef(pace)
  const [on, setOn] = useState<Record<LatchId, boolean>>({ mail: false, mentions: true, digest: false })
  const [slide, setSlide] = useState<Slide | null>(null)
  const [flash, setFlash] = useState<LatchId | "none">("none")
  const [last, setLast] = useState<LatchId>("mail")
  const [plays, setPlays] = useState(0)
  if ((!live || reduced) && (slide || flash !== "none")) {
    if (slide) setSlide(null)
    if (flash !== "none") setFlash("none")
  }

  function toggle(id: LatchId) {
    const nextOn = !on[id]
    setOn((current) => ({ ...current, [id]: nextOn }))
    setLast(id)
    const volume = toneGain(intensity)
    const allowed = toneAllowed({
      muted: !soundRef.current,
      volume,
      reduced: reducedRef.current,
      live: liveRef.current,
    })
    if (allowed) {
      audio.resume()
      const pitch = nextOn ? onPitch : offPitch
      if (audio.playLatch(pitch, pulseMs(70, pace, 40, 100), volume)) setPlays((count) => count + 1)
    }
    if (!liveRef.current || reducedRef.current) {
      slideRef.current = null
      setSlide(null)
      setFlash("none")
      return
    }
    setFlash(id)
    const next = { id, from: nextOn ? 0 : 1, to: nextOn ? 1 : 0, progress: 0 }
    slideRef.current = next
    setSlide(next)
    runFrames(frameRef, () => {
      const current = slideRef.current
      if (!current || !liveRef.current || reducedRef.current) {
        slideRef.current = null
        setSlide(null)
        setFlash("none")
        return false
      }
      const progress = Math.round((current.progress + frameStep(paceRef.current)) * 1000) / 1000
      if (progress >= 1) {
        slideRef.current = null
        setSlide(null)
        setFlash("none")
        return false
      }
      const stepped = { ...current, progress }
      slideRef.current = stepped
      setSlide(stepped)
      return true
    })
  }

  function onPointerDown(id: LatchId, event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return
    fromPointer.current = true
    toggle(id)
  }

  function onClick(id: LatchId) {
    if (fromPointer.current) {
      fromPointer.current = false
      return
    }
    toggle(id)
  }

  function onKeyDown(id: LatchId, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    fromPointer.current = true
    toggle(id)
  }

  useEffect(() => {
    liveRef.current = live
    reducedRef.current = reduced
    soundRef.current = soundOn
    paceRef.current = pace
  }, [live, reduced, soundOn, pace])

  useEffect(() => {
    onValueChange?.({ id: last, on: on[last], muted: !soundOn })
  }, [last, on, soundOn, onValueChange])

  return (
    <div
      ref={rootRef}
      data-slot="latch-gate-click"
      data-ritual="latch-gate"
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-muted={soundOn ? "off" : "on"}
      data-held={!live || reduced || !soundOn ? "on" : "off"}
      data-style={style}
      data-mail={on.mail ? "on" : "off"}
      data-mentions={on.mentions ? "on" : "off"}
      data-digest={on.digest ? "on" : "off"}
      data-flash={flash}
      data-plays={plays}
      className={cn(
        "relative w-full rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <SoundHeader soundOn={soundOn} onToggle={() => setSoundOn((current) => !current)} />
      <ul className="relative z-10 space-y-2">
        {ROWS.map((row) => {
          const enabled = on[row.id]
          const moving = slide && slide.id === row.id && live && !reduced ? slide : null
          const position = moving ? latchSlide(moving.from, moving.to, moving.progress) : enabled ? 1 : 0
          return (
            <li key={row.id} className="relative">
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onPointerDown={(event) => onPointerDown(row.id, event)}
                onClick={() => onClick(row.id)}
                onKeyDown={(event) => onKeyDown(row.id, event)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border border-border bg-background px-3 py-3 text-sm text-foreground",
                  focusRing,
                )}
              >
                <span>{row.label}</span>
                {style === "gate" ? (
                  <span className="relative h-6 w-5 overflow-hidden rounded-sm border border-border bg-muted" aria-hidden="true">
                    <span
                      data-gate=""
                      className="absolute inset-x-0 bottom-0 bg-primary"
                      style={{ height: `${Math.round(position * 100)}%` }}
                    />
                  </span>
                ) : (
                  <span
                    className={cn("relative h-6 w-11 rounded-full", enabled ? "bg-primary" : "bg-muted")}
                    aria-hidden="true"
                  >
                    <span
                      data-thumb=""
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-background"
                      style={{ left: `${2 + position * 18}px` }}
                    />
                  </span>
                )}
              </button>
              {flash === row.id && live && !reduced ? (
                <motion.span
                  data-latch-flash=""
                  aria-hidden="true"
                  style={{ pointerEvents: "none", opacity: 0.25 + clamp(intensity, 0, 1) * 0.35 }}
                  className="pointer-events-none absolute inset-y-2 right-3 w-1 rounded-full bg-primary motion-reduce:transition-none"
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
