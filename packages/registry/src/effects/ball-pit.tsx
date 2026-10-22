"use client"

// 原创实现

import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react"
import Matter from "matter-js"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { cn } from "@/lib/utils"

const { Bodies, Body, Composite, Engine } = Matter

export interface BallPitPerson {
  id: string
  name: string
}

export interface BallPitProps {
  people?: readonly BallPitPerson[]
  onNudge?: (id: string) => void
  color?: string
  size?: number
  duration?: number
  className?: string
}

const DEFAULT_PEOPLE: readonly BallPitPerson[] = [
  { id: "lin", name: "林" },
  { id: "zhao", name: "赵" },
  { id: "chen", name: "陈" },
  { id: "wu", name: "吴" },
  { id: "he", name: "何" },
  { id: "xu", name: "徐" },
]

const BALL = 56

interface Anchor {
  x: number
  y: number
}

interface Piece {
  id: string
  body: Matter.Body
  anchor: Anchor
}

interface World {
  engine: Matter.Engine | null
  pieces: Piece[]
  raf: number
}

interface Latest {
  onNudge?: (id: string) => void
  people: readonly BallPitPerson[]
  duration: number
  size: number
}

function slot(index: number, size: number): Anchor {
  const col = index % 3
  const row = Math.floor(index / 3)
  return { x: Math.round(size / 4) * (col + 1), y: Math.round(size * 0.4) + row * 72 }
}

function ballStyle(at: Anchor, accent: string): CSSProperties {
  return {
    backgroundColor: accent,
    color: "var(--primary-foreground)",
    height: BALL,
    left: at.x - BALL / 2,
    top: at.y - BALL / 2,
    width: BALL,
  }
}

