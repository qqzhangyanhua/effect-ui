"use client"

import { CardTossStack } from "../effects/card-toss-stack"
import { StickyNoteBoard } from "../effects/sticky-note-board"

export function CardTossStackDemo({
  color,
  size = 280,
  duration = 700,
}: {
  color?: string
  size?: number
  duration?: number
} = {}) {
  return (
    <div className="flex min-h-80 items-center justify-center px-6 py-10">
      <CardTossStack color={color} duration={duration} size={size} />
    </div>
  )
}

export function StickyNoteBoardDemo({
  color,
  size = 148,
  duration = 640,
  tilt = 12,
}: {
  color?: string
  size?: number
  duration?: number
  tilt?: number
} = {}) {
  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <StickyNoteBoard color={color} duration={duration} size={size} tilt={tilt} />
    </div>
  )
}
