"use client"

import { CinemaSeatPicker } from "../effects/cinema-seat-picker"
import { HologramCard } from "../effects/hologram-card"
import { LoomThreadsMarquee } from "../effects/loom-threads-marquee"
import { ProjectUpdateCard } from "../effects/project-update-card"
import { Scroll3dImageRotate } from "../effects/scroll-3d-image-rotate"
import { SeaWavesBackground } from "../effects/sea-waves-background"
import { ShaderGridWide } from "../effects/shader-grid-wide"
import { ShareInvitePanel } from "../effects/share-invite-panel"

import { ThumbnailFlowPath } from "../effects/thumbnail-flow-path"

export function LoomThreadsMarqueeDemo({ speed }: { speed?: number } = {}) {
  return <LoomThreadsMarquee className="w-full" speed={speed} />
}

export function HologramCardDemo({ duration, intensity, color }: { duration?: number; intensity?: number; color?: string } = {}) {
  return (
    <div className="flex w-full justify-center py-6">
      <HologramCard duration={duration} intensity={intensity} color={color} />
    </div>
  )
}
export function Scroll3dImageRotateDemo({
  angle,
  speed,
  intensity,
}: {
  angle?: number
  speed?: number
  intensity?: number
} = {}) {
  return <Scroll3dImageRotate className="w-full" angle={angle} speed={speed} intensity={intensity} />
}

export function ThumbnailFlowPathDemo({ duration, delay, size, gap }: { duration?: number; delay?: number; size?: number; gap?: number } = {}) {
  return <ThumbnailFlowPath className="w-full" duration={duration} delay={delay} size={size} gap={gap} />
}

export function ShaderGridWideDemo({
  intensity,
  speed,
  count,
  scale,
}: {
  intensity?: number
  speed?: number
  count?: number
  scale?: number
} = {}) {
  return <ShaderGridWide className="w-full" intensity={intensity} speed={speed} count={count} scale={scale} />
}

export function SeaWavesBackgroundDemo({
  intensity = 0.15,
  speed = 1,
  colors = ["#05142e", "#0d597a", "#dbe8f2"],
  scale = 1,
}: {
  intensity?: number
  speed?: number
  colors?: string[]
  scale?: number
} = {}) {
  return (
    <SeaWavesBackground className="w-full" intensity={intensity} speed={speed} colors={colors} scale={scale} />
  )
}

export function CinemaSeatPickerDemo() {
  return <CinemaSeatPicker className="w-full" />
}

export function ProjectUpdateCardDemo() {
  return <ProjectUpdateCard className="w-full" />
}

export function ShareInvitePanelDemo() {
  return <ShareInvitePanel className="w-full" />
}
