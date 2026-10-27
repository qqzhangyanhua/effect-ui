"use client"

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/cn"

export interface TossCard {
  id: string
  title: string
  detail: string
}

export interface CardTossStackProps {
  cards?: readonly TossCard[]
  onToss?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  fling?: number
  className?: string
}

const DEFAULT_CARDS: readonly TossCard[] = [
  { id: "draft", title: "草案", detail: "先把范围写清楚" },
  { id: "review", title: "评审", detail: "找一个人看一眼" },
  { id: "ship", title: "发布", detail: "合进去再看效果" },
]

interface Origin {
  x: number
  y: number
  t: number
}

interface Flight {
  id: string
  x: number
  y: number
  vx: number
  vy: number
}

function CardTossStack({
  cards = DEFAULT_CARDS,
  onToss,
  color,
  size = 280,
  duration = 700,
  fling = 0.8,
  className,
}: CardTossStackProps) {
  const reduced = usePrefersReducedMotion()
  const [pile, setPile] = useState<readonly TossCard[]>(cards)
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [pose, setPose] = useState({ x: 0, y: 0 })
  const [ghost, setGhost] = useState<TossCard | null>(null)
  const origin = useRef<Origin | null>(null)
  const flight = useRef<Flight | null>(null)
  const done = useRef(new Set<string>())
  const onTossRef = useRef(onToss)
  const reducedRef = useRef(reduced)
  const durationRef = useRef(duration)
  useEffect(() => {
    onTossRef.current = onToss
    reducedRef.current = reduced
    durationRef.current = duration
  })
  const accent = color ?? "var(--primary)"
  const top = pile[0]

  function finish(id: string) {
    if (done.current.has(id)) return
    done.current.add(id)
    flight.current = null
    setGhost(null)
    onTossRef.current?.(id)
  }

  useEffect(() => {
    const current = flight.current
    if (!current) return
    if (reduced) {
      finish(current.id)
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
        finish(current.id)
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
      const stopped = Math.hypot(x, y) > 420 || elapsed >= durationRef.current || Math.hypot(vx, vy) < 0.05
      if (stopped) {
        finish(current.id)
        return
      }
      setPose({ x, y })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [ghost, reduced])

  function launch(card: TossCard, x: number, y: number, vx: number, vy: number) {
    setPile((prev) => prev.filter((item) => item.id !== card.id))
    setDrag({ x: 0, y: 0, active: false })
    if (reduced) {
      finish(card.id)
      return
    }
    const speed = Math.hypot(vx, vy) || 1
    const boost = speed < 1 ? 1.2 / speed : 1
    flight.current = { id: card.id, x, y, vx: vx * boost, vy: vy * boost }
    setPose({ x, y })
    setGhost(card)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (ghost || !top) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    origin.current = { x: event.clientX, y: event.clientY, t: event.timeStamp }
    setDrag({ x: 0, y: 0, active: true })
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    if (!start) return
    setDrag({ x: event.clientX - start.x, y: event.clientY - start.y, active: true })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = origin.current
    origin.current = null
    if (!start || !top) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    const dt = Math.max(16, event.timeStamp - start.t)
    const vx = dx / dt
    const vy = dy / dt
    if (Math.hypot(dx, dy) < 72 && Math.hypot(vx, vy) < fling) {
      setDrag({ x: 0, y: 0, active: false })
      return
    }
    launch(top, dx, dy, vx, vy)
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!top || ghost) return
    const vx = event.key === "ArrowLeft" ? -1.8 : event.key === "ArrowRight" ? 1.8 : 0
    const vy = event.key === "ArrowUp" ? -1.8 : event.key === "ArrowDown" ? 1.4 : 0
    if (vx === 0 && vy === 0) return
    event.preventDefault()
    launch(top, 0, 0, vx, vy)
  }

  return (
    <div
      className={cn("relative h-52", className)}
      data-reduced={reduced ? "true" : undefined}
      data-slot="card-toss-stack"
      style={{ width: size }}
    >
      {pile.length === 0 && ghost === null ? (
        <p className="text-muted-foreground absolute inset-0 grid place-items-center text-sm">没有卡片了</p>
      ) : null}
      {pile.slice(0, 3).map((card, index) => {
        const isTop = index === 0
        const x = isTop ? drag.x : 0
        const y = index * 10 + (isTop ? drag.y : 0)
        const style = {
          background: "var(--card)",
          borderColor: accent,
          color: "var(--card-foreground)",
          transform: `translate(${x}px, ${y}px) scale(${1 - index * 0.04})`,
          zIndex: 20 - index,
        }
        const face = (
          <>
            <span className="block text-base font-medium">{card.title}</span>
            <span className="text-muted-foreground mt-1 block text-sm">{card.detail}</span>
          </>
        )
        if (!isTop) {
          return (
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-36 rounded-2xl border px-4 py-3 shadow-md"
              key={card.id}
              style={style}
            >
              {face}
            </div>
          )
        }
        return (
          <button
            className={cn(
              "absolute inset-x-0 top-0 h-36 touch-none rounded-2xl border px-4 py-3 text-left shadow-md select-none",
              "motion-reduce:transition-none",
              drag.active || reduced ? "transition-none" : "transition-transform duration-300",
            )}
            key={card.id}
            onKeyDown={onKeyDown}
            onPointerCancel={() => {
              origin.current = null
              setDrag({ x: 0, y: 0, active: false })
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={style}
            type="button"
          >
            {face}
          </button>
        )
      })}
      {ghost ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-36 rounded-2xl border px-4 py-3 shadow-md motion-reduce:transition-none"
          data-flying="true"
          style={{
            background: "var(--card)",
            borderColor: accent,
            color: "var(--card-foreground)",
            transform: `translate(${pose.x}px, ${pose.y}px) rotate(${pose.x * 0.04}deg)`,
            zIndex: 30,
          }}
        >
          <span className="block text-base font-medium">{ghost.title}</span>
          <span className="text-muted-foreground mt-1 block text-sm">{ghost.detail}</span>
        </div>
      ) : null}
    </div>
  )
}

export { CardTossStack }
