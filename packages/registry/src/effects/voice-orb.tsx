"use client"

import type { CSSProperties } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

/** original implementation. An SVG orb for idle, listening, thinking, and speaking. */

export const voiceOrbStates = ["idle", "listen", "think", "speak"] as const

export type VoiceOrbState = (typeof voiceOrbStates)[number]

export interface VoiceOrbProps {
  state?: VoiceOrbState
  volume?: number
  speed?: number
  intensity?: number
  className?: string
}

const LABELS: Record<VoiceOrbState, string> = {
  idle: "Idle",
  listen: "Listening",
  think: "Thinking",
  speak: "Speaking",
}

const THINK_DOTS = [
  { id: "north", cx: 80, cy: 30 },
  { id: "east", cx: 123, cy: 105 },
  { id: "west", cx: 37, cy: 105 },
] as const

const SPEAK_BARS = [
  { id: "a", weight: 0.55 },
  { id: "b", weight: 0.85 },
  { id: "c", weight: 1 },
  { id: "d", weight: 0.7 },
  { id: "e", weight: 0.4 },
] as const

const ORB_CSS = `@keyframes voice-orb-breathe { 50% { transform: scale(1.06); } }
@keyframes voice-orb-spin { to { transform: rotate(360deg); } }
@keyframes voice-orb-speak { 50% { transform: scaleY(0.86); } }
@keyframes voice-orb-dash { to { stroke-dashoffset: -44; } }
.voice-orb-breathe { transform-box: fill-box; transform-origin: center; animation: voice-orb-breathe var(--voice-seconds, 2.8s) ease-in-out infinite; }
.voice-orb-spin { transform-box: view-box; transform-origin: 80px 80px; animation: voice-orb-spin var(--voice-seconds, 2.8s) linear infinite; }
.voice-orb-speak { transform-box: fill-box; transform-origin: center; animation: voice-orb-speak var(--voice-seconds, 2.8s) ease-in-out infinite; }
.voice-orb-dash { animation: voice-orb-dash var(--voice-seconds, 2.8s) linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .voice-orb-breathe, .voice-orb-spin, .voice-orb-speak, .voice-orb-dash { animation: none; }
}`

export function clampVoiceSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 1
  return Math.min(2.5, Math.max(0.25, speed))
}

export function clampVoiceIntensity(intensity: number): number {
  if (!Number.isFinite(intensity)) return 0.5
  return Math.min(1, Math.max(0, intensity))
}

export function clampVoiceVolume(volume: number): number {
  if (!Number.isFinite(volume)) return 0
  return Math.min(1, Math.max(0, volume))
}

export function voiceOrbState(state: string | undefined): VoiceOrbState {
  if (state === "listen" || state === "think" || state === "speak" || state === "idle") return state
  return "idle"
}

/** 静止幅度来自 intensity。volume 只在 speak 上再加一截。 */
export function voiceOrbAmplitude(state: VoiceOrbState, volume: number, intensity: number): number {
  const level = clampVoiceIntensity(intensity)
  const rest = 0.75 + level * 0.25
  if (state !== "speak") return rest
  return rest + clampVoiceVolume(volume) * level * 0.25
}

function ListenRings({ radius, animate }: { radius: number; animate: boolean }) {
  return (
    <g className={animate ? "voice-orb-dash" : undefined} fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round">
      <circle cx="80" cy="80" r={radius + 10} strokeDasharray="10 12" />
      <circle cx="80" cy="80" r={radius + 18} strokeDasharray="4 14" opacity="0.55" />
    </g>
  )
}

function ThinkDots({ animate }: { animate: boolean }) {
  return (
    <g className={animate ? "voice-orb-spin" : undefined}>
      {THINK_DOTS.map((dot) => (
        <circle key={dot.id} cx={dot.cx} cy={dot.cy} r="4.5" fill="var(--foreground)" />
      ))}
    </g>
  )
}

function SpeakBars({ amplitude, animate }: { amplitude: number; animate: boolean }) {
  return (
    <g className={animate ? "voice-orb-speak" : undefined} fill="var(--primary-foreground)">
      {SPEAK_BARS.map((bar, index) => {
        const height = 8 + amplitude * 20 * bar.weight
        return <rect key={bar.id} x={59.5 + index * 9} y={80 - height / 2} width="5" height={height} rx="2.5" />
      })}
    </g>
  )
}

function OrbGraphic({ state, amplitude, animate }: { state: VoiceOrbState; amplitude: number; animate: boolean }) {
  const radius = 26 + amplitude * 16
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40" aria-hidden="true" data-animated={animate ? "on" : "off"}>
      <circle
        data-orb="body"
        cx="80"
        cy="80"
        r={radius}
        className={animate && state === "idle" ? "voice-orb-breathe" : undefined}
        fill="var(--primary)"
      />
      <circle cx="80" cy="80" r={radius * 0.42} fill="var(--foreground)" opacity="0.2" />
      {state === "listen" ? <ListenRings radius={radius} animate={animate} /> : null}
      {state === "think" ? <ThinkDots animate={animate} /> : null}
      {state === "speak" ? <SpeakBars amplitude={amplitude} animate={animate} /> : null}
    </svg>
  )
}

export function VoiceOrb({
  state = "idle",
  volume = 0,
  speed = 1,
  intensity = 0.5,
  className,
}: VoiceOrbProps) {
  const reduced = usePrefersReducedMotion()
  const mode = voiceOrbState(state)
  const amplitude = voiceOrbAmplitude(mode, volume, intensity)
  const tuned = clampVoiceSpeed(speed)
  return (
    <div
      data-slot="voice-orb"
      data-state={mode}
      data-amplitude={amplitude}
      data-motion={reduced ? "still" : "run"}
      className={cn("inline-flex flex-col items-center gap-2 text-foreground", className)}
      style={{ "--voice-seconds": `${(2.8 / tuned).toFixed(2)}s` } as CSSProperties}
    >
      <style>{ORB_CSS}</style>
      <OrbGraphic state={mode} amplitude={amplitude} animate={!reduced} />
      <p className="text-sm text-muted-foreground" role="status">
        {LABELS[mode]}
      </p>
    </div>
  )
}
