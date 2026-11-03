"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/cn"

/**
 * 原创短音合成。只在用户手势里 resume，离开视口或减弱动效时停掉。
 * 不采集输入设备，也不画实时频谱。
 */

export const mutedNotice = "Demo starts muted — unmute to hear short UI tones."

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

export function paceRate(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

export function pulseMs(base: number, pace: number, min: number, max: number) {
  return Math.round(clamp(base / paceRate(pace), min, max))
}

export function toneGain(intensity: number, ceiling = 0.12) {
  return Math.round(clamp(intensity, 0, 1) * ceiling * 1000) / 1000
}

export function frameStep(pace: number) {
  return Math.round(clamp(0.18 * paceRate(pace), 0.08, 0.45) * 1000) / 1000
}

export interface ToneGate {
  muted: boolean
  volume: number
  reduced: boolean
  live: boolean
}

export function toneAllowed(gate: ToneGate) {
  return gate.live && !gate.reduced && !gate.muted && gate.volume > 0
}

export interface StagePoint {
  x: number
  y: number
}

export function stagePoint(
  root: HTMLElement | null,
  node: HTMLElement,
  event: { clientX: number; clientY: number } | null,
  fallback: StagePoint,
): StagePoint {
  const rootRect = root?.getBoundingClientRect()
  const rect = node.getBoundingClientRect()
  const originX = rootRect?.left ?? 0
  const originY = rootRect?.top ?? 0
  if (!event) {
    const width = rect.width > 0 ? rect.width : fallback.x
    const height = rect.height > 0 ? rect.height : fallback.y
    return { x: rect.left - originX + width / 2, y: rect.top - originY + height / 2 }
  }
  return { x: event.clientX - originX, y: event.clientY - originY }
}

export function cancelFrame(frameRef: { current: number }) {
  if (frameRef.current === 0) return
  window.cancelAnimationFrame(frameRef.current)
  frameRef.current = 0
}

export function runFrames(frameRef: { current: number }, keepGoing: () => boolean) {
  if (frameRef.current !== 0) return
  const tick = () => {
    if (!keepGoing()) {
      frameRef.current = 0
      return
    }
    frameRef.current = window.requestAnimationFrame(tick)
  }
  frameRef.current = window.requestAnimationFrame(tick)
}

export function useSoundOn(muted: boolean) {
  const [soundOn, setSoundOn] = useState(!muted)
  const [seen, setSeen] = useState(muted)
  if (seen !== muted) {
    setSeen(muted)
    setSoundOn(!muted)
  }
  return [soundOn, setSoundOn] as const
}

export function useLevel(volume: number) {
  const [level, setLevel] = useState(volume)
  const [seen, setSeen] = useState(volume)
  if (seen !== volume) {
    setSeen(volume)
    setLevel(volume)
  }
  return [level, setLevel] as const
}

interface Stoppable {
  stop: () => void
}

export interface FeedbackAudio {
  resume: () => void
  stopAll: () => void
  close: () => void
  playTick: (pitch: number, ms: number, volume: number) => boolean
  playChime: (kind: "soft" | "bright", ms: number, volume: number) => boolean
  playBuzz: (band: "low" | "mid", ms: number, volume: number) => boolean
  playLatch: (pitch: number, ms: number, volume: number) => boolean
  playWhoosh: (ms: number, volume: number) => boolean
  playCone: (ms: number, volume: number) => boolean
}

export function createFeedbackAudio(): FeedbackAudio {
  let audio: AudioContext | null = null
  const active = new Set<Stoppable>()

  function context() {
    if (audio && audio.state !== "closed") return audio
    if (typeof window === "undefined") return null
    const Ctor = window.AudioContext ?? window.webkitAudioContext
    if (!Ctor) return null
    try {
      audio = new Ctor()
    } catch {
      audio = null
    }
    return audio
  }

  function resume() {
    const current = context()
    if (current && current.state === "suspended") void current.resume()
  }

  function stopAll() {
    for (const entry of [...active]) entry.stop()
    active.clear()
  }

  function close() {
    stopAll()
    const current = audio
    audio = null
    if (current && current.state !== "closed") void current.close()
  }

  function envelope(gain: GainNode, current: AudioContext, volume: number, seconds: number, delay: number) {
    const now = current.currentTime + delay
    const peak = Math.max(0.0001, volume)
    const attack = Math.min(0.015, seconds * 0.3)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(seconds, attack + 0.01))
  }

  function arm(
    node: OscillatorNode | AudioBufferSourceNode,
    gain: GainNode,
    current: AudioContext,
    seconds: number,
    delay: number,
  ) {
    let stopped = false
    const entry: Stoppable = {
      stop: () => {
        if (stopped) return
        stopped = true
        active.delete(entry)
        const at = current.currentTime
        try {
          gain.gain.cancelScheduledValues(at)
          gain.gain.setValueAtTime(0.0001, at)
        } catch {
          /* context already closed */
        }
        try {
          node.stop()
        } catch {
          /* node already stopped */
        }
        try {
          node.disconnect()
          gain.disconnect()
        } catch {
          /* node already disconnected */
        }
      },
    }
    active.add(entry)
    node.onended = () => entry.stop()
    const startAt = current.currentTime + delay
    node.start(startAt)
    try {
      node.stop(startAt + seconds)
    } catch {
      entry.stop()
    }
  }

  function tone(frequency: number, type: OscillatorType, ms: number, volume: number, delay = 0) {
    if (!(volume > 0) || !(ms > 0)) return false
    const current = context()
    if (!current) return false
    const seconds = ms / 1000
    const osc = current.createOscillator()
    const gain = current.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(Math.max(40, frequency), current.currentTime + delay)
    envelope(gain, current, volume, seconds, delay)
    osc.connect(gain)
    gain.connect(current.destination)
    arm(osc, gain, current, seconds, delay)
    return true
  }

  function attempt(run: () => boolean) {
    try {
      return run()
    } catch {
      return false
    }
  }

  return {
    resume,
    stopAll,
    close,
    playTick: (pitch, ms, volume) => attempt(() => tone(pitch, "square", ms, volume)),
    playChime: (kind, ms, volume) =>
      attempt(() => {
        const low = kind === "bright" ? 784 : 523
        const high = kind === "bright" ? 1046 : 659
        const note = ms * 0.62
        const first = tone(low, "sine", note, volume)
        const second = tone(high, "sine", note, volume * 0.85, (ms / 1000) * 0.32)
        return first || second
      }),
    playBuzz: (band, ms, volume) => attempt(() => tone(band === "mid" ? 160 : 90, "sawtooth", ms, volume)),
    playLatch: (pitch, ms, volume) => attempt(() => tone(pitch, "triangle", ms, volume)),
    playWhoosh: (ms, volume) =>
      attempt(() => {
        if (!(volume > 0) || !(ms > 0)) return false
        const current = context()
        if (!current) return false
        const seconds = ms / 1000
        const length = Math.max(1, Math.floor(current.sampleRate * seconds))
        const buffer = current.createBuffer(1, length, current.sampleRate)
        const data = buffer.getChannelData(0)
        for (let index = 0; index < data.length; index += 1) {
          const env = 1 - index / data.length
          data[index] = (Math.random() * 2 - 1) * env * env
        }
        const source = current.createBufferSource()
        const filter = current.createBiquadFilter()
        const gain = current.createGain()
        source.buffer = buffer
        filter.type = "bandpass"
        filter.frequency.setValueAtTime(880, current.currentTime)
        filter.Q.value = 0.7
        envelope(gain, current, volume, seconds, 0)
        source.connect(filter)
        filter.connect(gain)
        gain.connect(current.destination)
        arm(source, gain, current, seconds, 0)
        return true
      }),
    playCone: (ms, volume) => attempt(() => tone(520, "sine", ms, volume)),
  }
}

