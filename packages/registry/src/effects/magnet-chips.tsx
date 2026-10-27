"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface MagnetChip {
  id: string
  label: string
}

export interface MagnetChipsProps {
  chips?: readonly MagnetChip[]
  onSnap?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_CHIPS: readonly MagnetChip[] = [
  { id: "design", label: "设计" },
  { id: "build", label: "工程" },
  { id: "research", label: "研究" },
]

interface Origin {
  id: string
  x: number
  y: number
}

interface Snap {
  id: string
  from: number
}

function MagnetChips({
  chips = DEFAULT_CHIPS,
  onSnap,
  color,
  size = 36,
  duration = 420,
  className,
}: MagnetChipsProps) {
  const reduced = usePrefersReducedMotion()
  const [waiting, setWaiting] = useState<readonly MagnetChip[]>(chips)
  const [placed, setPlaced] = useState<readonly MagnetChip[]>([])
  const [drag, setDrag] = useState<Origin | null>(null)
  const [snap, setSnap] = useState<Snap | null>(null)
  const [offset, setOffset] = useState(0)
  const zoneRef = useRef<HTMLDivElement>(null)
  const origin = useRef<Origin | null>(null)
  const snapRef = useRef<Snap | null>(null)
  const done = useRef(new Set<string>())
  const onSnapRef = useRef(onSnap)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const sizeRef = useRef(size)
  const accent = color ?? "var(--primary)"

  useEffect(() => {
    onSnapRef.current = onSnap
    reducedRef.current = reduced
    durationRef.current = duration
    sizeRef.current = size
  })

  function commit(id: string) {
    if (done.current.has(id)) return
    done.current.add(id)
    onSnapRef.current?.(id)
  }

  useEffect(() => {
    const current = snapRef.current
    if (!current) return
    const from = current.from
    let last = 0
    let elapsed = 0
    let raf = 0
    const step = (now: number) => {
      const active = snapRef.current
      if (!active) return
      if (reducedRef.current) {
        snapRef.current = null
        setOffset(0)
        setSnap(null)
        commit(active.id)
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      elapsed += dt
      const t = Math.min(1, elapsed / Math.max(120, durationRef.current))
      const eased = 1 - (1 - t) * (1 - t)
      if (t >= 1) {
        snapRef.current = null
        setOffset(0)
        setSnap(null)
        commit(active.id)
        return
      }
      setOffset(from * (1 - eased))
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [snap])

  function accept(id: string) {
    if (done.current.has(id) || snapRef.current?.id === id) return
    const chip = waiting.find((item) => item.id === id)
    if (!chip) return
    const previous = snapRef.current
    if (previous) commit(previous.id)
    setWaiting((prev) => prev.filter((item) => item.id !== id))
    setPlaced((prev) => (prev.some((item) => item.id === id) ? prev : [...prev, chip]))
    if (reducedRef.current) {
      snapRef.current = null
      setSnap(null)
      setOffset(0)
      commit(id)
      return
    }
    const from = -Math.round(Math.max(28, sizeRef.current))
    const next = { id, from }
    snapRef.current = next
    setOffset(from)
    setSnap(next)
  }

  function insideZone(event: ReactPointerEvent, start: Origin) {
    const rect = zoneRef.current?.getBoundingClientRect()
    if (rect && rect.width > 0 && rect.height > 0) {
      return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
    }
    return event.clientY - start.y > 28
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const next = { id, x: event.clientX, y: event.clientY }
    origin.current = next
    setDrag({ id, x: 0, y: 0 })
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    if (!start) return
    setDrag({ id: start.id, x: event.clientX - start.x, y: event.clientY - start.y })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    origin.current = null
    setDrag(null)
    if (!start) return
    if (!insideZone(event, start)) return
    accept(start.id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key !== "Enter" && event.key !== "ArrowDown") return
    event.preventDefault()
    accept(id)
  }

  return (
    <div className={cn("w-full max-w-md", className)} data-reduced={reduced ? "true" : undefined} data-slot="magnet-chips">
      <div className="flex flex-wrap gap-2">
        {waiting.map((chip) => {
          const pulling = drag?.id === chip.id
          return (
            <button
              className={cn(
                "touch-none rounded-full border bg-card px-3 text-sm text-card-foreground select-none motion-reduce:transition-none",
                pulling ? "relative z-10 transition-none" : "transition-transform",
              )}
              key={chip.id}
              onKeyDown={(event) => onKeyDown(event, chip.id)}
              onPointerCancel={() => {
                origin.current = null
                setDrag(null)
              }}
              onPointerDown={(event) => onPointerDown(event, chip.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                borderColor: accent,
                height: size,
                transform: pulling && drag ? `translate(${drag.x}px, ${drag.y}px)` : undefined,
              }}
              type="button"
            >
              {chip.label}
            </button>
          )
        })}
      </div>
      <div
        aria-label="对齐区域"
        className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-dashed bg-muted/40 p-3"
        data-zone="true"
        ref={zoneRef}
        role="region"
        style={{ borderColor: accent, minHeight: Math.round(size * 3.2) }}
      >
        {placed.length === 0 ? <p className="text-muted-foreground text-sm">拖进这里，芯片会对齐</p> : null}
        {placed.map((chip) => {
          const snapping = snap?.id === chip.id
          return (
            <div
              className="rounded-full border bg-card px-3 text-sm text-card-foreground motion-reduce:transition-none"
              data-placed="true"
              data-snapping={snapping ? "true" : undefined}
              key={chip.id}
              style={{
                borderColor: accent,
                height: size,
                lineHeight: `${size}px`,
                transform: snapping ? `translateY(${offset}px)` : undefined,
              }}
            >
              {chip.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { MagnetChips }
