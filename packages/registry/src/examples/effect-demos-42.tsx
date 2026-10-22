"use client"

import { EmptyStateScene } from "../effects/empty-state-scene"
import { ReactionTray } from "../effects/reaction-tray"
import { UploadOrbit } from "../effects/upload-orbit"

export function UploadOrbitDemo({
  color,
  size = 320,
  duration = 1600,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <UploadOrbit color={color} duration={duration} size={size} />
    </div>
  )
}

export function EmptyStateSceneDemo({
  color,
  size = 320,
  duration = 2400,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <EmptyStateScene color={color} duration={duration} size={size} />
    </div>
  )
}

export function ReactionTrayDemo({
  color,
  size = 64,
  duration = 480,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-64 items-center justify-center px-6 py-10">
      <ReactionTray color={color} duration={duration} size={size} />
    </div>
  )
}
