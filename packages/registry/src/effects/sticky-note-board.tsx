"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface StickyNote {
  id: string
  text: string
  x: number
  y: number
}

export interface StickyNoteBoardProps {
  notes?: readonly StickyNote[]
  onMove?: (id: string, x: number, y: number) => void
  color?: string
  size?: number
  duration?: number
  tilt?: number
  className?: string
}

const DEFAULT_NOTES: readonly StickyNote[] = [
  { id: "title", text: "先写标题", x: 24, y: 28 },
  { id: "space", text: "留白", x: 168, y: 76 },
  { id: "later", text: "明天再改", x: 72, y: 168 },
]

interface Origin {
  x: number
  y: number
  nx: number
  ny: number
  t: number
}

interface Glide {
  id: string
  x: number
  y: number
  vx: number
  vy: number
}

function tiltOf(vx: number, gain: number) {
  return Math.max(-18, Math.min(18, vx * gain))
}

function nudge(key: string) {
  if (key === "ArrowLeft") return { x: -24, y: 0 }
  if (key === "ArrowRight") return { x: 24, y: 0 }
  if (key === "ArrowUp") return { x: 0, y: -24 }
  if (key === "ArrowDown") return { x: 0, y: 24 }
  return null
}

function StickyNoteBoard({
  notes = DEFAULT_NOTES,
  onMove,
  color,
  size = 148,
  duration = 640,
  tilt = 12,
  className,
}: StickyNoteBoardProps) {
  const reduced = usePrefersReducedMotion()
  const [board, setBoard] = useState<readonly StickyNote[]>(notes)
  const [dragId, setDragId] = useState<string | null>(null)
  const [glideId, setGlideId] = useState<string | null>(null)
  const [rotation, setRotation] = useState(0)
  const origin = useRef<Origin | null>(null)
  const glide = useRef<Glide | null>(null)
  const onMoveRef = useRef(onMove)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const tiltRef = useRef(tilt)
  useEffect(() => {
    onMoveRef.current = onMove
    reducedRef.current = reduced
    durationRef.current = duration
    tiltRef.current = tilt
  })
  const paperColor = color ?? "var(--card)"

  function settle(id: string, x: number, y: number) {
    glide.current = null
    setGlideId(null)
    setRotation(0)
    setBoard((prev) => prev.map((note) => (note.id === id ? { ...note, x, y } : note)))
    onMoveRef.current?.(id, x, y)
  }

  useEffect(() => {
    const current = glide.current
    if (!current) return
    if (reduced) {
      settle(current.id, current.x, current.y)
      return
    }
    let x = current.x
    let y = current.y
    let vx = current.vx
    let vy = current.vy
    let last = 0
    let elapsed = 0
    let raf = 0
    const step = (now: number) => {
      if (reducedRef.current) {
        settle(current.id, x, y)
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      elapsed += dt
      const keep = Math.exp(-dt / Math.max(120, durationRef.current))
      vx *= keep
      vy *= keep
      x += vx * dt
      y += vy * dt
      const speed = Math.hypot(vx, vy)
      if (speed < 0.08 || elapsed >= durationRef.current) {
        settle(current.id, x, y)
        return
      }
      setRotation(tiltOf(vx, tiltRef.current))
      setBoard((prev) => prev.map((note) => (note.id === current.id ? { ...note, x, y } : note)))
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [glideId, reduced])

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, note: StickyNote) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    if (glide.current) settle(glide.current.id, glide.current.x, glide.current.y)
    origin.current = { x: event.clientX, y: event.clientY, nx: note.x, ny: note.y, t: event.timeStamp }
    setDragId(note.id)
    setRotation(0)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    const start = origin.current
    if (!start || dragId !== id) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const dt = Math.max(16, event.timeStamp - start.t)
    setRotation(reduced ? 0 : tiltOf(dx / dt, tilt))
    setBoard((prev) => prev.map((note) => (note.id === id ? { ...note, x: start.nx + dx, y: start.ny + dy } : note)))
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    const start = origin.current
    origin.current = null
    setDragId(null)
    if (!start) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const x = start.nx + dx
    const y = start.ny + dy
    const dt = Math.max(16, event.timeStamp - start.t)
    if (dx === 0 && dy === 0) {
      setRotation(0)
      return
    }
    if (reduced) {
      settle(id, x, y)
      return
    }
    glide.current = { id, x, y, vx: dx / dt, vy: dy / dt }
    setBoard((prev) => prev.map((note) => (note.id === id ? { ...note, x, y } : note)))
    setGlideId(id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, note: StickyNote) {
    const step = nudge(event.key)
    if (!step) return
    event.preventDefault()
    settle(note.id, note.x + step.x, note.y + step.y)
  }

  return (
    <div
      className={cn("bg-muted/40 relative h-80 w-full overflow-hidden rounded-2xl", className)}
      data-reduced={reduced ? "true" : undefined}
      data-slot="sticky-note-board"
    >
      {board.map((note) => {
        const moving = dragId === note.id || glideId === note.id
        return (
          <button
            className={cn(
              "absolute touch-none rounded-sm px-3 py-2 text-left text-sm shadow-md select-none",
              "motion-reduce:transition-none",
              moving || reduced ? "transition-none" : "transition-transform duration-200",
            )}
            key={note.id}
            onKeyDown={(event) => onKeyDown(event, note)}
            onPointerCancel={() => {
              origin.current = null
              setDragId(null)
              setRotation(0)
            }}
            onPointerDown={(event) => onPointerDown(event, note)}
            onPointerMove={(event) => onPointerMove(event, note.id)}
            onPointerUp={(event) => onPointerUp(event, note.id)}
            style={{
              background: paperColor,
              color: "var(--card-foreground)",
              height: size * 0.8,
              left: note.x,
              top: note.y,
              transform: moving && note.id === (dragId ?? glideId) ? `rotate(${rotation}deg)` : undefined,
              width: size,
            }}
            type="button"
          >
            {note.text}
          </button>
        )
      })}
    </div>
  )
}

export { StickyNoteBoard }
