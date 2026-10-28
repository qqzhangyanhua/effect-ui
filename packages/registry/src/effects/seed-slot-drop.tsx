"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { useAnimationActive } from "@/hooks/use-animation-active"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface SeedSlotDropProps {
  pace?: number
  intensity?: number
  slots?: number
  gap?: number
  className?: string
  onPlace?: (id: string, slot: number | null) => void
}

interface Seed {
  id: string
  label: string
}

const seeds: readonly Seed[] = [
  { id: "amber", label: "琥珀" },
  { id: "moss", label: "苔绿" },
  { id: "ink", label: "墨蓝" },
  { id: "clay", label: "陶土" },
]

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function rateOf(pace: number) {
  return Number.isFinite(pace) && pace > 0 ? pace : 1
}

function slotCountOf(slots: number) {
  return clamp(Math.round(slots), 2, 4)
}

function labelOf(id: string) {
  return seeds.find((seed) => seed.id === id)?.label ?? id
}

export function SeedSlotDrop({ pace = 1, intensity = 0.65, slots = 3, gap = 12, className, onPlace }: SeedSlotDropProps) {
  const ref = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Array<HTMLDivElement | null>>([])
  const pulseRef = useRef(0)
  const dragId = useRef<string | null>(null)
  const aimRef = useRef(-1)
  const moved = useRef(false)
  const origin = useRef({ x: 0, y: 0 })
  const liveRef = useRef(false)
  const onPlaceRef = useRef(onPlace)
  const reduced = usePrefersReducedMotion()
  const live = useAnimationActive(ref)
  const total = slotCountOf(slots)
  const gain = clamp(intensity, 0, 1)
  const rate = rateOf(pace)
  const space = clamp(gap, 0, 40)
  const radius = 48 + gain * 72
  const [assigned, setAssigned] = useState<Array<string | null>>(() => Array.from({ length: total }, () => null))
  const [widthEpoch, setWidthEpoch] = useState(total)
  const [aim, setAim] = useState(-1)
  const [picked, setPicked] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [phase, setPhase] = useState<"pool" | "dragging" | "snapped" | "complete">("pool")
  const [pulse, setPulse] = useState<"off" | "on">("off")
  const [spring, setSpring] = useState<"off" | "on">("off")
  const [message, setMessage] = useState("把词块放进空槽")

  if (widthEpoch !== total) {
    setWidthEpoch(total)
    setAssigned((current) => Array.from({ length: total }, (_, index) => current[index] ?? null))
  }

  useEffect(() => {
    onPlaceRef.current = onPlace
  }, [onPlace])

  useEffect(() => {
    liveRef.current = live
    if (live) return
    window.cancelAnimationFrame(pulseRef.current)
    pulseRef.current = 0
    queueMicrotask(() => {
      if (liveRef.current) return
      setSpring("off")
      setPulse("off")
    })
  }, [live])

  useEffect(() => {
    return () => window.cancelAnimationFrame(pulseRef.current)
  }, [])

  const filled = assigned.filter((id) => id !== null).length
  const pool = seeds.filter((seed) => !assigned.includes(seed.id))

  function nearest(x: number, y: number, id: string) {
    let best = -1
    let bestDist = radius
    for (let index = 0; index < total; index += 1) {
      const node = slotRefs.current[index]
      const held = assigned[index]
      if (!node || (held && held !== id)) continue
      const rect = node.getBoundingClientRect()
      const dist = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2))
      if (dist <= bestDist) {
        best = index
        bestDist = dist
      }
    }
    return best
  }

  function playSettle(full: boolean) {
    window.cancelAnimationFrame(pulseRef.current)
    pulseRef.current = 0
    if (reduced || !liveRef.current) {
      setSpring("off")
      setPulse("off")
      return
    }
    setSpring("on")
    setPulse(full ? "on" : "off")
    let left = Math.max(4, Math.round(8 / rate))
    const tick = () => {
      if (!liveRef.current) {
        setSpring("off")
        setPulse("off")
        pulseRef.current = 0
        return
      }
      left -= 1
      if (left <= 0) {
        setSpring("off")
        setPulse("off")
        pulseRef.current = 0
        return
      }
      pulseRef.current = window.requestAnimationFrame(tick)
    }
    pulseRef.current = window.requestAnimationFrame(tick)
  }

  function commit(id: string, slot: number | null) {
    const next = assigned.map((item) => (item === id ? null : item))
    if (slot !== null) {
      const occupied = next[slot]
      if (occupied && occupied !== id) {
        setPhase(assigned.some((item) => item !== null) ? "snapped" : "pool")
        setMessage("这个槽已经有词块")
        return
      }
      next[slot] = id
    }
    const full = next.every((item) => item !== null)
    setAssigned(next)
    setPhase(slot === null ? "pool" : full ? "complete" : "snapped")
    setMessage(slot === null ? `${labelOf(id)}回到池中` : full ? "全部填满" : `${labelOf(id)}放入槽 ${slot + 1}`)
    setPicked(null)
    const nextAim = slot ?? -1
    setAim(nextAim)
    aimRef.current = nextAim
    onPlaceRef.current?.(id, slot)
    if (slot === null) {
      window.cancelAnimationFrame(pulseRef.current)
      pulseRef.current = 0
      setSpring("off")
      setPulse("off")
      return
    }
    playSettle(full)
  }

  function onPointerDown(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (reduced || (event.button !== undefined && event.button !== 0)) return
    dragId.current = id
    moved.current = false
    origin.current = { x: event.clientX, y: event.clientY }
    setDragging(id)
    setPhase("dragging")
    if (typeof event.currentTarget.setPointerCapture === "function") {
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        // jsdom 里不一定能捕获指针。
      }
    }
  }

  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const id = dragId.current
    if (reduced || !id) return
    if (Math.hypot(event.clientX - origin.current.x, event.clientY - origin.current.y) > 3) moved.current = true
    const next = nearest(event.clientX, event.clientY, id)
    aimRef.current = next
    setAim(next)
  }

  function onPointerUp(event: PointerEvent<HTMLButtonElement>) {
    const id = dragId.current
    if (!id) return
    const didMove = moved.current
    dragId.current = null
    setDragging(null)
    if (!didMove) {
      setPhase(assigned.every((item) => item !== null) ? "complete" : assigned.some((item) => item !== null) ? "snapped" : "pool")
      return
    }
    const slot = nearest(event.clientX, event.clientY, id)
    aimRef.current = slot
    setAim(slot)
    if (slot >= 0) commit(id, slot)
    else if (assigned.includes(id)) commit(id, null)
    else setPhase(assigned.some((item) => item !== null) ? "snapped" : "pool")
  }

  function onChipClick(id: string) {
    if (moved.current) {
      moved.current = false
      return
    }
    setPicked(id)
    setMessage(`已选中${labelOf(id)}`)
  }

  function onSlotClick(index: number) {
    if (!picked) return
    commit(picked, index)
  }

  function onChipKey(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      const next = (aim + 1 + total) % total
      aimRef.current = next
      setAim(next)
    } else if (event.key === "ArrowLeft") {
      event.preventDefault()
      const next = (aim - 1 + total) % total
      aimRef.current = next
      setAim(next)
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (aim < 0) return
      commit(id, aim)
    }
  }

  return (
    <div
      ref={ref}
      data-slot="seed-slot-drop"
      data-ritual="seed-slot"
      data-pace={rate}
      data-intensity={gain}
      data-slots={total}
      data-gap={space}
      data-radius={Math.round(radius)}
      data-aim={aim}
      data-state={phase}
      data-pulse={pulse}
      data-spring={spring}
      data-filled={filled}
      data-motion={reduced ? "off" : "on"}
      data-live={live ? "on" : "off"}
      data-drag={dragging ?? ""}
      className={cn(
        "w-full max-w-xl rounded-3xl border border-border bg-card p-4 text-card-foreground motion-reduce:transition-none",
        className,
      )}
    >
      <div className="grid" style={{ gap: space, gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {assigned.map((id, index) => {
          const hot = aim === index
          return (
            <div
              key={index}
              ref={(node) => {
                slotRefs.current[index] = node
              }}
              data-slot-index={index}
              data-filled={id ?? ""}
              data-aim={hot ? "on" : "off"}
              onClick={() => onSlotClick(index)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center rounded-2xl border border-dashed px-2 py-2 text-sm motion-reduce:transition-none",
                hot ? "border-primary bg-muted" : "border-border bg-background",
              )}
            >
              {id ? (
                <>
                  <button
                    type="button"
                    data-seed={id}
                    className="touch-none rounded-full bg-primary px-3 py-1 text-primary-foreground motion-reduce:transition-none"
                    onPointerDown={(event) => onPointerDown(event, id)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    {labelOf(id)}
                  </button>
                  <button
                    type="button"
                    className="mt-1 text-xs text-muted-foreground underline"
                    aria-label={`取出${labelOf(id)}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      commit(id, null)
                    }}
                  >
                    取出
                  </button>
                </>
              ) : (
                <span className="text-muted-foreground">空槽 {index + 1}</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap" style={{ gap: space }} data-pool>
        {pool.map((seed) => (
          <button
            key={seed.id}
            type="button"
            data-seed={seed.id}
            data-picked={picked === seed.id ? "true" : "false"}
            onClick={() => onChipClick(seed.id)}
            onKeyDown={(event) => onChipKey(event, seed.id)}
            onPointerDown={(event) => onPointerDown(event, seed.id)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={cn(
              "touch-none rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
              picked === seed.id ? "border-primary" : "",
              dragging === seed.id ? "opacity-60" : "",
            )}
          >
            {seed.label}
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
  )
}