export function useToneGate(live: boolean, reduced: boolean, soundOn: boolean) {
  const [audio] = useState(createFeedbackAudio)
  const frameRef = useRef(0)

  useEffect(() => {
    if (live && !reduced && soundOn) return
    cancelFrame(frameRef)
    audio.stopAll()
  }, [audio, live, reduced, soundOn])

  useEffect(
    () => () => {
      cancelFrame(frameRef)
      audio.close()
    },
    [audio],
  )

  return { audio, frameRef }
}

export function SoundHeader({
  soundOn,
  onToggle,
  hideToggle = false,
  extra,
}: {
  soundOn: boolean
  onToggle?: () => void
  hideToggle?: boolean
  extra?: ReactNode
}) {
  return (
    <div className="relative z-10 mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className="max-w-sm text-xs text-muted-foreground">{mutedNotice}</p>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {hideToggle ? null : (
          <button
            type="button"
            aria-pressed={soundOn}
            onClick={onToggle}
            className={cn(
              "rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground",
              focusRing,
            )}
          >
            {soundOn ? "Mute" : "Unmute"}
          </button>
        )}
        <span data-sound-label="" className="text-xs text-muted-foreground">
          {soundOn ? "Sound on" : "Sound off"}
        </span>
      </div>
    </div>
  )
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
