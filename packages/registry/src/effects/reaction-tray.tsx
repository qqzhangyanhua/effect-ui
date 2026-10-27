"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TrayReaction {
  id: string
  emoji: string
  label: string
  count: number
}

export interface ReactionTrayProps {
  reactions?: readonly TrayReaction[]
  onReact?: (id: string, count: number) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_REACTIONS: readonly TrayReaction[] = [
  { id: "like", emoji: "👍", label: "赞", count: 2 },
  { id: "cheer", emoji: "🎉", label: "欢呼", count: 1 },
  { id: "idea", emoji: "💡", label: "灵感", count: 0 },
]

interface Pop {
  id: string
  t: number
}

function countsFrom(list: readonly TrayReaction[]): Record<string, number> {
  const next: Record<string, number> = {}
  for (const item of list) next[item.id] = item.count
  return next
}

function ReactionTray({
  reactions = DEFAULT_REACTIONS,
  onReact,
  color,
  size = 64,
  duration = 480,
  className,
}: ReactionTrayProps) {
  const reduced = usePrefersReducedMotion()
  const [counts, setCounts] = useState(() => countsFrom(reactions))
  const [pop, setPop] = useState<Pop | null>(null)
  const busy = useRef(false)
  const landed = useRef(false)
  const countsRef = useRef(counts)
  const onReactRef = useRef(onReact)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  const landRef = useRef<(id: string) => void>(() => {})
  useEffect(() => {
    countsRef.current = counts
    onReactRef.current = onReact
    reducedRef.current = reduced
    durationRef.current = duration
  })

  function land(id: string) {
    if (landed.current) return
    landed.current = true
    busy.current = false
    const next = (countsRef.current[id] ?? 0) + 1
    const merged = { ...countsRef.current, [id]: next }
    countsRef.current = merged
    setCounts(merged)
    setPop(null)
    onReactRef.current?.(id, next)
  }

  useEffect(() => {
    landRef.current = land
  })

  const popId = pop?.id ?? null

  useEffect(() => {
    if (reduced || popId === null) return
    let raf = 0
    let last = 0
    let elapsed = 0
    const step = (now: number) => {
      if (reducedRef.current) {
        landRef.current(popId)
        return
      }
      const dt = last === 0 ? 16 : Math.min(32, Math.max(0, now - last))
      last = now
      elapsed += dt
      const t = Math.min(1, elapsed / Math.max(1, durationRef.current))
      if (t >= 1) {
        landRef.current(popId)
        return
      }
      setPop({ id: popId, t })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [popId, reduced])

  const accent = color ?? "var(--primary)"
  const list = reactions

  function choose(id: string) {
    if (busy.current) return
    landed.current = false
    if (reducedRef.current) {
      land(id)
      return
    }
    busy.current = true
    setPop({ id, t: 0 })
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.repeat) return
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    choose(id)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    choose(id)
  }

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      data-reduced={reduced ? "true" : undefined}
      data-slot="reaction-tray"
      style={{ paddingTop: size }}
    >
      <p className="text-foreground text-sm font-medium">选一个回应</p>
      <div className="flex flex-wrap gap-3">
        {list.map((item) => {
          const count = counts[item.id] ?? item.count
          const flying = pop?.id === item.id ? pop : null
          const lift = flying ? -Math.sin(flying.t * Math.PI) * size * 0.85 : 0
          const scale = flying ? 1 + Math.sin(flying.t * Math.PI) * 0.7 : 1
          return (
            <button
              aria-label={`${item.label} ${count}`}
              className="bg-card text-card-foreground relative inline-flex touch-none items-center justify-center gap-1 rounded-full border px-3 shadow-sm select-none motion-reduce:transition-none"
              key={item.id}
              onKeyDown={(event) => onKeyDown(event, item.id)}
              onPointerUp={(event) => onPointerUp(event, item.id)}
              style={{ borderColor: accent, height: Math.round(size * 0.72), minWidth: size }}
              type="button"
            >
              <span aria-hidden className="text-lg">
                {item.emoji}
              </span>
              <span className="text-sm">{item.label}</span>
              <span
                className="rounded-full px-1.5 text-xs tabular-nums"
                data-count={count}
                style={{ background: accent, color: "var(--primary-foreground)" }}
              >
                {count}
              </span>
              {flying ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute text-2xl motion-reduce:transition-none"
                  data-popping="true"
                  style={{ transform: `translateY(${lift}px) scale(${scale})` }}
                >
                  {item.emoji}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { ReactionTray }