function BallPit({
  people = DEFAULT_PEOPLE,
  onNudge,
  color,
  size = 320,
  duration = 420,
  className,
}: BallPitProps) {
  const reduced = usePrefersReducedMotion()
  const accent = color ?? "var(--primary)"
  const rootRef = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLElement>())
  const world = useRef<World>({ engine: null, pieces: [], raf: 0 })
  const latest = useRef<Latest>({ onNudge, people, duration, size })

  useEffect(() => {
    latest.current = { onNudge, people, duration, size }
    const root = rootRef.current
    nodes.current.clear()
    if (!root) return
    for (const node of root.querySelectorAll("[data-piece]")) {
      if (!(node instanceof HTMLElement)) continue
      const id = node.dataset.piece
      if (id) nodes.current.set(id, node)
    }
  }, [duration, onNudge, people, size])

  useEffect(() => {
    if (reduced) return
    const engine = Engine.create({ enableSleeping: false, gravity: { scale: 0.0016, y: 1 } })
    const live = world.current
    live.engine = engine
    live.pieces = people.map((person, index) => {
      const anchor = slot(index, size)
      const body = Bodies.circle(anchor.x, anchor.y, BALL / 2, {
        density: 0.002,
        friction: 0.08,
        frictionAir: 28 / duration,
        restitution: 0.45,
      })
      return { id: person.id, body, anchor }
    })
    const thick = 36
    Composite.add(engine.world, [
      ...live.pieces.map((piece) => piece.body),
      Bodies.rectangle(size / 2, size + thick / 2 - 6, size + thick * 2, thick, { isStatic: true }),
      Bodies.rectangle(-thick / 2 + 4, size / 2, thick, size * 2, { isStatic: true }),
      Bodies.rectangle(size + thick / 2 - 4, size / 2, thick, size * 2, { isStatic: true }),
      Bodies.rectangle(size / 2, -thick / 2 + 4, size + thick * 2, thick, { isStatic: true }),
    ])
    const root = rootRef.current
    if (root) root.dataset.physics = "on"
    let last = 0
    const tick = (now: number) => {
      const box = world.current
      if (!box.engine) return
      const dt = last === 0 ? 16 : Math.min(16, Math.max(1, now - last))
      last = now
      const air = 28 / Math.max(120, latest.current.duration)
      for (const piece of box.pieces) piece.body.frictionAir = air
      Engine.update(box.engine, dt)
      for (const piece of box.pieces) {
        const el = nodes.current.get(piece.id)
        if (!el) continue
        const dx = piece.body.position.x - piece.anchor.x
        const dy = piece.body.position.y - piece.anchor.y
        el.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${piece.body.angle.toFixed(3)}rad)`
      }
      box.raf = requestAnimationFrame(tick)
    }
    live.raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(live.raf)
      live.raf = 0
      live.engine = null
      live.pieces = []
      if (root) delete root.dataset.physics
      Composite.clear(engine.world, false)
      Engine.clear(engine)
    }
  }, [duration, people, reduced, size])

  function nearest(x: number, y: number) {
    let best: { id: string; at: Anchor } | undefined
    let dist = Number.POSITIVE_INFINITY
    latest.current.people.forEach((person, index) => {
      const piece = world.current.pieces.find((item) => item.id === person.id)
      const at = piece ? { x: piece.body.position.x, y: piece.body.position.y } : slot(index, latest.current.size)
      const gap = Math.hypot(at.x - x, at.y - y)
      if (gap < dist) {
        dist = gap
        best = { id: person.id, at }
      }
    })
    if (!best || dist > BALL) return undefined
    return best
  }

  function nudge(id: string, vx: number, vy: number) {
    latest.current.onNudge?.(id)
    const piece = world.current.pieces.find((item) => item.id === id)
    if (piece && world.current.engine) {
      const gain = latest.current.duration / 420
      Body.setVelocity(piece.body, {
        x: piece.body.velocity.x + vx * 0.2 * gain,
        y: piece.body.velocity.y + vy * 0.2 * gain,
      })
      return
    }
    const el = nodes.current.get(id)
    if (!el) return
    const limit = latest.current.size
    el.dataset.nudged = "true"
    const left = Number.parseFloat(el.style.left || "0") + vx
    const top = Number.parseFloat(el.style.top || "0") + vy
    el.style.left = `${Math.max(4, Math.min(limit - BALL - 4, left))}px`
    el.style.top = `${Math.max(4, Math.min(limit - BALL - 4, top))}px`
  }

  function nudgeAt(x: number, y: number) {
    const hit = nearest(x, y)
    if (!hit) return
    const dx = hit.at.x - x
    const dy = hit.at.y - y
    const len = Math.hypot(dx, dy)
    const ux = len < 1 ? 1 : dx / len
    const uy = len < 1 ? 0 : dy / len
    nudge(hit.id, ux * 10, uy * 10)
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    nudgeAt(event.clientX - rect.left, event.clientY - rect.top)
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    nudgeAt(event.clientX - rect.left, event.clientY - rect.top)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const x = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
    const y = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0
    if (x === 0 && y === 0) return
    event.preventDefault()
    const first = latest.current.people[0]
    if (!first) return
    nudge(first.id, x * 12, y * 12)
  }

  return (
    <div
      aria-label="头像球池"
      className={cn(
        "relative touch-none rounded-3xl border border-foreground/15 bg-card/40 select-none shadow-inner outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current motion-reduce:transition-none",
        className,
      )}
      data-reduced={reduced ? "true" : undefined}
      data-slot="ball-pit"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      ref={rootRef}
      role="application"
      style={{ height: size, width: size }}
      tabIndex={0}
    >
      {people.map((person, index) => (
        <div
          className="pointer-events-none absolute grid place-items-center rounded-full text-sm font-medium shadow-md motion-reduce:transform-none"
          data-piece={person.id}
          key={person.id}
          style={ballStyle(slot(index, size), accent)}
        >
          {person.name}
        </div>
      ))}
      <p className="text-muted-foreground pointer-events-none absolute inset-x-0 top-full mt-2 text-center text-xs">
        移动指针或按方向键拨开
      </p>
    </div>
  )
}

export { BallPit }
