"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

export interface TrashItem {
  id: string
  label: string
}

export interface TossToTrashProps {
  items?: readonly TrashItem[]
  onDelete?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  arc?: number
  className?: string
}

const DEFAULT_ITEMS: readonly TrashItem[] = [
  { id: "old", label: "旧稿" },
  { id: "dup", label: "重复" },
  { id: "stale", label: "过期" },
]

const DROP_DISTANCE = 64

interface Origin {
  x: number
  y: number
  t: number
}

interface Flight {
  id: string
  x: number
  y: number
  endX: number
  endY: number
  lift: number
}

function TossToTrash({
  items = DEFAULT_ITEMS,
  onDelete,
  color,
  size = 48,
  duration = 520,
  arc = 72,
  className,
}: TossToTrashProps) {
  const reduced = usePrefersReducedMotion()
  const [rows, setRows] = useState<readonly TrashItem[]>(items)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null)
  const [pose, setPose] = useState({ x: 0, y: 0 })
  const [flyId, setFlyId] = useState<string | null>(null)
  const origin = useRef<Origin | null>(null)
  const flight = useRef<Flight | null>(null)
  const trashRef = useRef<HTMLDivElement>(null)
  const done = useRef(new Set<string>())
  const onDeleteRef = useRef(onDelete)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  useEffect(() => {
    onDeleteRef.current = onDelete
    reducedRef.current = reduced
    durationRef.current = duration
  })
  const borderColor = color ?? "var(--destructive)"

  function finish(id: string) {
    if (done.current.has(id)) return
    done.current.add(id)
    flight.current = null
    setFlyId(null)
    setDrag(null)
    setRows((prev) => prev.filter((item) => item.id !== id))
    onDeleteRef.current?.(id)
  }

  useEffect(() => {
    const current = flight.current
    if (!current) return
    if (reduced) {
      finish(current.id)
      return
    }
    const startX = current.x
    const startY = current.y
    const endX = current.endX
    const endY = current.endY
    const lift = current.lift
    let last = 0
    let elapsed = 0
    let raf = 0
    const step = (now: number) => {
      if (reducedRef.current) {
        finish(current.id)
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      elapsed += dt
      const span = Math.max(80, durationRef.current)
      const progress = Math.min(1, elapsed / span)
      const x = startX + (endX - startX) * progress
      const y = startY + (endY - startY) * progress - Math.sin(Math.PI * progress) * lift
      if (progress >= 1) {
        finish(current.id)
        return
      }
      setPose({ x, y })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [flyId, reduced])

  function landing(from: HTMLElement) {
    const trash = trashRef.current?.getBoundingClientRect()
    const self = from.getBoundingClientRect()
    if (!trash || trash.width <= 0 || trash.height <= 0 || self.width <= 0 || self.height <= 0) return { x: 0, y: 180 }
    return {
      x: trash.left + trash.width / 2 - (self.left + self.width / 2),
      y: trash.top + trash.height / 2 - (self.top + self.height / 2),
    }
  }

  function launch(id: string, x: number, y: number, vy: number, from: HTMLElement) {
    setDrag(null)
    if (reduced) {
      finish(id)
      return
    }
    const end = landing(from)
    flight.current = { id, x, y, endX: end.x, endY: end.y, lift: arc + Math.max(0, -vy) * 12 }
    setPose({ x, y })
    setFlyId(id)
  }

  function overTrash(event: ReactPointerEvent<HTMLButtonElement>) {
    const rect = trashRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return false
    return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (flyId) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    origin.current = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    setDrag({ id, x: 0, y: 0 })
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    if (!start || !drag) return
    setDrag({ id: drag.id, x: event.clientX - start.x, y: event.clientY - start.y })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    const current = drag
    origin.current = null
    if (!start || !current) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const dt = Math.max(16, event.timeStamp - start.t)
    if (dy < DROP_DISTANCE && !overTrash(event)) {
      setDrag(null)
      return
    }
    launch(current.id, dx, dy, dy / dt, event.currentTarget)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (flyId) return
    if (event.key !== "Delete" && event.key !== "Backspace" && event.key !== "ArrowDown") return
    event.preventDefault()
    launch(id, 0, 0, 1, event.currentTarget)
  }

  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-4", className)} data-reduced={reduced ? "true" : undefined} data-slot="toss-to-trash">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((item) => {
          const flying = flyId === item.id
          const dragging = drag?.id === item.id
          const point = flying ? pose : dragging ? drag : null
          return (
            <li key={item.id}>
              <button
                className={cn(
                  "bg-card text-card-foreground w-full touch-none rounded-xl border px-3 text-left select-none",
                  "motion-reduce:transition-none",
                  dragging || flying || reduced ? "transition-none" : "transition-transform duration-200",
                )}
                data-item={item.id}
                onKeyDown={(event) => onKeyDown(event, item.id)}
                onPointerCancel={() => {
                  origin.current = null
                  setDrag(null)
                }}
                onPointerDown={(event) => onPointerDown(event, item.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                style={{
                  borderColor,
                  height: size,
                  transform: point ? `translate(${point.x}px, ${point.y}px)` : undefined,
                }}
                type="button"
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
      <div
        aria-label="垃圾桶"
        className="grid place-items-center rounded-2xl border border-dashed text-sm motion-reduce:transition-none"
        data-slot="toss-trash"
        ref={trashRef}
        style={{ borderColor, color: borderColor, height: size + 16 }}
      >
        垃圾桶
      </div>
    </div>
  )
}

export { TossToTrash }
