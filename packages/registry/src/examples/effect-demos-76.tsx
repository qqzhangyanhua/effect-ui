"use client"

import { BreathExpandRing, type BreathPhases } from "../effects/breath-expand-ring"
import { EyedropLoupePick } from "../effects/eyedrop-loupe-pick"
import { HorizonSunScrub } from "../effects/horizon-sun-scrub"
import { MasonryDensityLive } from "../effects/masonry-density-live"
import { PerforateTicketTear } from "../effects/perforate-ticket-tear"
import { PresenceNameCursors } from "../effects/presence-name-cursors"

export function HorizonSunScrubDemo({
  pace = 1,
  intensity = 0.7,
  span = 0.8,
  snap = true,
}: {
  pace?: number
  intensity?: number
  span?: number
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <HorizonSunScrub pace={pace} intensity={intensity} span={span} snap={snap} />
    </div>
  )
}

export function BreathExpandRingDemo({
  pace = 1,
  intensity = 0.65,
  phases = "4-2-6-2",
  loops = true,
}: {
  pace?: number
  intensity?: number
  phases?: BreathPhases
  loops?: boolean
} = {}) {
  return (
    <div className="w-full max-w-sm px-6 py-10">
      <BreathExpandRing pace={pace} intensity={intensity} phases={phases} loops={loops} />
    </div>
  )
}

export function PresenceNameCursorsDemo({
  pace = 1,
  intensity = 0.6,
  count = 4,
  trail = true,
}: {
  pace?: number
  intensity?: number
  count?: number
  trail?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <PresenceNameCursors pace={pace} intensity={intensity} count={count} trail={trail} />
    </div>
  )
}

export function EyedropLoupePickDemo({
  pace = 1,
  intensity = 0.6,
  grid = 3,
  snap = true,
}: {
  pace?: number
  intensity?: number
  grid?: number
  snap?: boolean
} = {}) {
  return (
    <div className="w-full max-w-md px-6 py-10">
      <EyedropLoupePick pace={pace} intensity={intensity} grid={grid} snap={snap} />
    </div>
  )
}

export function PerforateTicketTearDemo({
  pace = 1,
  intensity = 0.65,
  threshold = 0.45,
  axis = "vertical",
}: {
  pace?: number
  intensity?: number
  threshold?: number
  axis?: "vertical" | "horizontal"
} = {}) {
  return (
    <div className="w-full max-w-sm px-6 py-10">
      <PerforateTicketTear pace={pace} intensity={intensity} threshold={threshold} axis={axis} />
    </div>
  )
}

export function MasonryDensityLiveDemo({
  pace = 1,
  intensity = 0.65,
  size = 128,
  gap = 12,
  padding = 16,
  columns = 3,
}: {
  pace?: number
  intensity?: number
  size?: number
  gap?: number
  padding?: number
  columns?: number
} = {}) {
  return (
    <div className="w-full max-w-lg px-6 py-10">
      <MasonryDensityLive pace={pace} intensity={intensity} size={size} gap={gap} padding={padding} columns={columns} />
    </div>
  )
}
