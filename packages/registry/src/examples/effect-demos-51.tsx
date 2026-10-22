"use client"

import { FolderStack } from "../effects/folder-stack"
import { MagnetChips } from "../effects/magnet-chips"
import { PhysicsDropzone } from "../effects/physics-dropzone"

export function MagnetChipsDemo({
  color,
  size = 36,
  duration = 420,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="mx-auto flex min-h-80 w-full max-w-xl items-center justify-center px-6 py-10">
      <MagnetChips color={color} duration={duration} size={size} />
    </div>
  )
}

export function FolderStackDemo({
  color,
  size = 176,
  duration = 480,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center overflow-hidden px-6 py-10">
      <FolderStack color={color} duration={duration} size={size} />
    </div>
  )
}

export function PhysicsDropzoneDemo({
  color,
  size = 280,
  duration = 560,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <PhysicsDropzone color={color} duration={duration} size={size} />
    </div>
  )
}
